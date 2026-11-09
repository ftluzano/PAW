import { createClient, type Client } from '@libsql/client';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { env } from 'node:process';
import type { AdoptionApplication, ApplicationStatus } from '../src/types.ts';

type ApiRequest = IncomingMessage & { body?: unknown };
type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse;
  json: (body: Record<string, unknown>) => void;
};
type ServiceAccount = { project_id?: string; client_email?: string; private_key?: string };

const ADMIN_APP_NAME = 'paw-admin-role-sync';
const APPLICATION_STATUSES = new Set<ApplicationStatus>([
  'Submitted', 'Under Review', 'Meet & Greet Scheduled', 'Approved', 'Declined',
]);
let dbClient: Client | undefined;

function sendJson(response: ApiResponse, status: number, body: Record<string, unknown>): void {
  response.setHeader('Cache-Control', 'no-store');
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
    throw new Error('Turso is not configured.');
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

async function getIdentity(request: ApiRequest): Promise<DecodedIdToken | null> {
  const authorization = request.headers.authorization;
  const bearer = Array.isArray(authorization) ? authorization[0] : authorization;
  const token = bearer?.toLowerCase().startsWith('bearer ') ? bearer.slice(7).trim() : '';
  if (!token) return null;
  try {
    return await getAdminAuth().verifyIdToken(token, true);
  } catch {
    return null;
  }
}

function isAdmin(identity: DecodedIdToken): boolean {
  const uidAllowed = parseList(env.ADMIN_UIDS).has(identity.uid);
  const emailAllowed = Boolean(identity.email_verified && identity.email &&
    parseList(env.ADMIN_EMAILS, true).has(identity.email.toLowerCase()));
  return uidAllowed || emailAllowed || identity.admin === true || identity.role === 'admin';
}

function isStaff(identity: DecodedIdToken): boolean {
  return identity.staff === true || identity.role === 'staff';
}

async function ensureSchema(client: Client): Promise<void> {
  await client.batch([
    'CREATE TABLE IF NOT EXISTS paw_adoption_applications (id TEXT PRIMARY KEY NOT NULL, applicant_id TEXT NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS paw_workspace_state (id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1), records_cleared INTEGER NOT NULL, updated_at TEXT NOT NULL)',
  ], 'write');
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

function validateApplication(value: unknown): AdoptionApplication | null {
  if (!value || typeof value !== 'object') return null;
  const application = value as Partial<AdoptionApplication>;
  if (typeof application.id !== 'string' || application.id.length < 1 || application.id.length > 120) return null;
  if (typeof application.petId !== 'string' || application.petId.length > 120) return null;
  if (typeof application.petName !== 'string' || application.petName.length > 160) return null;
  if (typeof application.applicantId !== 'string' || application.applicantId.length > 160) return null;
  if (typeof application.applicantName !== 'string' || application.applicantName.trim().length < 1 || application.applicantName.length > 160) return null;
  if (typeof application.applicantEmail !== 'string' || application.applicantEmail.length > 240) return null;
  if (typeof application.applicantPhone !== 'string' || application.applicantPhone.length > 80) return null;
  if (!['House with yard', 'Apartment', 'Condo', 'Townhouse', 'Rural/Farm'].includes(application.homeType || '')) return null;
  if (!['Own', 'Rent'].includes(application.ownOrRent || '')) return null;
  if (typeof application.hasOtherPets !== 'boolean') return null;
  if (application.otherPetsDetails !== undefined && (typeof application.otherPetsDetails !== 'string' || application.otherPetsDetails.length > 1000)) return null;
  if (typeof application.hoursAloneDaily !== 'number' || !Number.isInteger(application.hoursAloneDaily) || application.hoursAloneDaily < 0 || application.hoursAloneDaily > 16) return null;
  if (typeof application.petExperience !== 'string' || application.petExperience.trim().length < 1 || application.petExperience.length > 4000) return null;
  if (typeof application.motivation !== 'string' || application.motivation.trim().length < 1 || application.motivation.length > 4000) return null;
  if (!APPLICATION_STATUSES.has(application.status as ApplicationStatus)) return null;
  if (typeof application.submissionDate !== 'string') return null;

  return application as AdoptionApplication;
}

async function readApplications(client: Client): Promise<AdoptionApplication[]> {
  const result = await client.execute('SELECT payload FROM paw_adoption_applications ORDER BY updated_at DESC');
  return result.rows.flatMap((row) => {
    try {
      const application = validateApplication(JSON.parse(String(row.payload)));
      return application ? [application] : [];
    } catch {
      return [];
    }
  });
}

async function readApplicantApplications(client: Client, applicantId: string): Promise<AdoptionApplication[]> {
  const result = await client.execute({
    sql: 'SELECT payload FROM paw_adoption_applications WHERE applicant_id = ? ORDER BY updated_at DESC',
    args: [applicantId],
  });
  return result.rows.flatMap((row) => {
    try {
      const application = validateApplication(JSON.parse(String(row.payload)));
      return application ? [application] : [];
    } catch {
      return [];
    }
  });
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  try {
    const identity = await getIdentity(request);
    if (!identity) return sendJson(response, 401, { error: 'Sign in before using adoption applications.' });

    const client = getDatabase();
    await ensureSchema(client);

    if (request.method === 'GET') {
      const state = await client.execute('SELECT records_cleared FROM paw_workspace_state WHERE id = 1');
      return sendJson(response, 200, {
        applications: isAdmin(identity) || isStaff(identity)
          ? await readApplications(client)
          : await readApplicantApplications(client, identity.uid),
        recordsCleared: Number(state.rows[0]?.records_cleared || 0) === 1,
      });
    }

    if (request.method === 'DELETE') {
      if (!isAdmin(identity)) return sendJson(response, 403, { error: 'Admin access required.' });
      await client.batch([
        'DELETE FROM paw_adoption_applications',
        "INSERT INTO paw_workspace_state (id, records_cleared, updated_at) VALUES (1, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET records_cleared = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')",
      ], 'write');
      return sendJson(response, 200, { cleared: true });
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST, DELETE');
      return sendJson(response, 405, { error: 'Method not allowed.' });
    }

    const body = parseBody(request.body);
    const application = validateApplication(body?.application);
    if (!application) return sendJson(response, 400, { error: 'The adoption application is incomplete or invalid.' });

    if (body?.action === 'submit') {
      if (application.applicantId !== identity.uid) return sendJson(response, 403, { error: 'Application identity does not match the signed-in user.' });
    } else if (body?.action === 'upsert') {
      if (!isAdmin(identity)) return sendJson(response, 403, { error: 'Admin access required.' });
    } else {
      return sendJson(response, 400, { error: 'Unsupported application action.' });
    }

    await client.execute({
      sql: 'INSERT INTO paw_adoption_applications (id, applicant_id, payload, updated_at) VALUES (?, ?, ?, strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')) ON CONFLICT(id) DO UPDATE SET applicant_id = excluded.applicant_id, payload = excluded.payload, updated_at = excluded.updated_at',
      args: [application.id, application.applicantId, JSON.stringify(application)],
    });
    return sendJson(response, 200, { saved: true, application });
  } catch (error) {
    console.error('adoption-applications API error:', error);
    return sendJson(response, 500, { error: 'Adoption applications are temporarily unavailable.' });
  }
}
