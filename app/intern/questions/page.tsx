"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { MessageSquarePlus, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import {
  Banner,
  Button,
  Card,
  Chip,
  Empty,
  Field,
  Input,
  LoadingPanel,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";

type Question = {
  id: string;
  title: string;
  body: string;
  track: string;
  status: "open" | "answered";
  updatedAt?: Timestamp;
};

export default function QuestionsPage() {
  const { user, profile } = useAuth();
  const [qs, setQs] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const myTracks = (profile as unknown as { tracks?: string[] } | null)?.tracks || ["ml"];
  const [form, setForm] = useState({
    title: "",
    body: "",
    track: myTracks[0] || "ml",
  });

  async function load() {
    if (!user) return;
    try {
      const snap = await getDocs(
        query(
          collection(firebaseDb(), "questions"),
          where("userId", "==", user.uid),
        ),
      );
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Question, "id">),
      }));
      list.sort((a, b) =>
        (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0),
      );
      setQs(list);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setErr(null);
    try {
      await addDoc(collection(firebaseDb(), "questions"), {
        userId: user.uid,
        title: form.title,
        body: form.body,
        track: form.track,
        status: "open",
        updatedAt: serverTimestamp(),
      });
      setForm({ title: "", body: "", track: myTracks[0] || "ml" });
      setShowForm(false);
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={MessageSquarePlus}
        eyebrow="Questions"
        title="Your questions"
        description="Private thread with a mentor. Public Q&A lives inside each assignment."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            <Plus className="h-4 w-4" /> Ask a question
          </Button>
        }
      />

      {err && <Banner tone="error">{err}</Banner>}

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-3">
            <Field label="Title">
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What's your question?"
              />
            </Field>
            <Field label="Track">
              <Select
                value={form.track}
                onChange={(e) => setForm({ ...form, track: e.target.value })}
              >
                {myTracks.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Details">
              <Textarea
                required
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Context, what you tried, what you're stuck on."
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={busy}>
                Ask
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <LoadingPanel />
      ) : qs.length === 0 ? (
        <Empty
          icon={MessageSquarePlus}
          title="No questions yet"
          description="Ask when you're stuck — faster than reading in circles."
        />
      ) : (
        <div className="grid gap-3">
          {qs.map((q) => (
            <Card key={q.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold text-ink">{q.title}</h3>
                  <p className="mt-1 text-sm text-ink-mute">
                    {q.track}
                    {q.updatedAt &&
                      ` · updated ${q.updatedAt.toDate().toLocaleDateString()}`}
                  </p>
                  <p className="mt-2 text-sm text-ink">{q.body}</p>
                </div>
                <Chip tone={q.status === "answered" ? "success" : "brand"}>
                  {q.status === "answered" ? "Answered" : "Open"}
                </Chip>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
