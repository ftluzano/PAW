import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from 'node:process';

type ServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

const ADMIN_APP_NAME = 'paw-admin-role-sync';

function jsonResponse(status: number, body: Record<string, unknown>, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

function parseAdminEmails(): Set<string> {
  return new Set(
    (env.ADMIN_EMAILS || '')
      .split(/[\s,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function getAdminAuth() {
  const serviceAccountValue = env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountValue) throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.');

  let serviceAccount: ServiceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountValue) as ServiceAccount;
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT must contain valid service-account JSON.');
  }

  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing required fields.');
  }

  const app = getApps().find((candidate) => candidate.name === ADMIN_APP_NAME) || initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key?.replace(/\\n/g, '\n'),
    }),
  }, ADMIN_APP_NAME);

  return getAuth(app);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' }, { Allow: 'POST' });
  }

  const authorization = request.headers.get('authorization');
  const idToken = authorization?.toLowerCase().startsWith('bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';
  if (!idToken) return jsonResponse(401, { error: 'Sign in before syncing account access.' });

  const adminEmails = parseAdminEmails();
  if (adminEmails.size === 0) {
    return jsonResponse(200, { admin: false, configured: false });
  }

  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken, true);
    const email = decodedToken.email?.trim().toLowerCase();
    if (!email) return jsonResponse(403, { error: 'A verified email is required for account access.' });

    const userRecord = await auth.getUser(decodedToken.uid);
    const claims = { ...(userRecord.customClaims || {}) };
    const isAllowlistedAdmin = adminEmails.has(email);

    if (isAllowlistedAdmin && decodedToken.email_verified !== true) {
      return jsonResponse(403, { error: 'Verify the allowlisted email before admin access can be granted.' });
    }

    if (isAllowlistedAdmin) {
      await auth.setCustomUserClaims(decodedToken.uid, {
        ...claims,
        admin: true,
        role: 'admin',
      });
      return jsonResponse(200, { admin: true });
    }

    if (claims.admin === true || claims.role === 'admin') {
      delete claims.admin;
      if (claims.role === 'admin') {
        if (claims.staff === true) claims.role = 'staff';
        else delete claims.role;
      }
      await auth.setCustomUserClaims(decodedToken.uid, claims);
    }

    return jsonResponse(200, { admin: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    if (message.includes('FIREBASE_SERVICE_ACCOUNT')) {
      return jsonResponse(503, { error: message });
    }
    return jsonResponse(401, { error: 'Unable to verify this Firebase session.' });
  }
}