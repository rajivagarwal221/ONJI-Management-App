export function OnjiMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <rect x="4" y="4" width="92" height="92" rx="14" fill="#A4521E" />
      <circle cx="34" cy="36" r="14" fill="#FBF7F0" />
      <path d="M26 78 L74 78 L74 30 Z" fill="#FBF7F0" />
    </svg>
  );
}

export function OnjiWordmark({ className = "h-6" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <OnjiMark className="h-7 w-7" />
      <span className="font-display text-lg font-semibold tracking-tight text-paper">
        ONJI
      </span>
    </div>
  );
}
