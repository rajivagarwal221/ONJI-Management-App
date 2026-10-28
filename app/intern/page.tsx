import Link from "next/link";
import { CheckCircle2, PlayCircle } from "lucide-react";

type Track = {
  key: string;
  label: string;
  completed: number;
  required: number;
  capstone: "not submitted" | "submitted" | "accepted";
};

const tracks: Track[] = [
  { key: "fluency", label: "AI Fluency", completed: 0, required: 5, capstone: "not submitted" },
  { key: "ml", label: "Machine Learning", completed: 0, required: 5, capstone: "not submitted" },
];

const recommended = [
  { id: "starter", tag: "Locked", title: "ONJI ML Internship Starter (GitHub)", href: null },
  { id: "search", tag: "Beginner", title: "How Google Search Works", href: "/intern/resources/search-works" },
  { id: "ai-features", tag: "Intermediate", title: "AI Features and Your Website", href: "/intern/resources/ai-features" },
  { id: "debug-drops", tag: "Intermediate", title: "Debug Search Traffic Drops", href: "/intern/resources/debug-drops" },
];

function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "brand" | "neutral";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "brand"
      ? "border-brand/40 bg-brand-soft text-brand"
      : "border-line-strong bg-paper-soft text-ink-mute";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${toneClass}`}
    >
      {children}
    </span>
  );
}

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-line-strong bg-paper-elev p-5 shadow-sm shadow-ink/5 ${className}`}
    >
      {children}
    </div>
  );
}

function StatTile({ eyebrow, value, foot }: { eyebrow: string; value: string; foot: string }) {
  return (
    <div className="rounded-2xl border border-line-strong bg-gradient-to-b from-paper-elev to-paper-soft p-5 shadow-sm shadow-ink/5 flex flex-col gap-1">
      <span className="eyebrow text-2xs">{eyebrow}</span>
      <span className="font-display text-3xl font-semibold tracking-normal text-ink">
        {value}
      </span>
      <span className="text-xs text-ink-mute">{foot}</span>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold leading-tight tracking-normal text-ink sm:text-3xl md:text-4xl">
            Welcome, Rajiv
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-mute md:text-base">
            Machine Learning · July 2026
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Start here */}
        <div className="order-1 rounded-2xl border border-brand/30 bg-brand-soft p-5 shadow-sm shadow-ink/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="eyebrow text-brand">Start here</h2>
              <div className="mt-3 font-display text-2xl font-semibold leading-tight text-ink">
                0/5 assignments complete
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-mute">
                Submit 5 more valid Machine Learning assignments. Work from another track does
                not count here.
              </p>
            </div>
            <Link
              href="/intern/assignments"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-bright px-3.5 text-sm font-medium text-brand-fg shadow-brand hover:bg-brand-hover active:bg-brand-press"
            >
              Open assignments
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {tracks.map((t) => (
              <div key={t.key}>
                <div className="flex items-center justify-between text-xs text-ink-mute">
                  <span>{t.label}</span>
                  <span>
                    {t.completed}/{t.required} · capstone {t.capstone}
                  </span>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-paper-soft"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={(t.completed / t.required) * 100}
                >
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(t.completed / t.required) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portal overview video */}
        <div className="order-2 rounded-2xl border border-brand/30 bg-brand-soft p-5 shadow-sm shadow-ink/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-brand">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-display text-base font-semibold text-ink">
                    Watch the Internship Portal Overview Video
                  </h2>
                  <Chip tone="brand">Completed</Chip>
                </div>
                <p className="mt-0.5 text-sm text-ink-mute">Portal guide completed.</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-ink/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-ink/40 hover:bg-paper-soft sm:w-auto"
            >
              <PlayCircle className="h-4 w-4" /> Watch again
            </button>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="order-4 grid gap-4 md:grid-cols-3">
          <StatTile eyebrow="Current week" value="Week 1" foot="Assignment plan" />
          <StatTile eyebrow="Submitted" value="0/39" foot="assignments submitted or complete" />
          <StatTile eyebrow="Capstone" value="Not submitted" foot="Machine Learning status" />
        </div>

        {/* Recommended + Capstone + Up next */}
        <div className="order-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="eyebrow">Recommended this week</h2>
              <Chip>10</Chip>
            </div>
            <div className="mt-4 grid gap-3">
              {recommended.map((r) => (
                <div key={r.id} className="rounded-xl border border-line bg-paper-soft p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone="brand">This week</Chip>
                    <Chip>{r.tag}</Chip>
                  </div>
                  <div className="mt-2 text-sm font-medium text-ink">{r.title}</div>
                  {r.href && (
                    <Link
                      href={r.href}
                      className="mt-3 inline-flex h-8 items-center justify-center gap-2 rounded-xl border border-ink/20 bg-white px-2.5 text-xs font-medium text-ink hover:border-ink/40 hover:bg-paper-soft"
                    >
                      Open resource
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="eyebrow">Capstone</h2>
              <Chip tone="brand">Not submitted</Chip>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-mute">
              Keep your final Machine Learning artifact separate from weekly assignments and
              submit it when it is ready.
            </p>
            <Link
              href="/intern/assignments?mode=capstones"
              className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-ink/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-ink/40 hover:bg-paper-soft"
            >
              Submit capstone
            </Link>
          </Card>

          <Card>
            <h2 className="eyebrow">Up next</h2>
            <div className="mt-3 rounded-xl bg-paper-soft p-4 text-sm text-ink-mute">
              No upcoming events are scheduled yet. When admin publishes one, it will appear
              here.
            </div>
          </Card>
        </div>

        {/* Certificate progress */}
        <Card className="order-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="eyebrow">Certificate progress</h2>
              <p className="mt-2 text-sm text-ink-mute">
                0/2 track certificates qualified. Each track needs five of its own assignments
                and its accepted capstone.
              </p>
            </div>
            <Chip tone="brand">0/2 qualified</Chip>
          </div>
          <div className="mt-4 grid gap-2">
            {tracks.map((t) => (
              <div
                key={t.key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-paper-soft px-3 py-2 text-sm"
              >
                <span className="font-medium text-ink">{t.label}</span>
                <span className="text-ink-mute">
                  {t.completed}/{t.required} assignments · capstone {t.capstone}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-mute">
            Required onboarding: 15/15 complete. It remains part of the internship but does not
            block track-certificate eligibility.
          </p>
          <Link
            href="/intern/completion"
            className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-ink/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-ink/40 hover:bg-paper-soft"
          >
            Open Completion
          </Link>
        </Card>

        {/* Your credential */}
        <Card className="order-7">
          <div className="flex items-center justify-between">
            <h2 className="eyebrow">Your credential</h2>
            <Chip tone="brand">In progress</Chip>
          </div>
          <p className="mt-3 text-sm text-ink-mute">
            Complete at least five assignments and an accepted capstone in a track to earn that
            track&apos;s certificate. All your tracks qualify independently.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/intern/completion"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-ink/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-ink/40 hover:bg-paper-soft"
            >
              Open Completion
            </Link>
          </div>
        </Card>

        {/* LinkedIn share banner */}
        <div className="order-8 rounded-2xl border border-line bg-paper-soft p-5 shadow-sm shadow-ink/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink">
              <span aria-hidden="true">✓ </span>ONJI added to your LinkedIn — share it with your
              network
            </p>
            <Link
              href="/intern/linkedin"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-ink/20 bg-white px-3.5 text-sm font-medium text-ink hover:border-ink/40 hover:bg-paper-soft"
            >
              Open share panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
