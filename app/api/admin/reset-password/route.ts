import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, requireAdmin } from "@/lib/firebase-admin";
import { credentialEmail, sendMail } from "@/lib/mail";
import { generatePassword } from "@/lib/refs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);

    const { uid } = await req.json();
    if (!uid) {
      return NextResponse.json({ error: "Missing uid." }, { status: 400 });
    }

    const u = await adminAuth().getUser(uid);
    if (!u.email) {
      return NextResponse.json(
        { error: "User has no email." },
        { status: 400 },
      );
    }

    const password = generatePassword(12);
    await adminAuth().updateUser(uid, { password });

    // Also clear active session so the old device is kicked.
    await adminDb()
      .collection("users")
      .doc(uid)
      .set({ activeSessionId: null }, { merge: true });

    const profileSnap = await adminDb().collection("users").doc(uid).get();
    const profile = profileSnap.data() || {};
    const referenceNo = profile.referenceNo || "ONJI-XXXX";
    const displayName = profile.displayName || u.displayName || "Intern";

    const loginUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") + "/login" ||
      "https://your-domain.example/login";

    const mail = credentialEmail(
      displayName,
      u.email,
      password,
      referenceNo,
      loginUrl,
    );
    let emailStatus: "sent" | "failed" = "sent";
    let emailError: string | undefined;
    try {
      await sendMail({
        to: u.email,
        subject: "Your ONJI password has been reset",
        text: mail.text,
        html: mail.html,
      });
    } catch (ex) {
      emailStatus = "failed";
      emailError = ex instanceof Error ? ex.message : "Unknown error";
    }

    return NextResponse.json({
      ok: true,
      emailStatus,
      emailError,
      password: emailStatus === "failed" ? password : undefined,
    });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
