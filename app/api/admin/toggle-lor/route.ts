import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);

    const { uid, issued } = (await req.json()) as {
      uid: string;
      issued: boolean;
    };
    if (!uid || typeof issued !== "boolean") {
      return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }

    // LOR requires completion first — enforce server-side too.
    const snap = await adminDb().collection("users").doc(uid).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Intern not found." }, { status: 404 });
    }
    const u = snap.data() as { completed?: boolean };
    if (issued && !u.completed) {
      return NextResponse.json(
        { error: "Intern must be marked completed before issuing an LOR." },
        { status: 400 },
      );
    }

    const patch: Record<string, unknown> = { lorIssued: issued };
    patch.lorIssuedAt = issued ? FieldValue.serverTimestamp() : null;

    await adminDb().collection("users").doc(uid).set(patch, { merge: true });

    if (issued) {
      await adminDb()
        .collection("users")
        .doc(uid)
        .collection("inbox")
        .add({
          from: "ONJI Program",
          subject: "Your Letter of Recommendation is now available",
          body: "Great news — a Letter of Recommendation has been issued for you. You can download it from the Documents section of your portal.",
          unread: true,
          receivedAt: FieldValue.serverTimestamp(),
        });
    }

    return NextResponse.json({ ok: true });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
