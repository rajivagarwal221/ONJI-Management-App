"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  ListChecks,
  Sparkles,
  UserCog,
} from "lucide-react";
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
  Progress,
} from "@/components/ui";
import { GettingStarted, type GuideStep } from "@/components/GettingStarted";

type UserProfileLite = {
  displayName?: string;
  primaryTrack?: string;
  tracks?: string[];
  cohort?: string;
  referenceNo?: string;
  linkedin?: string;
};

type Track = { id: string; name: string; requiredAssignments: number };
type Assignment = {
  id: string;
  title: string;
  track: string;
  week: number;
  isCapstone?: boolean;
};
type Submission = {
  id: string;
  assignmentId: string;
  track: string;
  status: "pending" | "accepted" | "needs_revisions";
};
type Resource = {
  id: string;
  title: string;
  track: string;
  week: number;
  level: string;
  href?: string;
  locked?: boolean;
};
type EventDoc = {
  id: string;
  title: string;
  startsAt: Timestamp;
  host: string;
};

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const p = (profile ?? {}) as UserProfileLite;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [onboardingDone, setOnboardingDone] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const db = firebaseDb();
        const [tSnap, aSnap, sSnap, rSnap, eSnap, oSnap] = await Promise.all([
          getDocs(query(collection(db, "tracks"), orderBy("order"))),
          getDocs(collection(db, "assignments")),
          getDocs(
            query(
              collection(db, "submissions"),
              where("userId", "==", user.uid),
            ),
          ),
          getDocs(collection(db, "resources")),
          getDocs(
            query(collection(db, "events"), orderBy("startsAt", "asc")),
          ),
          getDocs(
            query(
              collection(db, "users", user.uid, "onboarding"),
              orderBy("order"),
            ),
          ),
        ]);
        setTracks(
          tSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Track, "id">) })),
        );
        setAssignments(
          aSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Assignment, "id">) })),
        );
        setSubmissions(
          sSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Submission, "id">),
          })),
        );
        setResources(
          rSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Resource, "id">) })),
        );
        setEvents(
          eSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventDoc, "id">) })),
        );
        const total = oSnap.size;
        const done = oSnap.docs.filter((d) => (d.data() as { done?: boolean }).done).length;
        setOnboardingDone({ done, total });
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const primary = p.primaryTrack || "ml";
  const primaryTrack = tracks.find((t) => t.id === primary);
  const acceptedByTrack = (track: string) =>
    submissions.filter((s) => s.track === track && s.status === "accepted").length;
  const acceptedPrimary = acceptedByTrack(primary);
  const totalForPrimary = primaryTrack?.requiredAssignments || 5;
  const capstonePrimary = submissions.find(
    (s) =>
      s.track === primary &&
      assignments.find((a) => a.id === s.assignmentId)?.isCapstone,
  );

  const steps: GuideStep[] = [
    {
      key: "profile",
      title: "Complete your profile",
      description: "Add your LinkedIn / GitHub and timezone so mentors can reach you.",
      cta: { label: "Open profile", href: "/intern/profile" },
      done: Boolean(p.linkedin),
      icon: UserCog,
    },
    {
      key: "onboarding",
      title: "Finish onboarding checklist",
      description: `${onboardingDone.done} of ${onboardingDone.total} items checked off.`,
      cta: { label: "Open checklist", href: "/intern/onboarding" },
      done: onboardingDone.total > 0 && onboardingDone.done === onboardingDone.total,
      icon: ListChecks,
    },
    {
      key: "pick-track",
      title: "Explore your tracks",
      description: `Primary: ${primaryTrack?.name || primary}. Browse the week-by-week plan.`,
      cta: { label: "Open tracks", href: "/intern/tracks" },
      done: tracks.length > 0,
      icon: BookOpen,
    },
    {
      key: "first-assignment",
      title: "Submit your first assignment",
      description: "Pick a Week 1 assignment from your primary track and submit it.",
      cta: { label: "Open assignments", href: "/intern/assignments" },
      done: submissions.length > 0,
      icon: ClipboardCheck,
    },
    {
      key: "capstone",
      title: "Plan your capstone",
      description: "Review the capstone brief so it isn't a last-minute scramble.",
      cta: { label: "View capstone", href: "/intern/assignments?mode=capstones" },
      done: Boolean(capstonePrimary),
      icon: GraduationCap,
    },
  ];

  const upcomingEvents = events.filter(
    (e) => e.startsAt.toDate().getTime() > Date.now(),
  );
  const recommended = resources.filter(
    (r) => r.track === primary || r.track === "all",
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Sparkles}
        eyebrow="Dashboard"
        title={`Welcome${p.displayName ? ", " + p.displayName.split(" ")[0] : ""}`}
        description={
          p.referenceNo
            ? `${primaryTrack?.name || primary} · ${p.cohort || "cohort"} · Ref ${p.referenceNo}`
            : `${primaryTrack?.name || primary} · ${p.cohort || "cohort"}`
        }
      />

      {err && <Banner tone="error">{err}</Banner>}

      {/* Getting Started Guide */}
      <GettingStarted steps={steps} />

      {/* Stat tiles */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatTile
          icon={ClipboardCheck}
          eyebrow="Primary track"
          value={`${acceptedPrimary}/${totalForPrimary}`}
          foot="assignments accepted"
        />
        <StatTile
          icon={Briefcase}
          eyebrow="Submissions"
          value={`${submissions.length}`}
          foot="total submitted"
        />
        <StatTile
          icon={GraduationCap}
          eyebrow="Capstone"
          value={capstonePrimary ? capstonePrimary.status : "Not submitted"}
          foot={primaryTrack?.name || primary}
        />
      </div>

      {/* Track progress */}
      {!loading && tracks.length > 0 && (
        <Card>
          <h2 className="eyebrow">Track progress</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {tracks
              .filter((t) => (p.tracks || [primary]).includes(t.id))
              .map((t) => {
                const accepted = acceptedByTrack(t.id);
                return (
                  <Progress
                    key={t.id}
                    value={(accepted / t.requiredAssignments) * 100}
                    label={`${t.name} — ${accepted}/${t.requiredAssignments}`}
                  />
                );
              })}
          </div>
        </Card>
      )}

      {/* Recommended + upcoming */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="eyebrow">Recommended this week</h2>
            <Chip>{recommended.length}</Chip>
          </div>
          {loading ? (
            <div className="mt-4"><LoadingPanel rows={2} /></div>
          ) : recommended.length === 0 ? (
            <p className="mt-3 text-sm text-ink-mute">
              Resources appear here once admin seeds them.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {recommended.map((r) => (
                <div key={r.id} className="rounded-xl border border-line bg-paper-soft p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone="brand">Week {r.week}</Chip>
                    <Chip>{r.level}</Chip>
                    {r.locked && <Chip tone="warn">Locked</Chip>}
                  </div>
                  <div className="mt-2 text-sm font-medium text-ink">{r.title}</div>
                  {!r.locked && (
                    <Button size="sm" variant="secondary" href={`/intern/resources`} className="mt-3">
                      Open resources
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="eyebrow">Up next</h2>
          {loading ? (
            <div className="mt-4"><LoadingPanel rows={2} /></div>
          ) : upcomingEvents.length === 0 ? (
            <Empty
              icon={CalendarDays}
              title="No upcoming events"
              description="When admin publishes one, you'll see it here."
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {upcomingEvents.slice(0, 3).map((e) => (
                <li key={e.id} className="rounded-xl border border-line bg-paper-soft p-3">
                  <div className="text-sm font-medium text-ink">{e.title}</div>
                  <div className="mt-1 text-xs text-ink-mute">
                    {e.startsAt.toDate().toLocaleString()} · {e.host}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="eyebrow">Capstone</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-mute">
            Keep your final {primaryTrack?.name || "track"} artifact separate from
            weekly assignments and submit it when it&apos;s ready.
          </p>
          <Button
            variant="secondary"
            href="/intern/assignments?mode=capstones"
            className="mt-4"
          >
            Submit capstone
          </Button>
        </Card>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  eyebrow,
  value,
  foot,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  value: string;
  foot: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-ink-mute">
        <Icon className="h-4 w-4" />
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
        {value}
      </div>
      <div className="mt-1 text-xs text-ink-mute">{foot}</div>
    </Card>
  );
}
