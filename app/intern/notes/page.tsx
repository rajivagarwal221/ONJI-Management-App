"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import {
  Banner,
  Button,
  Card,
  Empty,
  Field,
  Input,
  LoadingPanel,
  PageHeader,
  Textarea,
} from "@/components/ui";

type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt?: Timestamp;
};

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    try {
      const snap = await getDocs(
        query(
          collection(firebaseDb(), "users", user.uid, "notes"),
          orderBy("updatedAt", "desc"),
        ),
      );
      setNotes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Note, "id">) })));
    } catch (ex) {
      try {
        const snap = await getDocs(
          collection(firebaseDb(), "users", user.uid, "notes"),
        );
        setNotes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Note, "id">) })));
      } catch {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setErr(null);
    try {
      await addDoc(collection(firebaseDb(), "users", user.uid, "notes"), {
        title: form.title,
        body: form.body,
        updatedAt: serverTimestamp(),
      });
      setForm({ title: "", body: "" });
      setShowForm(false);
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!user) return;
    if (!confirm("Delete this note?")) return;
    try {
      await deleteDoc(doc(firebaseDb(), "users", user.uid, "notes", id));
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={NotebookPen}
        eyebrow="Study notes"
        title="Your notes"
        description="Private notes attached to your account."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            <Plus className="h-4 w-4" /> New note
          </Button>
        }
      />

      {err && <Banner tone="error">{err}</Banner>}

      {showForm && (
        <Card>
          <form onSubmit={create} className="grid gap-3">
            <Field label="Title">
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="A short, searchable title"
              />
            </Field>
            <Field label="Body">
              <Textarea
                required
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="What did you learn? What surprised you?"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={busy}>
                Save note
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <LoadingPanel />
      ) : notes.length === 0 ? (
        <Empty
          icon={NotebookPen}
          title="No notes yet"
          description="Click 'New note' to capture something you learned."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-ink">
                  {n.title}
                </h3>
                <button
                  onClick={() => remove(n.id)}
                  className="shrink-0 rounded-lg p-1 text-ink-mute hover:bg-paper-soft hover:text-red-600"
                  title="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink-mute">{n.body}</p>
              {n.updatedAt && (
                <div className="mt-3 text-xs text-ink-mute">
                  Updated {n.updatedAt.toDate().toLocaleDateString()}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
