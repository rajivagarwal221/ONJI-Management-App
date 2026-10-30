import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "ONJI Document",
};

// Plain shell — no sidebar, no padding. Pages render letter-sized content
// and provide a Print button that triggers window.print(). Wrapped in
// AuthProvider so useAuth() works for the admin/intern access checks.
export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-dvh bg-neutral-200 print:bg-white">{children}</div>
    </AuthProvider>
  );
}
