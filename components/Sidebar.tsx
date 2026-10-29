"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
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
  FileText,
} from "lucide-react";
import { OnjiWordmark } from "./Logo";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

type NavSection = { title: string; items: NavItem[] };

// Fields counted toward "profile completeness".
const PROFILE_FIELDS = ["country", "timezone", "linkedin", "github"] as const;

function profilePct(profile: Record<string, unknown> | null): number {
  if (!profile) return 0;
  const filled = PROFILE_FIELDS.filter((k) => {
    const v = profile[k];
    return typeof v === "string" && v.trim().length > 0;
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

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

export function Sidebar() {
  const pathname = usePathname() || "/intern";
  const { user, profile, signOutUser } = useAuth();

  const [onbPct, setOnbPct] = useState<number | null>(null);
  const [coursesPct, setCoursesPct] = useState<number | null>(null);
  const [announcementsCount, setAnnouncementsCount] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  const uid = user?.uid;

  // Onboarding %
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(
      collection(firebaseDb(), "users", uid, "onboarding"),
      (snap) => {
        const total = snap.size;
        if (total === 0) {
          setOnbPct(null);
          return;
        }
        const done = snap.docs.filter(
          (d) => (d.data() as { done?: boolean }).done,
        ).length;
        setOnbPct(Math.round((done / total) * 100));
      },
      () => setOnbPct(null),
    );
    return () => unsub();
  }, [uid]);

  // Courses % — compare /courses total vs user's /completedCourses
  useEffect(() => {
    if (!uid) return;
    let totalCourses = 0;
    let completed = 0;

    const unsubTotal = onSnapshot(
      collection(firebaseDb(), "courses"),
      (snap) => {
        totalCourses = snap.size;
        update();
      },
      () => setCoursesPct(null),
    );
    const unsubDone = onSnapshot(
      collection(firebaseDb(), "users", uid, "completedCourses"),
      (snap) => {
        completed = snap.size;
        update();
      },
      () => setCoursesPct(null),
    );

    function update() {
      if (totalCourses === 0) {
        setCoursesPct(null);
        return;
      }
      setCoursesPct(Math.round((completed / totalCourses) * 100));
    }

    return () => {
      unsubTotal();
      unsubDone();
    };
  }, [uid]);

  // Announcements count
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(
      collection(firebaseDb(), "announcements"),
      (snap) => setAnnouncementsCount(snap.size),
      () => setAnnouncementsCount(null),
    );
    return () => unsub();
  }, [uid]);

  // Unread inbox count
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(
      query(
        collection(firebaseDb(), "users", uid, "inbox"),
        where("unread", "==", true),
      ),
      (snap) => setUnreadCount(snap.size),
      () => setUnreadCount(null),
    );
    return () => unsub();
  }, [uid]);

  const pPct = profilePct(profile as unknown as Record<string, unknown> | null);

  const sections: NavSection[] = [
    {
      title: "Start",
      items: [
        { href: "/intern", label: "Dashboard", icon: LayoutDashboard },
        {
          href: "/intern/profile",
          label: "Profile",
          icon: UserCog,
          badge: `${pPct}%`,
        },
        {
          href: "/intern/onboarding",
          label: "Onboarding",
          icon: ListChecks,
          badge: onbPct == null ? undefined : `${onbPct}%`,
        },
        {
          href: "/intern/courses",
          label: "Anthropic Certs",
          icon: GraduationCap,
          badge: coursesPct == null ? undefined : `${coursesPct}%`,
        },
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
        {
          href: "/intern/announcements",
          label: "Announcements",
          icon: Bell,
          badge: announcementsCount ? String(announcementsCount) : undefined,
        },
        {
          href: "/intern/inbox",
          label: "E-Mail Inbox",
          icon: Mail,
          badge: unreadCount ? String(unreadCount) : undefined,
        },
      ],
    },
    {
      title: "Records",
      items: [
        { href: "/intern/submissions", label: "Submissions", icon: ClipboardCheck },
        { href: "/intern/questions", label: "Questions", icon: MessageSquarePlus },
        { href: "/intern/documents", label: "Documents", icon: FileText },
      ],
    },
  ];

  const displayName =
    (profile as unknown as { displayName?: string } | null)?.displayName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Intern";
  const email = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="relative hidden md:sticky md:top-0 md:flex md:h-dvh md:max-h-dvh md:flex-col overflow-hidden border-r border-white/10 bg-ink text-paper w-[268px]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60" aria-hidden="true">
        <div className="absolute inset-0 bg-[#1C0F06]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(180,96,31,0.18),transparent_55%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative flex h-16 items-center justify-between gap-2.5 border-b border-white/10 px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 no-underline">
          <OnjiWordmark />
          <span className="rounded-full border border-brand-bright/40 bg-brand-bright/15 px-2 py-0.5 text-[11px] font-semibold text-brand-bright">
            Intern
          </span>
        </Link>
      </div>

      <nav className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, i) => (
          <div key={section.title} className={i === 0 ? "" : "mt-1"}>
            <div className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-paper/40">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={
                    item.href === pathname ||
                    (item.href !== "/intern" && pathname.startsWith(item.href + "/"))
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative shrink-0 border-t border-white/10 bg-white/[0.035] p-3">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-sm transition-colors hover:border-white/20 hover:bg-white/10 [&::-webkit-details-marker]:hidden">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-paper-soft text-xs font-semibold text-ink shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium text-paper">{displayName}</span>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-paper/60">
                  Intern
                </span>
              </div>
              <div className="truncate text-xs text-paper/50">{email}</div>
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
            <button
              type="button"
              onClick={() => void signOutUser().catch(() => {})}
              className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm text-paper/70 hover:bg-white/[0.07] hover:text-paper"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </details>
      </div>
    </aside>
  );
}
