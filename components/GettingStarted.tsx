"use client";

import Link from "next/link";
import { Check, ChevronRight, ListChecks, PlayCircle, Rocket, UserCog, Zap } from "lucide-react";
import { Card, Chip, Progress } from "./ui";

export type GuideStep = {
  key: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
  done: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

export function GettingStarted({ steps }: { steps: GuideStep[] }) {
  const done = steps.filter((s) => s.done).length;
  const pct = steps.length ? (done / steps.length) * 100 : 0;
  const next = steps.find((s) => !s.done);

  if (done === steps.length) {
    return (
      <Card className="border-emerald-300 bg-emerald-50/50">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-200 text-emerald-800">
            <Rocket className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-emerald-800">
              You&apos;re all set up
            </h2>
            <p className="mt-1 text-sm text-emerald-800/80">
              Great work — the Getting Started guide is complete. Focus on your
              assignments from here.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-brand/30 bg-gradient-to-br from-brand-soft to-paper-elev">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand text-white">
          <Zap className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-ink">
              Getting Started
            </h2>
            <Chip tone="brand">
              {done}/{steps.length} done
            </Chip>
          </div>
          <p className="mt-1 text-sm text-ink-mute">
            Five quick steps to settle you in. Finish them and your dashboard
            gets quieter.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={pct} />
      </div>

      <ol className="mt-5 grid gap-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const current = step.key === next?.key;
          return (
            <li
              key={step.key}
              className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                step.done
                  ? "border-line bg-paper-soft/60"
                  : current
                    ? "border-brand/40 bg-paper-elev shadow-sm"
                    : "border-line bg-paper-elev"
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                  step.done
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-brand-soft text-brand"
                }`}
              >
                {step.done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
                    Step {i + 1}
                  </span>
                  <span className="font-medium text-ink">{step.title}</span>
                  {current && <Chip tone="brand">Next</Chip>}
                </div>
                <p className="mt-1 text-sm text-ink-mute">{step.description}</p>
              </div>
              {!step.done && (
                <Link
                  href={step.cta.href}
                  className="shrink-0 inline-flex h-9 items-center gap-1 rounded-xl bg-brand-bright px-3 text-sm font-medium text-brand-fg shadow-brand hover:bg-brand-hover"
                >
                  {step.cta.label}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

// Default icons the dashboard uses when wiring up steps
export const StepIcons = {
  profile: UserCog,
  onboarding: ListChecks,
  track: PlayCircle,
};
