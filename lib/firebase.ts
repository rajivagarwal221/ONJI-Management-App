// Firebase client SDK init. Fill the env vars in .env.local before using.
// NEXT_PUBLIC_FIREBASE_API_KEY, _AUTH_DOMAIN, _PROJECT_ID, _STORAGE_BUCKET,
// _MESSAGING_SENDER_ID, _APP_ID
//
// NOTE: Firebase 13's modular SDK registers components (auth/firestore/storage)
// as a side-effect of their imports. If initializeApp() is called lazily
// AFTER those modules are only transitively referenced, bundlers sometimes
// split them into separate chunks and the components aren't registered when
// getAuth() runs. So we initialize at module load.
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

function getOrInit(): FirebaseApp {
  if (!config.projectId) {
    throw new Error(
      "Firebase env vars missing. Set NEXT_PUBLIC_FIREBASE_* in .env.local",
    );
  }
  return getApps().length ? getApp() : initializeApp(config);
}

// Eagerly initialize when the module loads on the client so that the
// auth/firestore/storage side-effect imports above have already registered
// their components by the time anyone calls firebaseAuth().
const app: FirebaseApp | null =
  typeof window !== "undefined" ? getOrInit() : null;

export function firebaseAuth(): Auth {
  return getAuth(app ?? getOrInit());
}

export function firebaseDb(): Firestore {
  return getFirestore(app ?? getOrInit());
}

export function firebaseStorage(): FirebaseStorage {
  return getStorage(app ?? getOrInit());
}
