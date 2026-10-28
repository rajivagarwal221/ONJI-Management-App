// Firebase client SDK init. Fill the env vars in .env.local before using.
// NEXT_PUBLIC_FIREBASE_API_KEY, _AUTH_DOMAIN, _PROJECT_ID, _STORAGE_BUCKET,
// _MESSAGING_SENDER_ID, _APP_ID
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let authSingleton: Auth | null = null;
let dbSingleton: Firestore | null = null;
let storageSingleton: FirebaseStorage | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!config.projectId) {
    throw new Error(
      "Firebase env vars missing. Set NEXT_PUBLIC_FIREBASE_* in .env.local",
    );
  }
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(config);
  return app;
}

export function firebaseAuth(): Auth {
  if (!authSingleton) authSingleton = getAuth(getFirebaseApp());
  return authSingleton;
}

export function firebaseDb(): Firestore {
  if (!dbSingleton) dbSingleton = getFirestore(getFirebaseApp());
  return dbSingleton;
}

export function firebaseStorage(): FirebaseStorage {
  if (!storageSingleton) storageSingleton = getStorage(getFirebaseApp());
  return storageSingleton;
}
