import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = await requireAdmin(idToken);

    const { submissionId, status, reviewerNote } = (await req.json()) as {
      submissionId: string;
      status: "accepted" | "needs_revisions" | "pending";
      reviewerNote?: string;
    };
    if (!submissionId || !status) {
      return NextResponse.json(
        { error: "Missing fields." },
        { status: 400 },
      );
    }

    await adminDb()
      .collection("submissions")
      .doc(submissionId)
      .set(
        {
          status,
          reviewer: decoded.email || "admin",
          reviewerNote: reviewerNote || null,
          reviewedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    return NextResponse.json({ ok: true });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
