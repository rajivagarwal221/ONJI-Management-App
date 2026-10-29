"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Award, FileText, Lock, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Card, Chip, LoadingPanel, PageHeader } from "@/components/ui";

type Snap = {
  institute?: string;
  startDate?: string;
  endDate?: string;
  completed?: boolean;
  lorIssued?: boolean;
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Snap | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(firebaseDb(), "users", user.uid));
        if (snap.exists()) setData(snap.data() as Snap);
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <LoadingPanel />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Records"
        title="Your documents"
        description="Download the official documents for your internship. Your completion certificate becomes available once an admin marks your internship as complete."
      />
      {err && <Banner tone="error">{err}</Banner>}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand" />
                <h2 className="text-base font-semibold text-ink">
                  Internship Offer Letter
                </h2>
              </div>
              <p className="mt-1 text-sm text-ink-mute">
                Your signed offer letter from Onji Software Labs Pvt. Ltd.
              </p>
            </div>
            <Chip tone="success">Available</Chip>
          </div>
          {user && (
            <Link
              href={`/documents/offer-letter/${user.uid}`}
              target="_blank"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-brand-bright px-4 text-sm font-medium text-brand-fg shadow-brand hover:bg-brand-hover"
            >
              <FileText className="h-4 w-4" /> View / Download
            </Link>
          )}
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-brand" />
                <h2 className="text-base font-semibold text-ink">
                  Completion Certificate
                </h2>
              </div>
              <p className="mt-1 text-sm text-ink-mute">
                Released once the program team marks your internship complete.
              </p>
            </div>
            <Chip tone={data?.completed ? "brand" : "neutral"}>
              {data?.completed ? "Released" : "Locked"}
            </Chip>
          </div>
          {user && data?.completed ? (
            <Link
              href={`/documents/certificate/${user.uid}`}
              target="_blank"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-brand-bright px-4 text-sm font-medium text-brand-fg shadow-brand hover:bg-brand-hover"
            >
              <Award className="h-4 w-4" /> View / Download
            </Link>
          ) : (
            <div className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-line bg-paper-soft px-4 text-sm text-ink-mute">
              <Lock className="h-4 w-4" /> Not released yet
            </div>
          )}
        </Card>

        <Card className="md:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-brand" />
                <h2 className="text-base font-semibold text-ink">
                  Letter of Recommendation
                </h2>
              </div>
              <p className="mt-1 text-sm text-ink-mute">
                A personalised Letter of Recommendation from the CEO, issued to
                select interns after their internship is complete.
              </p>
            </div>
            <Chip tone={data?.lorIssued ? "brand" : "neutral"}>
              {data?.lorIssued ? "Issued" : "Not issued"}
            </Chip>
          </div>
          {user && data?.lorIssued ? (
            <Link
              href={`/documents/lor/${user.uid}`}
              target="_blank"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-brand-bright px-4 text-sm font-medium text-brand-fg shadow-brand hover:bg-brand-hover"
            >
              <Star className="h-4 w-4" /> View / Download
            </Link>
          ) : (
            <div className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-line bg-paper-soft px-4 text-sm text-ink-mute">
              <Lock className="h-4 w-4" />{" "}
              {data?.completed
                ? "Not issued — the program team selects recipients"
                : "Available after your internship is marked complete"}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
