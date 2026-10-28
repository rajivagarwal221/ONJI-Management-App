import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, requireAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);

    const { uid, disabled } = await req.json();
    if (!uid || typeof disabled !== "boolean") {
      return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }

    await adminAuth().updateUser(uid, { disabled });
    // Also clear active session so the disabled user is kicked immediately.
    if (disabled) {
      await adminDb()
        .collection("users")
        .doc(uid)
        .set({ activeSessionId: null, disabled: true }, { merge: true });
      // Revoke refresh tokens too, so re-login is required.
      await adminAuth().revokeRefreshTokens(uid);
    } else {
      await adminDb()
        .collection("users")
        .doc(uid)
        .set({ disabled: false }, { merge: true });
    }

    return NextResponse.json({ ok: true });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
