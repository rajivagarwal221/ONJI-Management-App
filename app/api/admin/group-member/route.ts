import { NextRequest, NextResponse } from "next/server";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

// Assign (or remove) an intern to a group.
export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);
    const { uid, groupId } = (await req.json()) as {
      uid: string;
      groupId: string | null;
    };
    if (!uid) {
      return NextResponse.json({ error: "uid required." }, { status: 400 });
    }
    await adminDb()
      .collection("users")
      .doc(uid)
      .set({ groupId: groupId || null }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
