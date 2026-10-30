import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

// Create / update a task scoped to a group.
export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);
    const body = (await req.json()) as {
      id?: string;
      groupId: string;
      title: string;
      description?: string;
      assignedTo?: string | null; // uid or null for group-wide
      repo?: string; // owner/name
      branch?: string;
      dueDate?: string; // ISO
    };
    if (!body.groupId || !body.title) {
      return NextResponse.json(
        { error: "groupId and title are required." },
        { status: 400 },
      );
    }
    const payload = {
      groupId: body.groupId,
      title: body.title,
      description: body.description || "",
      assignedTo: body.assignedTo || null,
      repo: body.repo || null,
      branch: body.branch || null,
      dueDate: body.dueDate ? Timestamp.fromDate(new Date(body.dueDate)) : null,
      status: "open",
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (body.id) {
      await adminDb().collection("tasks").doc(body.id).set(payload, { merge: true });
      return NextResponse.json({ ok: true, id: body.id });
    } else {
      const ref = await adminDb().collection("tasks").add({
        ...payload,
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
