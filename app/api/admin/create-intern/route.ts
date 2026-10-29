import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb, requireAdmin } from "@/lib/firebase-admin";
import { credentialEmail, sendMail } from "@/lib/mail";
import { generatePassword, nextReference } from "@/lib/refs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);

    const body = await req.json();
    const { email, displayName, primaryTrack, cohort } = body as {
      email: string;
      displayName: string;
      primaryTrack: string;
      cohort: string;
    };

    if (!email || !displayName || !primaryTrack || !cohort) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    // Ensure the email isn't already a user.
    try {
      const existing = await adminAuth().getUserByEmail(email);
      if (existing) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 },
        );
      }
    } catch (e) {
      // Not found is fine — fall through.
    }

    const password = generatePassword(12);
    const referenceNo = await nextReference();

    const user = await adminAuth().createUser({
      email,
      password,
      displayName,
      emailVerified: true,
      disabled: false,
    });

    await adminDb()
      .collection("users")
      .doc(user.uid)
      .set({
        uid: user.uid,
        email,
        displayName,
        role: "intern",
        primaryTrack,
        tracks: [primaryTrack],
        cohort,
        referenceNo,
        provisionedAt: FieldValue.serverTimestamp(),
        activeSessionId: null,
        lastSignIn: null,
      });

    // Mint a per-user onboarding checklist from the template.
    try {
      const templateSnap = await adminDb()
        .collection("meta")
        .doc("onboarding")
        .get();
      const items =
        (templateSnap.exists ? (templateSnap.data()?.items as string[]) : null) ||
        [
          "Verify your email",
          "Fill out your profile",
          "Pick your primary track",
          "Watch the portal overview video",
          "Submit intro assignment",
        ];
      const onboardingBatch = adminDb().batch();
      items.forEach((title, i) => {
        const ref = adminDb()
          .collection("users")
          .doc(user.uid)
          .collection("onboarding")
          .doc();
        onboardingBatch.set(ref, { title, order: i, done: false });
      });
      // Also drop a welcome message into their inbox.
      onboardingBatch.set(
        adminDb()
          .collection("users")
          .doc(user.uid)
          .collection("inbox")
          .doc(),
        {
          from: "ONJI Program",
          subject: `Welcome to the ${cohort} cohort`,
          body: "Your account is ready. Finish the Getting Started guide on your dashboard, then jump into Week 1 of your track.",
          unread: true,
          receivedAt: FieldValue.serverTimestamp(),
        },
      );
      await onboardingBatch.commit();
    } catch {
      // onboarding mint failure shouldn't block provisioning
    }

    const loginUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") + "/login" ||
      "https://your-domain.example/login";

    const mail = credentialEmail(
      displayName,
      email,
      password,
      referenceNo,
      loginUrl,
    );
    let emailStatus: "sent" | "failed" = "sent";
    let emailError: string | undefined;
    try {
      await sendMail({
        to: email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
    } catch (ex) {
      emailStatus = "failed";
      emailError = ex instanceof Error ? ex.message : "Unknown error";
    }

    return NextResponse.json({
      ok: true,
      uid: user.uid,
      referenceNo,
      emailStatus,
      emailError,
      // Returned so admin can copy if email failed. NEVER store plaintext.
      password: emailStatus === "failed" ? password : undefined,
    });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
