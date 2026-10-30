import { NextRequest, NextResponse } from "next/server";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";
import { formatReference } from "@/lib/refs";

export const runtime = "nodejs";

// One-shot migration: rewrite any legacy intern referenceNo
// (e.g. "ONJI-2026-0001") into the canonical "OS/HR/IOL/2026/001" form.
// Keeps the year and sequence number from the old ref so letters,
// certificates, and LORs stay stable. Also bumps the per-year counter
// so new interns continue after the highest existing sequence.
export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);

    const snap = await adminDb()
      .collection("users")
      .where("role", "==", "intern")
      .get();

    const perYearMax: Record<number, number> = {};
    const updates: { uid: string; from: string; to: string }[] = [];

    for (const doc of snap.docs) {
      const data = doc.data() as { referenceNo?: string };
      const ref = data.referenceNo || "";

      // Already canonical — just update the per-year counter ceiling.
      const canonicalMatch = ref.match(/^OS\/HR\/[A-Z]+\/(\d{4})\/(\d+)/);
      if (canonicalMatch) {
        const y = Number(canonicalMatch[1]);
        const s = Number(canonicalMatch[2]);
        perYearMax[y] = Math.max(perYearMax[y] || 0, s);
        continue;
      }

      // Legacy "ONJI-YYYY-NNNN" shape.
      const legacy = ref.match(/^ONJI-(\d{4})-(\d+)/i);
      if (!legacy) continue;
      const y = Number(legacy[1]);
      const s = Number(legacy[2]);
      const next = formatReference(y, s);
      updates.push({ uid: doc.id, from: ref, to: next });
      perYearMax[y] = Math.max(perYearMax[y] || 0, s);
    }

    // Apply writes in a batch — users and the per-year counter.
    const batch = adminDb().batch();
    for (const u of updates) {
      batch.set(
        adminDb().collection("users").doc(u.uid),
        { referenceNo: u.to },
        { merge: true },
      );
    }
    for (const [yStr, seq] of Object.entries(perYearMax)) {
      const y = Number(yStr);
      batch.set(
        adminDb().doc(`counters/interns-${y}`),
        { seq },
        { merge: true },
      );
    }
    await batch.commit();

    return NextResponse.json({
      ok: true,
      migrated: updates.length,
      counters: perYearMax,
      details: updates,
    });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
