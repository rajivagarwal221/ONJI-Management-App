"use client";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { firebaseAuth, firebaseDb } from "./firebase";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import type { UserProfile } from "./db";

const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "arajiv221@gmail.com"
).toLowerCase();

async function bootstrapAdminIfNeeded(u: User) {
  if ((u.email || "").toLowerCase() !== ADMIN_EMAIL) return;
  const ref = doc(firebaseDb(), "users", u.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName || "Admin",
    role: "admin",
    primaryTrack: "",
    tracks: [],
    cohort: "",
    createdAt: serverTimestamp(),
  });
}

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);

const SID_KEY = "onji.sid";

function makeSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    let unsubUserDoc: (() => void) | null = null;
    try {
      unsub = onAuthStateChanged(firebaseAuth(), async (u) => {
        setUser(u);
        if (unsubUserDoc) {
          unsubUserDoc();
          unsubUserDoc = null;
        }
        if (u) {
          try {
            await bootstrapAdminIfNeeded(u);
            const snap = await getDoc(doc(firebaseDb(), "users", u.uid));
            setProfile(
              snap.exists() ? (snap.data() as UserProfile) : null,
            );

            // Device enforcement: watch activeSessionId.
            unsubUserDoc = onSnapshot(
              doc(firebaseDb(), "users", u.uid),
              (s) => {
                if (!s.exists()) return;
                const data = s.data() as UserProfile & {
                  activeSessionId?: string;
                  disabled?: boolean;
                };
                setProfile(data);
                const mine = localStorage.getItem(SID_KEY);
                if (data.disabled) {
                  void signOut(firebaseAuth());
                  return;
                }
                if (data.activeSessionId && mine && data.activeSessionId !== mine) {
                  void signOut(firebaseAuth());
                }
              },
            );
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
          localStorage.removeItem(SID_KEY);
        }
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
    return () => {
      unsub();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(firebaseAuth(), email, password);
    // Stamp a fresh session id. Any other device becomes stale.
    const sid = makeSessionId();
    localStorage.setItem(SID_KEY, sid);
    await setDoc(
      doc(firebaseDb(), "users", cred.user.uid),
      { activeSessionId: sid, lastSignIn: new Date() },
      { merge: true },
    );
  }

  async function signOutUser() {
    try {
      if (user) {
        // Clear the server-side session marker so no device holds it.
        await setDoc(
          doc(firebaseDb(), "users", user.uid),
          { activeSessionId: null },
          { merge: true },
        );
      }
    } catch {}
    await signOut(firebaseAuth());
    localStorage.removeItem(SID_KEY);
  }

  return (
    <AuthCtx.Provider value={{ user, profile, loading, signIn, signOutUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
