// Reference-number generator. Swap FORMAT when the real format arrives.
// Current placeholder: ONJI-{YYYY}-{seq4}. Admin SDK uses a transactional
// counter so sequence numbers are unique even across concurrent provisioning.
import "server-only";
import { adminDb } from "./firebase-admin";

// TODO: replace with the real format once provided (will include letters).
export function formatReference(year: number, seq: number) {
  return `ONJI-${year}-${String(seq).padStart(4, "0")}`;
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
