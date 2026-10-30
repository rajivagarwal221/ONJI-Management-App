"use client";

import { BookOpen } from "lucide-react";
import { ContentEditor } from "@/components/ContentEditor";

export default function AdminTracksPage() {
  return (
    <ContentEditor
      collectionName="tracks"
      title="Tracks"
      description="Program tracks. Each track needs five accepted assignments plus an accepted capstone to issue a certificate."
      icon={BookOpen}
      titleField="name"
      fields={[
        { key: "name", label: "Name", type: "text", required: true, listCol: true },
        { key: "summary", label: "Summary", type: "textarea" },
        { key: "requiredAssignments", label: "Required assignments", type: "number", placeholder: "5" },
        { key: "weeks", label: "Weeks", type: "number", placeholder: "6" },
        { key: "order", label: "Order", type: "number", hint: "Lower numbers sort first" },
      ]}
    />
  );
}
