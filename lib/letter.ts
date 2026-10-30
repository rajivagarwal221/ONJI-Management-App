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

// Reference numbers now live in canonical OS/HR/IOL/{YYYY}/{seq} form
// (see lib/refs.ts). Offer letters use it as-is; certificate / LOR
// swap the document-type segment. Legacy refs (ONJI-YYYY-NNNN from
// older interns) fall back to the historical prefixed form.
export function offerRef(referenceNo?: string): string {
  if (!referenceNo) return "OS/HR/IOL/—";
  if (referenceNo.startsWith("OS/HR/")) return referenceNo;
  return `OS/HR/IOL/${referenceNo}`;
}

export function certRef(referenceNo?: string): string {
  if (!referenceNo) return "OS/HR/ICL/—";
  if (referenceNo.startsWith("OS/HR/"))
    return referenceNo.replace(/^OS\/HR\/[A-Z]+\//, "OS/HR/ICL/");
  return `OS/HR/ICL/${referenceNo}`;
}

export function lorRef(referenceNo?: string): string {
  if (!referenceNo) return "OS/HR/LOR/—";
  if (referenceNo.startsWith("OS/HR/"))
    return referenceNo.replace(/^OS\/HR\/[A-Z]+\//, "OS/HR/LOR/");
  return `OS/HR/LOR/${referenceNo}`;
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
