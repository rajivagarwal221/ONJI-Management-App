import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

// Create a new group OR update an existing one.
export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);
    const body = (await req.json()) as {
      id?: string;
      name: string;
      githubOrg?: string;
      githubRepo?: string;
      color?: string;
    };
    if (!body.name) {
      return NextResponse.json({ error: "Group name required." }, { status: 400 });
    }
    const data = {
      name: body.name,
      githubOrg: body.githubOrg || null,
      githubRepo: body.githubRepo || null,
      color: body.color || "#A4521E",
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (body.id) {
      await adminDb().collection("groups").doc(body.id).set(data, { merge: true });
      return NextResponse.json({ ok: true, id: body.id });
    } else {
      const ref = await adminDb().collection("groups").add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true, id: ref.id });
    }
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
