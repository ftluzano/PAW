import { createClient, type Client } from '@libsql/client';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { env } from 'node:process';
import type { Animal, AnimalStatus } from '../src/types.ts';

type ApiRequest = IncomingMessage & { body?: unknown };
type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse;
  json: (body: Record<string, unknown>) => void;
  end: () => void;
};
type ServiceAccount = { project_id?: string; client_email?: string; private_key?: string };
type PetPost = Pick<Animal,
  'id' | 'name' | 'species' | 'breed' | 'age' | 'ageCategory' | 'gender' |
  'weightLbs' | 'size' | 'photoUrl' | 'story' | 'temperament' | 'neuteredSpayed'
>;

const ADMIN_APP_NAME = 'paw-admin-role-sync';
const MAX_IMAGE_LENGTH = 3_500_000;
const PUBLIC_STATUSES = new Set<AnimalStatus>(['Listed for Adoption', 'Application', 'Review & Match']);
let dbClient: Client | undefined;

function sendJson(response: ApiResponse, status: number, body: Record<string, unknown>, headers: Record<string, string> = {}): void {
  response.setHeader('Cache-Control', 'no-store');
  for (const [name, value] of Object.entries(headers)) response.setHeader(name, value);
  response.status(status).json(body);
}

function parseList(value: string | undefined, lowercase = false): Set<string> {
  return new Set((value || '').split(/[\s,;]+/).map((part) => {
    const normalized = part.trim();
    return lowercase ? normalized.toLowerCase() : normalized;
  }).filter(Boolean));
}

function getDatabase(): Client {
  if (dbClient) return dbClient;
  if (!env.TURSO_DATABASE_URL || !env.TURSO_AUTH_TOKEN) {
    throw new Error('Turso is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.');
  }
  dbClient = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });
  return dbClient;
}

function getAdminAuth() {
  const rawServiceAccount = env.FIREBASE_SERVICE_ACCOUNT;
  if (!rawServiceAccount) throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.');
  const serviceAccount = JSON.parse(rawServiceAccount) as ServiceAccount;
  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing required fields.');
  }
  const app = getApps().find((candidate) => candidate.name === ADMIN_APP_NAME) || initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
  }, ADMIN_APP_NAME);
  return getAuth(app);
}

async function ensureSchema(client: Client): Promise<void> {
  await client.batch([
    'CREATE TABLE IF NOT EXISTS paw_public_posts (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS paw_public_post_state (id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1), initialized INTEGER NOT NULL, updated_at TEXT NOT NULL)',
  ], 'write');
}

function validatePost(value: unknown): PetPost | null {
  if (!value || typeof value !== 'object') return null;
  const post = value as Partial<PetPost>;
  if (typeof post.id !== 'string' || post.id.length > 100) return null;
  if (typeof post.name !== 'string' || post.name.length > 120) return null;
  if (!['Dog', 'Cat', 'Other'].includes(post.species || '')) return null;
  if (typeof post.breed !== 'string' || post.breed.length > 160) return null;
  if (typeof post.age !== 'string' || post.age.length > 80) return null;
  if (!['Puppy/Kitten', 'Young', 'Adult', 'Senior'].includes(post.ageCategory || '')) return null;
  if (!['Male', 'Female'].includes(post.gender || '')) return null;
  if (typeof post.weightLbs !== 'number' || !Number.isFinite(post.weightLbs) || post.weightLbs < 0 || post.weightLbs > 500) return null;
  if (!['Small', 'Medium', 'Large'].includes(post.size || '')) return null;
  if (typeof post.photoUrl !== 'string' || post.photoUrl.length > MAX_IMAGE_LENGTH) return null;
  if (!post.photoUrl.startsWith('data:image/') && !post.photoUrl.startsWith('https://') && !post.photoUrl.startsWith('/')) return null;
  if (typeof post.story !== 'string' || post.story.length > 4000) return null;
  if (!Array.isArray(post.temperament) || post.temperament.length > 30 || post.temperament.some((trait) => typeof trait !== 'string' || trait.length > 80)) return null;
  if (typeof post.neuteredSpayed !== 'boolean') return null;

  return {
    id: post.id,
    name: post.name,
    species: post.species,
    breed: post.breed,
    age: post.age,
    ageCategory: post.ageCategory,
    gender: post.gender,
    weightLbs: post.weightLbs,
    size: post.size,
    photoUrl: post.photoUrl,
    story: post.story,
    temperament: post.temperament,
    neuteredSpayed: post.neuteredSpayed,
  } as PetPost;
}

async function requireAdmin(request: ApiRequest): Promise<boolean> {
  const authorization = request.headers.authorization;
  const bearer = Array.isArray(authorization) ? authorization[0] : authorization;
  const token = bearer?.toLowerCase().startsWith('bearer ') ? bearer.slice(7).trim() : '';
  if (!token) return false;

  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(token, true);
  const uidAllowed = parseList(env.ADMIN_UIDS).has(decoded.uid);
  const emailAllowed = Boolean(decoded.email_verified && decoded.email &&
    parseList(env.ADMIN_EMAILS, true).has(decoded.email.toLowerCase()));
  return uidAllowed || emailAllowed;
}

function parseBody(body: unknown): Record<string, unknown> | null {
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as unknown;
      return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
    } catch {
      return null;
    }
  }
  return body && typeof body === 'object' ? body as Record<string, unknown> : null;
}

async function readPosts(client: Client): Promise<PetPost[]> {
  const result = await client.execute('SELECT payload FROM paw_public_posts ORDER BY id');
  return result.rows.flatMap((row) => {
    try {
      const post = validatePost(JSON.parse(String(row.payload)));
      return post ? [post] : [];
    } catch {
      return [];
    }
  });
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const client = getDatabase();
    await ensureSchema(client);

    if (request.method === 'GET') {
      const state = await client.execute('SELECT initialized, updated_at FROM paw_public_post_state WHERE id = 1');
      const initialized = Number(state.rows[0]?.initialized || 0) === 1;
      const updatedAt = String(state.rows[0]?.updated_at || 'not-initialized');
      const postCount = initialized ? await client.execute('SELECT COUNT(*) AS count FROM paw_public_posts') : null;
      const etag = `"${updatedAt}-${Number(postCount?.rows[0]?.count || 0)}"`;
      const requestEtag = request.headers['if-none-match'];
      const requestedEtags = Array.isArray(requestEtag) ? requestEtag : [requestEtag];
      if (requestedEtags.includes(etag)) {
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('ETag', etag);
        response.status(304).end();
        return;
      }
      const posts = initialized ? await readPosts(client) : [];
      return sendJson(response, 200, { initialized, posts }, { ETag: etag });
    }

    if (request.method === 'POST' || request.method === 'DELETE') {
      if (!await requireAdmin(request)) return sendJson(response, 403, { error: 'Admin access required.' });

      if (request.method === 'DELETE') {
        await client.batch([
          'DELETE FROM paw_public_posts',
          "INSERT INTO paw_public_post_state (id, initialized, updated_at) VALUES (1, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET initialized = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')",
        ], 'write');
        return sendJson(response, 200, { cleared: true });
      }

      const body = parseBody(request.body);
      if (body?.action === 'initialize') {
        const state = await client.execute('SELECT initialized FROM paw_public_post_state WHERE id = 1');
        if (state.rows[0]?.initialized === 1) return sendJson(response, 200, { initialized: true });
        const posts = Array.isArray(body.posts) ? body.posts.map(validatePost) : [];
        if (posts.some((post) => !post)) return sendJson(response, 400, { error: 'One or more initial pet posts are invalid.' });
        const inserts = posts.map((post) => ({
          sql: 'INSERT OR IGNORE INTO paw_public_posts (id, payload, updated_at) VALUES (?, ?, datetime(\'now\'))',
          args: [post!.id, JSON.stringify(post)],
        }));
        await client.batch([
          ...inserts,
          { sql: "INSERT INTO paw_public_post_state (id, initialized, updated_at) VALUES (1, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET initialized = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')", args: [] },
        ], 'write');
        return sendJson(response, 200, { initialized: true });
      }

      if (body?.action === 'upsert') {
        const post = validatePost(body.post);
        if (!post) return sendJson(response, 400, { error: 'Pet post is invalid or its image is too large.' });
        await client.execute({
          sql: "INSERT INTO paw_public_posts (id, payload, updated_at) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')",
          args: [post.id, JSON.stringify(post)],
        });
        await client.execute({
          sql: "INSERT INTO paw_public_post_state (id, initialized, updated_at) VALUES (1, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET initialized = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')",
        });
        return sendJson(response, 200, { saved: true, post });
      }

      return sendJson(response, 400, { error: 'Unsupported action.' });
    }

    response.setHeader('Allow', 'GET, POST, DELETE');
    return sendJson(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error('pet-posts API error:', error);
    return sendJson(response, 500, { error: 'Pet posts are temporarily unavailable.' });
  }
}
