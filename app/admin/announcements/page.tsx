"use client";

import { Bell } from "lucide-react";
import { ContentEditor } from "@/components/ContentEditor";

export default function AdminAnnouncementsPage() {
  return (
    <ContentEditor
      collectionName="announcements"
      title="Announcements"
      description="Program-wide updates shown to all interns."
      icon={Bell}
      titleField="title"
      fields={[
        { key: "title", label: "Title", type: "text", required: true, listCol: true },
        { key: "body", label: "Body", type: "textarea", required: true },
        { key: "pinned", label: "Pinned", type: "boolean", listCol: true },
        { key: "publishedAt", label: "Published at", type: "date" },
      ]}
    />
  );
}
