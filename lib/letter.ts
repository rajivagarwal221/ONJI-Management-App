// Shared helpers for formatting data in the offer letter / certificate.

export type LetterIntern = {
  uid: string;
  displayName: string;
  email: string;
  institute?: string;
  primaryTrack?: string;
  referenceNo?: string;
  startDate?: string; // ISO yyyy-mm-dd
  endDate?: string; // ISO yyyy-mm-dd
  durationMonths?: number;
  completed?: boolean;
  completedAt?: unknown;
  lorIssued?: boolean;
  lorIssuedAt?: unknown;
};

export function formatLongDate(iso?: string | Date): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function offerRef(referenceNo?: string): string {
  // Internal reference prefix for offer letters.
  return referenceNo ? `OS/HR/IOL/${referenceNo}` : "OS/HR/IOL/—";
}

export function certRef(referenceNo?: string): string {
  return referenceNo ? `OS/HR/ICL/${referenceNo}` : "OS/HR/ICL/—";
}

export function lorRef(referenceNo?: string): string {
  return referenceNo ? `OS/HR/LOR/${referenceNo}` : "OS/HR/LOR/—";
}

export function monthsBetween(startIso?: string, endIso?: string): number {
  if (!startIso || !endIso) return 0;
  const a = new Date(startIso);
  const b = new Date(endIso);
  return Math.max(
    0,
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()),
  );
}

export function durationWord(months: number): string {
  const map: Record<number, string> = {
    1: "one-month",
    2: "two-month",
    3: "three-month",
    4: "four-month",
    5: "five-month",
    6: "six-month",
    7: "seven-month",
    8: "eight-month",
    9: "nine-month",
    10: "ten-month",
    11: "eleven-month",
    12: "twelve-month",
  };
  return map[months] || `${months}-month`;
}

// Primary focus area used in the completion certificate body text.
export function trackFocus(primaryTrack?: string): string {
  switch (primaryTrack) {
    case "ml":
      return "Machine Learning";
    case "fluency":
      return "AI Fluency";
    case "ai-eng":
      return "AI Engineering";
    default:
      return "Software Development";
  }
}
