"use client";

import { CalendarDays } from "lucide-react";
import { ContentEditor } from "@/components/ContentEditor";

export default function AdminEventsPage() {
  return (
    <ContentEditor
      collectionName="events"
      title="Events"
      description="Office hours, guest talks, live walkthroughs. Published events show up on the intern dashboard."
      icon={CalendarDays}
      titleField="title"
      fields={[
        { key: "title", label: "Title", type: "text", required: true, listCol: true },
        { key: "startsAt", label: "Starts at", type: "date", required: true, listCol: true },
        { key: "host", label: "Host", type: "text", required: true },
        { key: "joinUrl", label: "Join URL", type: "url" },
      ]}
    />
  );
}
