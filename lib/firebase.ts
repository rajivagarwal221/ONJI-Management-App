// Firebase client SDK init.
//
// Firebase v9+ modular SDK registers each product's component (auth,
// firestore, storage) as a side effect of importing its subpackage.
// If a bundler splits the subpackage into a later chunk, getAuth() can
// run before the side effects have — hence "Component auth has not been
// registered yet". Forcing explicit side-effect imports + initializing
// at module load fixes it under Turbopack / Next 16.
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function requireClient(): FirebaseApp {
  if (!config.projectId) {
    throw new Error(
      "Firebase env vars missing. Set NEXT_PUBLIC_FIREBASE_* in .env.local",
    );
  }
  return getApps().length ? getApp() : initializeApp(config);
}

// Initialize at module load so component side-effects complete before any
// getAuth / getFirestore / getStorage call. On the server (no window) this
// stays null; API routes use firebase-admin instead.
const app: FirebaseApp | null =
  typeof window !== "undefined" ? requireClient() : null;

// Eagerly bind the SDK instances on the client so the auth component is
// registered immediately — not later, when a React effect finally fires.
const authInstance: Auth | null = app ? getAuth(app) : null;
const dbInstance: Firestore | null = app ? getFirestore(app) : null;
const storageInstance: FirebaseStorage | null = app ? getStorage(app) : null;

export function firebaseAuth(): Auth {
  if (authInstance) return authInstance;
  return getAuth(requireClient());
}

export function firebaseDb(): Firestore {
  if (dbInstance) return dbInstance;
  return getFirestore(requireClient());
}

export function firebaseStorage(): FirebaseStorage {
  if (storageInstance) return storageInstance;
  return getStorage(requireClient());
}
