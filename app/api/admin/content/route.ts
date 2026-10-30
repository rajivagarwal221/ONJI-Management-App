import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const ALLOWED = [
  "tracks",
  "assignments",
  "resources",
  "announcements",
  "events",
  "courses",
] as const;
type Collection = (typeof ALLOWED)[number];

const DATE_FIELDS: Record<Collection, string[]> = {
  tracks: [],
  assignments: ["due"],
  resources: [],
  announcements: ["publishedAt"],
  events: ["startsAt"],
  courses: [],
};

function isAllowed(name: string): name is Collection {
  return (ALLOWED as readonly string[]).includes(name);
}

// POST — create or update
export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);
    const body = (await req.json()) as {
      collection: string;
      id?: string;
      data: Record<string, unknown>;
    };
    if (!isAllowed(body.collection)) {
      return NextResponse.json({ error: "Invalid collection." }, { status: 400 });
    }
    const col = body.collection;

    // Convert ISO strings to Firestore Timestamps for known date fields.
    const data: Record<string, unknown> = { ...body.data };
    for (const key of DATE_FIELDS[col]) {
      const v = data[key];
      if (typeof v === "string" && v) {
        try {
          data[key] = Timestamp.fromDate(new Date(v));
        } catch {}
      }
      if (v === "" || v == null) delete data[key];
    }
    data.updatedAt = FieldValue.serverTimestamp();

    if (body.id) {
      await adminDb().collection(col).doc(body.id).set(data, { merge: true });
      return NextResponse.json({ ok: true, id: body.id });
    } else {
      const ref = await adminDb().collection(col).add({
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

// DELETE — remove a document
export async function DELETE(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection") || "";
    const id = searchParams.get("id") || "";
    if (!isAllowed(collection) || !id) {
      return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }
    await adminDb().collection(collection).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
