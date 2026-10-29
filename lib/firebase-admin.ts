// Server-side Firebase Admin SDK, used from Next.js API routes.
// Requires FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,
// FIREBASE_ADMIN_PRIVATE_KEY in .env.local.
import "server-only";
import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

export function admin(): App {
  if (adminApp) return adminApp;
  const existing = getApps();
  if (existing.length) {
    adminApp = existing[0] as App;
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // The private key env var is historically painful: locally .env.local
  // needs quotes + literal \n escapes; on Vercel you paste the raw PEM
  // with real newlines; and some paste flows wrap the whole thing in
  // double or single quotes. Normalize all of these to a valid PEM.
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.trim();
    if (
      (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))
    ) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin env vars missing. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in your environment.",
    );
  }

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return adminApp;
}

export function adminAuth(): Auth {
  return getAuth(admin());
}
export function adminDb(): Firestore {
  return getFirestore(admin());
}

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "arajiv221@gmail.com";

export async function requireAdmin(idToken: string | undefined) {
  if (!idToken) throw new Error("Missing auth token.");
  const decoded = await adminAuth().verifyIdToken(idToken);
  if ((decoded.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Not authorized.");
  }
  return decoded;
}
