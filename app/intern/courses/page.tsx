"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { GraduationCap } from "lucide-react";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Button, Card, Chip, Empty, LoadingPanel, PageHeader } from "@/components/ui";

type Course = {
  id: string;
  title: string;
  hours: number;
  description: string;
  href?: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        eyebrow="Anthropic Certs"
        title="Anthropic certifications"
        description="Short, free Anthropic courses. Finishing one adds a verifiable certificate."
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
          {courses.map((c) => (
            <Card key={c.id} interactive>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">
                    {c.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink-mute">~{c.hours}h · self-paced</p>
                </div>
                <Chip>Not started</Chip>
              </div>
              <p className="mt-3 text-sm text-ink-mute">{c.description}</p>
              <div className="mt-4">
                {c.href ? (
                  <Button href={c.href}>Open course</Button>
                ) : (
                  <Button disabled>Coming soon</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
