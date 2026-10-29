"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Card, Chip, Empty, LoadingPanel, PageHeader } from "@/components/ui";

type Item = { id: string; title: string; order: number; done: boolean };

export default function OnboardingPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(firebaseDb(), "users", user.uid, "onboarding"),
            orderBy("order"),
          ),
        );
        setItems(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Item, "id">) })),
        );
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function toggle(id: string, done: boolean) {
    if (!user) return;
    try {
      await updateDoc(
        doc(firebaseDb(), "users", user.uid, "onboarding", id),
        { done },
      );
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Update failed");
    }
  }

  const done = items.filter((i) => i.done).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ListChecks}
        eyebrow="Onboarding"
        title="Your onboarding checklist"
        description="Finish these so your dashboard moves on to real work."
        action={
          items.length > 0 && <Chip tone="brand">{done}/{items.length} complete</Chip>
        }
      />
      {err && <Banner tone="error">{err}</Banner>}
      {loading ? (
        <LoadingPanel />
      ) : items.length === 0 ? (
        <Empty
          icon={ListChecks}
          title="No onboarding items yet"
          description="Your admin needs to seed starter data. Ask them to click 'Seed / refresh starter content' in the admin console."
        />
      ) : (
        <Card>
          <ol className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <button
                  type="button"
                  onClick={() => toggle(item.id, !item.done)}
                  className="shrink-0 rounded-full p-0.5 transition hover:bg-paper-soft"
                  aria-label={item.done ? "Mark incomplete" : "Mark complete"}
                >
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-brand" />
                  ) : (
                    <Circle className="h-5 w-5 text-ink-mute/40" />
                  )}
                </button>
                <span className={`flex-1 text-sm ${item.done ? "text-ink line-through" : "text-ink"}`}>
                  {item.title}
                </span>
                {item.done && <Chip tone="success">Done</Chip>}
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}
