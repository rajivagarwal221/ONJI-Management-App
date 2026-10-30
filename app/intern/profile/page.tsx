"use client";

import { useEffect, useRef, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import {
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
  Upload,
  UserCog,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { firebaseDb } from "@/lib/firebase";
import {
  Banner,
  Button,
  Card,
  Chip,
  Field,
  Input,
  PageHeader,
  Progress,
  Section,
  Select,
  Textarea,
} from "@/components/ui";

type ProfileForm = {
  displayName: string;
  secondaryEmail: string;
  country: string;
  city: string;
  timezone: string;
  university: string;
  linkedin: string;
  github: string;
  portfolio: string;
  behance: string;
  dribbble: string;
  twitter: string;
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  discord: string;
  reddit: string;
  newsletter: string;
  otherLink: string;
  oneLiner: string;
  hobbies: string;
  favoriteSport: string;
  favoriteMoment: string;
  askMeAbout: string;
  techStack: string[];
  aiTools: string[];
  buildingYears: string;
  aspirations12m: string;
  cvFileName?: string;
};

const EMPTY: ProfileForm = {
  displayName: "",
  secondaryEmail: "",
  country: "",
  city: "",
  timezone: "",
  university: "",
  linkedin: "",
  github: "",
  portfolio: "",
  behance: "",
  dribbble: "",
  twitter: "",
  instagram: "",
  facebook: "",
  youtube: "",
  tiktok: "",
  discord: "",
  reddit: "",
  newsletter: "",
  otherLink: "",
  oneLiner: "",
  hobbies: "",
  favoriteSport: "",
  favoriteMoment: "",
  askMeAbout: "",
  techStack: [],
  aiTools: [],
  buildingYears: "",
  aspirations12m: "",
};

const BUILDING_YEARS_OPTIONS = [
  "Less than 1 year",
  "1 to 3 years",
  "3 to 5 years",
  "5 to 10 years",
  "10+ years",
];

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseInfo, setParseInfo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!profile) return;
    const p = profile as unknown as Partial<ProfileForm> & Record<string, unknown>;
    setForm({
      ...EMPTY,
      ...Object.fromEntries(
        Object.keys(EMPTY).map((k) => [
          k,
          (p[k as keyof ProfileForm] as never) ??
            (EMPTY[k as keyof ProfileForm] as never),
        ]),
      ),
    } as ProfileForm);
  }, [profile]);

  function set<K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      // Only persist editable keys. Strip empty strings so Firestore doesn't
      // fill the doc with "" everywhere.
      const payload: Record<string, unknown> = {};
      (Object.keys(form) as (keyof ProfileForm)[]).forEach((k) => {
        const v = form[k];
        if (Array.isArray(v)) payload[k] = v;
        else if (typeof v === "string") payload[k] = v || null;
        else payload[k] = v;
      });
      await setDoc(doc(firebaseDb(), "users", user.uid), payload, { merge: true });
      setMsg("Profile saved.");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setParseInfo(null);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/parse-resume", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");

      const f = data.fields as Partial<ProfileForm>;
      // Merge extracted fields on top of what's there, but don't overwrite
      // anything the user already typed.
      setForm((prev) => {
        const next = { ...prev };
        (Object.keys(f) as (keyof ProfileForm)[]).forEach((k) => {
          const incoming = f[k];
          const current = prev[k];
          if (incoming == null || incoming === "" ||
              (Array.isArray(incoming) && incoming.length === 0)) return;
          if (Array.isArray(incoming)) {
            const merged = Array.from(
              new Set([...(current as string[] | undefined || []), ...incoming]),
            );
            (next as Record<string, unknown>)[k] = merged;
          } else if (!current || current === "") {
            (next as Record<string, unknown>)[k] = incoming;
          }
        });
        next.cvFileName = file.name;
        return next;
      });

      const filled = Object.values(f).filter(
        (v) => v && (!Array.isArray(v) || v.length > 0),
      ).length;
      setParseInfo(
        `Pulled ${filled} field${filled === 1 ? "" : "s"} from ${file.name}. Review below and click Save.`,
      );
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Parse failed");
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Completion percent — count non-empty fields in a core list.
  const coreKeys: (keyof ProfileForm)[] = [
    "country", "city", "university", "linkedin", "github",
    "oneLiner", "hobbies", "aspirations12m", "buildingYears",
  ];
  const filled = coreKeys.filter((k) => {
    const v = form[k];
    if (Array.isArray(v)) return v.length > 0;
    return !!v;
  }).length;
  const completion = Math.round((filled / coreKeys.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserCog}
        eyebrow="Profile"
        title="Profile"
        description="Keep your identity, learning signal, and schedule context current for mentors, certificates, and program updates."
      />

      {msg && <Banner tone="success">{msg}</Banner>}
      {err && <Banner tone="error">{err}</Banner>}

      {/* Completion */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="eyebrow">Profile completion</h2>
          <Chip tone={completion === 100 ? "success" : "brand"}>{completion}%</Chip>
        </div>
        <p className="mt-2 text-sm text-ink-mute">
          Complete profiles help mentors and evaluators know who they are working with.
        </p>
        <div className="mt-4">
          <Progress value={completion} />
        </div>
      </Card>

      {/* Resume upload */}
      <Card className="border-brand/30 bg-gradient-to-br from-brand-soft to-paper-elev">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-ink">
              Upload your resume to auto-fill
            </h2>
            <p className="mt-1 text-sm text-ink-mute">
              PDF, DOCX, or TXT. We parse it in your browser request, pull out
              name, contact, social links, education, and tech stack, and
              pre-fill the fields below. Nothing is stored — only the fields you
              save end up in your profile.
            </p>
            {parseInfo && (
              <div className="mt-3">
                <Banner tone="success">{parseInfo}</Banner>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={onPickFile}
              />
              <Button
                onClick={() => fileRef.current?.click()}
                loading={parsing}
              >
                <Upload className="h-4 w-4" />
                {parsing ? "Parsing…" : form.cvFileName ? "Re-upload resume" : "Upload resume"}
              </Button>
              {form.cvFileName && (
                <span className="inline-flex items-center gap-2 text-sm text-ink-mute">
                  <FileText className="h-4 w-4" />
                  {form.cvFileName}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={save} className="space-y-6">
        {/* Vitals */}
        <Section
          title="The basics"
          description="These details help mentors, support, and evaluators know who they're working with."
        >
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name *">
                <Input
                  required
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  placeholder="Rajiv Agarwal"
                />
              </Field>
              <Field label="Secondary email" hint="Optional. Used for program updates.">
                <Input
                  value={form.secondaryEmail}
                  onChange={(e) => set("secondaryEmail", e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                />
              </Field>
              <Field label="Country" hint="Optional. Search by country name or code.">
                <Input
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder="India"
                />
              </Field>
              <Field label="City">
                <Input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Mira Bhayandar"
                />
              </Field>
              <Field label="Timezone" hint="Optional. Used for schedule display.">
                <Input
                  value={form.timezone}
                  onChange={(e) => set("timezone", e.target.value)}
                  placeholder="Asia/Kolkata (GMT+05:30)"
                />
              </Field>
              <Field label="University / school">
                <Input
                  value={form.university}
                  onChange={(e) => set("university", e.target.value)}
                  placeholder="University of Mumbai"
                />
              </Field>
            </div>
          </Card>
        </Section>

        {/* Social */}
        <Section title="Profiles and links" description="Share the places where your work and public presence live.">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <SocialField
                label="LinkedIn profile URL"
                value={form.linkedin}
                onChange={(v) => set("linkedin", v)}
                placeholder="https://www.linkedin.com/in/your-handle"
              />
              <SocialField
                label="GitHub"
                value={form.github}
                onChange={(v) => set("github", v)}
                placeholder="https://github.com/your-handle"
              />
              <SocialField
                label="Portfolio / website"
                value={form.portfolio}
                onChange={(v) => set("portfolio", v)}
                placeholder="https://your-portfolio.com"
              />
              <SocialField
                label="Behance"
                value={form.behance}
                onChange={(v) => set("behance", v)}
                placeholder="https://www.behance.net/your-handle"
              />
              <SocialField
                label="Dribbble"
                value={form.dribbble}
                onChange={(v) => set("dribbble", v)}
                placeholder="https://dribbble.com/your-handle"
              />
              <SocialField
                label="X / Twitter"
                value={form.twitter}
                onChange={(v) => set("twitter", v)}
                placeholder="https://x.com/your-handle"
              />
              <SocialField
                label="Instagram"
                value={form.instagram}
                onChange={(v) => set("instagram", v)}
                placeholder="https://www.instagram.com/your-handle"
              />
              <SocialField
                label="Facebook"
                value={form.facebook}
                onChange={(v) => set("facebook", v)}
                placeholder="https://www.facebook.com/your-page"
              />
              <SocialField
                label="YouTube"
                value={form.youtube}
                onChange={(v) => set("youtube", v)}
                placeholder="https://www.youtube.com/@your-channel"
              />
              <SocialField
                label="TikTok"
                value={form.tiktok}
                onChange={(v) => set("tiktok", v)}
                placeholder="https://www.tiktok.com/@your-handle"
              />
              <SocialField
                label="Discord link"
                value={form.discord}
                onChange={(v) => set("discord", v)}
                placeholder="https://discord.com/users/..."
              />
              <SocialField
                label="Reddit"
                value={form.reddit}
                onChange={(v) => set("reddit", v)}
                placeholder="https://www.reddit.com/user/your-handle"
              />
              <SocialField
                label="Newsletter"
                value={form.newsletter}
                onChange={(v) => set("newsletter", v)}
                placeholder="https://your-newsletter.com"
              />
              <SocialField
                label="Other link"
                value={form.otherLink}
                onChange={(v) => set("otherLink", v)}
                placeholder="https://example.com/profile"
              />
            </div>
          </Card>
        </Section>

        {/* About you */}
        <Section
          title="Easy conversation starters"
          description="Short answers work better than a blank bio."
        >
          <Card>
            <div className="grid gap-4">
              <Field label="One-liner" hint="Optional. How you'd introduce yourself in one line.">
                <Input
                  value={form.oneLiner}
                  onChange={(e) => set("oneLiner", e.target.value)}
                  placeholder="Full-Stack & AI Developer by day · Vocalist & Badminton enthusiast by night"
                />
              </Field>
              <Field label="Hobbies and interests">
                <Textarea
                  rows={2}
                  value={form.hobbies}
                  onChange={(e) => set("hobbies", e.target.value)}
                  placeholder="Singing regional classics, dominating the badminton court, and keeping up with seasonal anime."
                />
              </Field>
              <Field label="Favorite sport or team">
                <Input
                  value={form.favoriteSport}
                  onChange={(e) => set("favoriteSport", e.target.value)}
                  placeholder="Badminton"
                />
              </Field>
              <Field label="A favorite moment">
                <Textarea
                  rows={2}
                  value={form.favoriteMoment}
                  onChange={(e) => set("favoriteMoment", e.target.value)}
                  placeholder="I handed my earned money to my parents' hand."
                />
              </Field>
              <Field label="Ask me about…">
                <Textarea
                  rows={2}
                  value={form.askMeAbout}
                  onChange={(e) => set("askMeAbout", e.target.value)}
                  placeholder="LangChain, building 3D interfaces in Three.js, my current go-to karaoke track, or my top anime recommendations."
                />
              </Field>
            </div>
          </Card>
        </Section>

        {/* Tools and experience */}
        <Section
          title="Tools and experience"
          description="Optional context that helps mentors understand how you work."
        >
          <Card>
            <div className="grid gap-5">
              <ChipArrayField
                label="Tech stack"
                hint="Add languages, frameworks, platforms, or tools. Press Enter after each item."
                value={form.techStack}
                onChange={(v) => set("techStack", v)}
                placeholder="Add Python, React, SQL…"
              />
              <ChipArrayField
                label="Favorite AI tools"
                hint="Choose common tools or add your own. Press Enter after each item."
                value={form.aiTools}
                onChange={(v) => set("aiTools", v)}
                placeholder="Add ChatGPT, Claude Code, Cursor…"
              />
              <Field label="Building experience" hint="General software or product building experience, separate from the Builder Ladder.">
                <Select
                  value={form.buildingYears}
                  onChange={(e) => set("buildingYears", e.target.value)}
                >
                  <option value="">Select…</option>
                  {BUILDING_YEARS_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>
        </Section>

        {/* Aspirations */}
        <Section
          title="Next 12 months"
          description="This gives mentors useful context without asking for a long essay."
        >
          <Card>
            <Field
              label="What do you want to accomplish in the next 12 months?"
              hint="Optional. Helps mentors understand your direction."
            >
              <Textarea
                rows={5}
                value={form.aspirations12m}
                onChange={(e) => set("aspirations12m", e.target.value)}
                placeholder="Over the next year, I want to…"
              />
            </Field>
          </Card>
        </Section>

        <div className="sticky bottom-4 flex justify-end">
          <div className="rounded-2xl border border-line-strong bg-paper-elev/95 p-2 shadow-lg backdrop-blur">
            <Button type="submit" loading={saving}>
              <CheckCircle2 className="h-4 w-4" />
              Save profile
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SocialField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  );
}

function ChipArrayField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const t = draft.trim();
    if (!t) return;
    if (value.includes(t)) {
      setDraft("");
      return;
    }
    onChange([...value, t]);
    setDraft("");
  }

  function remove(i: number) {
    const next = [...value];
    next.splice(i, 1);
    onChange(next);
  }

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand"
            >
              {item}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-brand/15"
                onClick={() => remove(i)}
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}
