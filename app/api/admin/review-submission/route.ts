import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";
import { reviewEmail, sendMail } from "@/lib/mail";

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
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const subRef = adminDb().collection("submissions").doc(submissionId);
    const subSnap = await subRef.get();
    if (!subSnap.exists) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }
    const sub = subSnap.data() as {
      userId?: string;
      assignmentTitle?: string;
    };

    await subRef.set(
      {
        status,
        reviewer: decoded.email || "admin",
        reviewerNote: reviewerNote || null,
        reviewedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Email the intern on accept / needs_revisions (not on reverting to pending).
    let emailStatus: "sent" | "skipped" | "failed" = "skipped";
    let emailError: string | undefined;
    if (status === "accepted" || status === "needs_revisions") {
      try {
        const userSnap = sub.userId
          ? await adminDb().collection("users").doc(sub.userId).get()
          : null;
        const u = userSnap?.exists
          ? (userSnap.data() as { email?: string; displayName?: string })
          : null;
        if (u?.email) {
          const loginUrl =
            (process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "") + "/login";
          const mail = reviewEmail(
            u.displayName || "there",
            sub.assignmentTitle || "your assignment",
            status,
            reviewerNote || "",
            loginUrl,
          );
          await sendMail({
            to: u.email,
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
          });
          emailStatus = "sent";
        }
      } catch (ex) {
        emailStatus = "failed";
        emailError = ex instanceof Error ? ex.message : "Unknown error";
      }
    }

    return NextResponse.json({ ok: true, emailStatus, emailError });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
