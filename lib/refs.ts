// Reference-number generator.
// Format: OS/HR/IOL/{YYYY}/{seq3} e.g. OS/HR/IOL/2026/001
// A single counter per year lives at counters/interns-{YYYY}; sequences
// are allocated transactionally so parallel provisioning stays unique.
import "server-only";
import { adminDb } from "./firebase-admin";

export function formatReference(year: number, seq: number) {
  return `OS/HR/IOL/${year}/${String(seq).padStart(3, "0")}`;
}

export async function nextReference(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const ref = adminDb().doc(`counters/interns-${year}`);
  const seq = await adminDb().runTransaction(async (t) => {
    const snap = await t.get(ref);
    const current = (snap.exists ? (snap.data()?.seq as number) : 0) || 0;
    const next = current + 1;
    t.set(ref, { seq: next }, { merge: true });
    return next;
  });
  return formatReference(year, seq);
}

export function generatePassword(length = 12): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // omit confusables
  const bytes = new Uint32Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 0xffffffff);
    }
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
