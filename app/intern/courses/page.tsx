"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { Check, GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import {
  Banner,
  Button,
  Card,
  Chip,
  Empty,
  LoadingPanel,
  PageHeader,
} from "@/components/ui";

type Course = {
  id: string;
  title: string;
  hours: number;
  description: string;
  href?: string;
};

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(firebaseDb(), "courses"));
        setCourses(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Course, "id">) })),
        );
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(firebaseDb(), "users", user.uid, "completedCourses"),
      (snap) => {
        setCompleted(new Set(snap.docs.map((d) => d.id)));
      },
    );
    return () => unsub();
  }, [user]);

  async function toggle(courseId: string, done: boolean) {
    if (!user) return;
    setBusy(courseId);
    try {
      const ref = doc(firebaseDb(), "users", user.uid, "completedCourses", courseId);
      if (done) {
        await setDoc(ref, { completedAt: serverTimestamp() });
      } else {
        await deleteDoc(ref);
      }
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  const doneCount = courses.filter((c) => completed.has(c.id)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        eyebrow="Anthropic Certs"
        title="Anthropic certifications"
        description="Short, free Anthropic courses. Mark each one complete after you finish it."
        action={
          courses.length > 0 && (
            <Chip tone="brand">
              {doneCount}/{courses.length} complete
            </Chip>
          )
        }
      />
      {err && <Banner tone="error">{err}</Banner>}

      {loading ? (
        <LoadingPanel />
      ) : courses.length === 0 ? (
        <Empty
          icon={GraduationCap}
          title="No courses listed yet"
          description="Ask admin to seed starter content."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c) => {
            const isDone = completed.has(c.id);
            return (
              <Card key={c.id} interactive>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">
                      {c.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-mute">~{c.hours}h · self-paced</p>
                  </div>
                  <Chip tone={isDone ? "success" : "neutral"}>
                    {isDone ? "Completed" : "Not started"}
                  </Chip>
                </div>
                <p className="mt-3 text-sm text-ink-mute">{c.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.href ? (
                    <Button href={c.href}>Open course</Button>
                  ) : (
                    <Button disabled>Coming soon</Button>
                  )}
                  <Button
                    variant="secondary"
                    loading={busy === c.id}
                    onClick={() => void toggle(c.id, !isDone)}
                  >
                    {isDone ? (
                      "Mark incomplete"
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Mark complete
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
