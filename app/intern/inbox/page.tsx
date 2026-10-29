"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Card, Chip, Empty, LoadingPanel, PageHeader } from "@/components/ui";

type Message = {
  id: string;
  from: string;
  subject: string;
  body: string;
  unread: boolean;
  receivedAt?: Timestamp;
};

export default function InboxPage() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(firebaseDb(), "users", user.uid, "inbox"),
            orderBy("receivedAt", "desc"),
          ),
        );
        setMsgs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) })));
      } catch (ex) {
        try {
          const snap = await getDocs(
            collection(firebaseDb(), "users", user.uid, "inbox"),
          );
          setMsgs(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) })),
          );
        } catch {
          setErr(ex instanceof Error ? ex.message : "Failed to load");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function markRead(id: string) {
    if (!user) return;
    try {
      await updateDoc(doc(firebaseDb(), "users", user.uid, "inbox", id), {
        unread: false,
      });
      setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
    } catch {}
  }

  const unread = msgs.filter((m) => m.unread).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Mail}
        eyebrow="E-Mail Inbox"
        title="Program inbox"
        description="Personal messages from mentors and the program team."
        action={msgs.length > 0 && <Chip tone="brand">{unread} unread</Chip>}
      />
      {err && <Banner tone="error">{err}</Banner>}
      {loading ? (
        <LoadingPanel />
      ) : msgs.length === 0 ? (
        <Empty icon={Mail} title="Inbox is empty" description="Messages from mentors will appear here." />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-line">
            {msgs.map((m) => (
              <li
                key={m.id}
                onClick={() => m.unread && markRead(m.id)}
                className={`cursor-pointer px-5 py-4 transition ${
                  m.unread ? "bg-brand-soft/50 hover:bg-brand-soft/70" : "hover:bg-paper-soft"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">
                        {m.from}
                      </span>
                      {m.unread && <Chip tone="brand">New</Chip>}
                    </div>
                    <div className="mt-1 truncate text-sm text-ink">{m.subject}</div>
                    <p className="mt-1 text-xs text-ink-mute line-clamp-2">{m.body}</p>
                  </div>
                  {m.receivedAt && (
                    <span className="shrink-0 text-xs text-ink-mute">
                      {m.receivedAt.toDate().toLocaleDateString()}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
