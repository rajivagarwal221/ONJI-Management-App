import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);

    const { uid, completed } = (await req.json()) as {
      uid: string;
      completed: boolean;
    };
    if (!uid || typeof completed !== "boolean") {
      return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }

    const patch: Record<string, unknown> = { completed };
    if (completed) {
      patch.completedAt = FieldValue.serverTimestamp();
    } else {
      patch.completedAt = null;
    }

    await adminDb().collection("users").doc(uid).set(patch, { merge: true });

    // Also drop a notice into the intern's inbox when completed.
    if (completed) {
      await adminDb()
        .collection("users")
        .doc(uid)
        .collection("inbox")
        .add({
          from: "ONJI Program",
          subject: "Your internship certificate is now available",
          body: "Congratulations! Your internship has been marked complete. You can now download your Internship Completion Certificate from the Documents section of your portal.",
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
