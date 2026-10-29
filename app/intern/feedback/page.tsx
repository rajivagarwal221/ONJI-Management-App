"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import {
  Banner,
  Button,
  Card,
  Field,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";

export default function FeedbackPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState<"bug" | "feature" | "program" | "other">("bug");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setErr(null);
    try {
      await addDoc(collection(firebaseDb(), "feedback"), {
        userId: user.uid,
        category,
        message,
        createdAt: serverTimestamp(),
      });
      setDone(true);
      setMessage("");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={MessageSquarePlus}
        eyebrow="Feedback"
        title="Tell us what to fix"
        description="Everything you send here goes to the ONJI team. We read every one."
      />

      {err && <Banner tone="error">{err}</Banner>}
      {done && (
        <Banner tone="success">
          Thanks — your feedback is in. We&apos;ll follow up if we need more.
        </Banner>
      )}

      <Card>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Category">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
            >
              <option value="bug">Bug</option>
              <option value="feature">Feature request</option>
              <option value="program">Program feedback</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="What happened?">
            <Textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A short description helps us act on it. Include links or screenshots if useful."
            />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" loading={busy}>
              Send feedback
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
