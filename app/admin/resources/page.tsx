"use client";

import { BookOpen } from "lucide-react";
import { ContentEditor } from "@/components/ContentEditor";

export default function AdminResourcesPage() {
  return (
    <ContentEditor
      collectionName="resources"
      title="Resources"
      description="Reading, videos, and starter repos. Interns see them on their Resources page."
      icon={BookOpen}
      titleField="title"
      fields={[
        { key: "title", label: "Title", type: "text", required: true, listCol: true },
        { key: "href", label: "URL", type: "url" },
        {
          key: "track",
          label: "Track",
          type: "select",
          options: [
            { value: "all", label: "All tracks" },
            { value: "fluency", label: "AI Fluency" },
            { value: "ml", label: "Machine Learning" },
            { value: "ai-eng", label: "AI Engineering" },
          ],
          listCol: true,
        },
        { key: "week", label: "Week", type: "number", listCol: true },
        {
          key: "level",
          label: "Level",
          type: "select",
          options: [
            { value: "Beginner", label: "Beginner" },
            { value: "Intermediate", label: "Intermediate" },
            { value: "Advanced", label: "Advanced" },
          ],
          listCol: true,
        },
        { key: "locked", label: "Locked (hidden until the week it belongs to)", type: "boolean" },
      ]}
    />
  );
}
