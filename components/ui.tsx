import Link from "next/link";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="eyebrow text-brand">{eyebrow}</div>}
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight tracking-normal text-ink sm:text-3xl md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-mute md:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({
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

export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "brand" | "neutral" | "success" | "warn";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "brand"
      ? "border-brand/40 bg-brand-soft text-brand"
      : tone === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
      : tone === "warn"
      ? "border-amber-300 bg-amber-50 text-amber-700"
      : "border-line-strong bg-paper-soft text-ink-mute";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function Button({
  href,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  children,
}: {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  type?: "button" | "submit";
  className?: string;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors";
  const variants = {
    primary:
      "bg-brand-bright text-brand-fg shadow-brand hover:bg-brand-hover active:bg-brand-press",
    secondary:
      "border border-ink/20 bg-white text-ink hover:border-ink/40 hover:bg-paper-soft",
    ghost: "bg-transparent text-ink-mute hover:bg-paper-soft hover:text-ink",
  };
  const sizes = {
    sm: "h-8 px-2.5 text-xs rounded-lg",
    md: "h-9 px-3.5 text-sm rounded-xl",
  };
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function Empty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-paper-soft/60 p-10 text-center">
      <div className="font-display text-lg font-semibold text-ink">{title}</div>
      {description && (
        <p className="mt-2 text-sm text-ink-mute">{description}</p>
      )}
    </div>
  );
}
