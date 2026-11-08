import { getApp, getApps, initializeApp } from '@firebase/app';
import { getAuth, getIdTokenResult, GoogleAuthProvider, type User as FirebaseUser } from '@firebase/auth';
import { User as PawUser, UserRole } from './types.ts';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Object.values(firebaseConfig).every((value) => Boolean(value?.trim()));
const firebaseApp = isConfigured
  ? getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export const resolveFirebaseUser = async (
  firebaseUser: FirebaseUser,
  syncAdminAccess = false
): Promise<PawUser> => {
  if (syncAdminAccess && !import.meta.env.DEV) {
    const idToken = await firebaseUser.getIdToken();
    const response = await fetch('/api/auth/sync-admin-role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      throw new Error(result.error || 'Unable to verify account access.');
    }
    await firebaseUser.getIdToken(true);
  }

  const token = await getIdTokenResult(firebaseUser, true);
  const claims = token.claims;
  const role: UserRole = claims.admin === true || claims.role === 'admin'
    ? 'admin'
    : claims.staff === true || claims.role === 'staff'
    ? 'staff'
    : 'adopter';
  const organization = typeof claims.organization === 'string' ? claims.organization : undefined;

  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'PAW user',
    email: firebaseUser.email || '',
    role,
    organization,
    avatarUrl: firebaseUser.photoURL || undefined,
  };
};