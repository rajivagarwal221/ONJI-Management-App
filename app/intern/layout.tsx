import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/lib/auth";

export default function InternLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-dvh overflow-x-clip bg-paper-soft text-ink">
        <div className="md:grid md:min-h-dvh md:grid-cols-[268px_1fr]">
          <Sidebar />
          <div className="relative min-w-0 overflow-x-clip">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(180,96,31,0.14),transparent_28rem),linear-gradient(180deg,rgba(255,255,255,0.76),rgba(245,238,226,0.92)_18rem,rgba(243,230,216,0.98))]"
            />
            <main className="relative min-w-0 px-4 py-5 sm:px-5 md:px-8 md:py-8">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
