"use client";

import { ClipboardCheck } from "lucide-react";
import { ContentEditor } from "@/components/ContentEditor";

export default function AdminAssignmentsPage() {
  return (
    <ContentEditor
      collectionName="assignments"
      title="Assignments"
      description="Weekly assignments and capstones."
      icon={ClipboardCheck}
      titleField="title"
      fields={[
        { key: "title", label: "Title", type: "text", required: true, listCol: true },
        {
          key: "track",
          label: "Track",
          type: "select",
          required: true,
          listCol: true,
          options: [
            { value: "fluency", label: "AI Fluency" },
            { value: "ml", label: "Machine Learning" },
            { value: "ai-eng", label: "AI Engineering" },
          ],
        },
        { key: "week", label: "Week", type: "number", required: true, listCol: true },
        { key: "due", label: "Due date", type: "date" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "isCapstone", label: "Capstone", type: "boolean" },
      ]}
    />
  );
}
