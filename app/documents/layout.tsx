import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ONJI Document",
};

// Plain shell — no sidebar, no padding. Pages render letter-sized content
// and provide a Print button that triggers window.print().
export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-neutral-200 print:bg-white">{children}</div>;
}
