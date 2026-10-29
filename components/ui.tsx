"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

/* ---------- PageHeader ---------- */

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="eyebrow text-brand">{eyebrow}</div>}
        <div className="mt-2 flex items-start gap-3">
          {Icon && (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold leading-tight tracking-normal text-ink sm:text-3xl md:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-mute md:text-base">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ---------- Card ---------- */

export function Card({
  className = "",
  children,
  interactive,
}: {
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-line-strong bg-paper-elev p-5 shadow-sm shadow-ink/5 ${
        interactive
          ? "transition hover:shadow-md hover:border-brand/30 hover:-translate-y-0.5"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Chip ---------- */

export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "brand" | "neutral" | "success" | "warn" | "danger";
  children: React.ReactNode;
}) {
  const toneClass = {
    brand: "border-brand/40 bg-brand-soft text-brand",
    neutral: "border-line-strong bg-paper-soft text-ink-mute",
    success: "border-emerald-300 bg-emerald-50 text-emerald-700",
    warn: "border-amber-300 bg-amber-50 text-amber-800",
    danger: "border-red-300 bg-red-50 text-red-700",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${toneClass}`}
    >
      {children}
    </span>
  );
}

/* ---------- Button ---------- */

export function Button({
  href,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  loading,
  className = "",
  children,
}: {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const variants = {
    primary:
      "bg-brand-bright text-brand-fg shadow-brand hover:bg-brand-hover active:bg-brand-press",
    secondary:
      "border border-ink/20 bg-white text-ink hover:border-ink/40 hover:bg-paper-soft",
    ghost: "bg-transparent text-ink-mute hover:bg-paper-soft hover:text-ink",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  };
  const sizes = {
    sm: "h-8 px-2.5 text-xs rounded-lg",
    md: "h-9 px-3.5 text-sm rounded-xl",
    lg: "h-11 px-5 text-base rounded-xl",
  };
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cls}>
      {content}
    </button>
  );
}

/* ---------- Empty ---------- */

export function Empty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-paper-soft/60 p-10 text-center">
      {Icon && (
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div className="font-display text-lg font-semibold text-ink">{title}</div>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-mute">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Loading skeleton ---------- */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-line/60 ${className}`} />;
}

export function LoadingPanel({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-line bg-white p-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-3 w-72 max-w-full" />
          <Skeleton className="mt-2 h-3 w-56 max-w-full" />
        </div>
      ))}
    </div>
  );
}

/* ---------- Field / Input / Textarea / Select ---------- */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-mute">
        {label}
      </span>
      {children}
      {hint && <span className="text-xs text-ink-mute/80">{hint}</span>}
    </label>
  );
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={`h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${
        props.className || ""
      }`}
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`rounded-xl border border-line bg-white p-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${
        props.className || ""
      }`}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={`h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${
        props.className || ""
      }`}
    />
  );
}

/* ---------- Section ---------- */

export function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-ink-mute">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ---------- Progress ---------- */

export function Progress({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs text-ink-mute">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-paper-soft">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Toast banner ---------- */

export function Banner({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error";
  children: React.ReactNode;
}) {
  const toneCls = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-emerald-300 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-700",
  }[tone];
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${toneCls}`}>
      {children}
    </div>
  );
}
