import { Card, Chip, PageHeader } from "@/components/ui";

const messages = [
  {
    id: "m-01",
    from: "ONJI Program",
    subject: "Welcome to the July 2026 cohort",
    preview: "Here is everything you need for Week 1 — track pages, assignment list, and office hours.",
    date: "Oct 02",
    unread: true,
  },
  {
    id: "m-02",
    from: "Mentor Priya Shah",
    subject: "Nice intro assignment",
    preview: "Loved the data-leak writeup — one small suggestion on how you framed the metric.",
    date: "Oct 10",
    unread: false,
  },
];

export default function InboxPage() {
  const unread = messages.filter((m) => m.unread).length;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="E-Mail Inbox"
        title="Program inbox"
        description="Personal messages from mentors and the program team. Separate from public announcements."
        action={<Chip tone="brand">{unread} unread</Chip>}
      />
      <Card className="p-0 overflow-hidden">
        <ul className="divide-y divide-line">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`grid grid-cols-[180px_1fr_80px] items-center gap-4 px-5 py-4 ${
                m.unread ? "bg-brand-soft/40" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-ink">{m.from}</div>
                {m.unread && <Chip tone="brand">New</Chip>}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-ink">{m.subject}</div>
                <div className="truncate text-xs text-ink-mute">{m.preview}</div>
              </div>
              <div className="text-right text-xs text-ink-mute">{m.date}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
