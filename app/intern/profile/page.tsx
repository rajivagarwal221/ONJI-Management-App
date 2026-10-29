"use client";

import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { UserCog } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import { Banner, Button, Card, Chip, Field, Input, PageHeader } from "@/components/ui";

type ProfileForm = {
  displayName: string;
  country: string;
  timezone: string;
  linkedin: string;
  github: string;
};

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState<ProfileForm>({
    displayName: "",
    country: "",
    timezone: "",
    linkedin: "",
    github: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const p = profile as unknown as ProfileForm & Record<string, unknown>;
    setForm({
      displayName: p.displayName || "",
      country: p.country || "",
      timezone: p.timezone || "",
      linkedin: p.linkedin || "",
      github: p.github || "",
    });
  }, [profile]);

  const refNo = (profile as unknown as { referenceNo?: string } | null)?.referenceNo;
  const email = user?.email;
  const cohort = (profile as unknown as { cohort?: string } | null)?.cohort;
  const primaryTrack = (profile as unknown as { primaryTrack?: string } | null)?.primaryTrack;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      await setDoc(
        doc(firebaseDb(), "users", user.uid),
        {
          country: form.country || null,
          timezone: form.timezone || null,
          linkedin: form.linkedin || null,
          github: form.github || null,
        },
        { merge: true },
      );
      setMsg("Profile saved.");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserCog}
        eyebrow="Profile"
        title="Your intern profile"
        description="Shown to mentors and used on your public certificate when you qualify."
      />

      {msg && <Banner tone="success">{msg}</Banner>}
      {err && <Banner tone="error">{err}</Banner>}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="eyebrow">Identity</h2>
          <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={form.displayName} readOnly disabled />
            </Field>
            <Field label="Email">
              <Input value={email || ""} readOnly disabled />
            </Field>
            <Field label="Country">
              <Input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="India"
              />
            </Field>
            <Field label="Timezone">
              <Input
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                placeholder="Asia/Kolkata (UTC+5:30)"
              />
            </Field>
            <Field label="LinkedIn URL">
              <Input
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                placeholder="linkedin.com/in/your-handle"
              />
            </Field>
            <Field label="GitHub URL">
              <Input
                value={form.github}
                onChange={(e) => setForm({ ...form, github: e.target.value })}
                placeholder="github.com/your-handle"
              />
            </Field>

            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="eyebrow">Program</h2>
            <dl className="mt-3 grid gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-mute">
                  Reference No.
                </dt>
                <dd className="font-mono text-ink">{refNo || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-mute">
                  Primary track
                </dt>
                <dd className="text-ink">{primaryTrack || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-mute">
                  Cohort
                </dt>
                <dd className="text-ink">{cohort || "—"}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="eyebrow">Visibility</h2>
              <Chip tone="brand">Public</Chip>
            </div>
            <p className="mt-3 text-sm text-ink-mute">
              Verifiers see your name, track, cohort, and reference number when they look up
              your certificate.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
