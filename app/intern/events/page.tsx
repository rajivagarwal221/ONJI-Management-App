import { Button, Card, Empty, PageHeader } from "@/components/ui";

const events: {
  id: string;
  title: string;
  when: string;
  host: string;
  rsvp: boolean;
}[] = [];

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Events"
        title="Upcoming events"
        description="Office hours, guest talks, and live walkthroughs. All are optional and recorded."
      />
      {events.length === 0 ? (
        <Empty
          title="No upcoming events scheduled yet."
          description="When admins publish one, it will appear here and in your dashboard."
        />
      ) : (
        <div className="grid gap-4">
          {events.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{e.title}</h3>
                  <p className="mt-1 text-sm text-ink-mute">
                    {e.when} · hosted by {e.host}
                  </p>
                </div>
                <Button>{e.rsvp ? "Attending" : "RSVP"}</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
