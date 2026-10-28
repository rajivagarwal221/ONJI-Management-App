import Link from "next/link";
import {
  LayoutDashboard,
  UserCog,
  ListChecks,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  CalendarDays,
  NotebookPen,
  Bell,
  Mail,
  MessageSquarePlus,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { OnjiWordmark } from "./Logo";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

type NavSection = { title: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    title: "Start",
    items: [
      { href: "/intern", label: "Dashboard", icon: LayoutDashboard },
      { href: "/intern/profile", label: "Profile", icon: UserCog, badge: "100%" },
      { href: "/intern/onboarding", label: "Onboarding", icon: ListChecks, badge: "100%" },
      { href: "/intern/courses", label: "Anthropic Certs", icon: GraduationCap, badge: "0%" },
    ],
  },
  {
    title: "Program",
    items: [
      { href: "/intern/tracks", label: "Tracks", icon: BookOpen },
      { href: "/intern/assignments", label: "Assignments", icon: ClipboardCheck },
      { href: "/intern/schedule", label: "Schedule", icon: CalendarDays },
      { href: "/intern/events", label: "Events", icon: CalendarDays },
      { href: "/intern/completion", label: "Completion", icon: GraduationCap },
      { href: "/intern/resources", label: "Resources", icon: BookOpen },
      { href: "/intern/notes", label: "Study notes", icon: NotebookPen },
      { href: "/intern/free-tier", label: "Free Tier", icon: BookOpen },
    ],
  },
  {
    title: "Connect",
    items: [
      { href: "/intern/announcements", label: "Announcements", icon: Bell, badge: "36" },
      { href: "/intern/inbox", label: "E-Mail Inbox", icon: Mail, badge: "1" },
    ],
  },
  {
    title: "Records",
    items: [
      { href: "/intern/submissions", label: "Submissions", icon: ClipboardCheck },
      { href: "/intern/questions", label: "Questions", icon: MessageSquarePlus },
    ],
  },
];

function NavLink({ item, active }: { item: NavItem; active?: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      data-active={active || undefined}
      className="flex h-10 items-center justify-between gap-3 rounded-xl px-3 text-sm no-underline transition-all text-paper/70 hover:bg-white/[0.07] hover:text-paper data-[active=true]:bg-white/10 data-[active=true]:text-paper"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </span>
      {item.badge && (
        <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-paper/70">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ activePath = "/intern" }: { activePath?: string }) {
  return (
    <aside className="relative hidden md:sticky md:top-0 md:flex md:h-dvh md:max-h-dvh md:flex-col overflow-hidden border-r border-white/10 bg-ink text-paper w-[268px]">
      {/* decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60" aria-hidden="true">
        <div className="absolute inset-0 bg-[#1C0F06]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(180,96,31,0.18),transparent_55%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      {/* header */}
      <div className="relative flex h-16 items-center justify-between gap-2.5 border-b border-white/10 px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 no-underline">
          <OnjiWordmark />
          <span className="rounded-full border border-brand-bright/40 bg-brand-bright/15 px-2 py-0.5 text-[11px] font-semibold text-brand-bright">
            Intern
          </span>
        </Link>
      </div>

      {/* nav */}
      <nav className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, i) => (
          <div key={section.title} className={i === 0 ? "" : "mt-1"}>
            <div className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-paper/40">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} active={item.href === activePath} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* account */}
      <div className="relative shrink-0 border-t border-white/10 bg-white/[0.035] p-3">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-sm transition-colors hover:border-white/20 hover:bg-white/10 [&::-webkit-details-marker]:hidden">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-paper-soft text-xs font-semibold text-ink shadow-sm">
              RA
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium text-paper">Rajiv Agarwal</span>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-paper/60">
                  Intern
                </span>
              </div>
              <div className="truncate text-xs text-paper/50">arajiv221@gmail.com</div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-paper/55 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 space-y-1 rounded-xl border border-white/10 bg-ink/95 p-1.5 shadow-lg">
            <Link
              href="/intern/feedback"
              className="flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm text-paper/65 hover:bg-white/[0.07] hover:text-paper"
            >
              <MessageSquarePlus className="h-4 w-4" /> Feedback
            </Link>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm text-paper/70 hover:bg-white/[0.07] hover:text-paper"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </form>
          </div>
        </details>
      </div>
    </aside>
  );
}
