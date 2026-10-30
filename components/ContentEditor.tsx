"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import {
  Banner,
  Button,
  Card,
  Chip,
  Empty,
  Field,
  Input,
  LoadingPanel,
  PageHeader,
  Select,
  Textarea,
} from "./ui";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "date" | "boolean" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** display in table list */
  listCol?: boolean;
};

export type ContentEditorProps = {
  collectionName: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  fields: FieldDef[];
  /** Optional field used as the display title in the list. */
  titleField?: string;
};

type Row = Record<string, unknown> & { id: string };

export function ContentEditor({
  collectionName,
  title,
  description,
  icon,
  fields,
  titleField,
}: ContentEditorProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const snap = await getDocs(collection(firebaseDb(), collectionName));
      const list: Row[] = snap.docs.map((d) => {
        const data = d.data();
        // Convert Timestamp -> ISO string for client-side editing
        const normalized: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(data)) {
          if (v instanceof Timestamp) {
            normalized[k] = v.toDate().toISOString();
          } else {
            normalized[k] = v;
          }
        }
        return { id: d.id, ...normalized };
      });
      list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      setRows(list);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openForm(row?: Row) {
    const next: Record<string, string | boolean> = {};
    fields.forEach((f) => {
      const v = row?.[f.key];
      if (v == null) {
        next[f.key] = f.type === "boolean" ? false : "";
      } else if (f.type === "date" && typeof v === "string") {
        // ISO -> yyyy-mm-dd
        next[f.key] = v.slice(0, 10);
      } else {
        next[f.key] = typeof v === "boolean" ? v : String(v);
      }
    });
    setForm(next);
    setEditing(row || null);
    setShowForm(true);
    setMsg(null);
    setErr(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const data: Record<string, unknown> = {};
      fields.forEach((f) => {
        const v = form[f.key];
        if (f.type === "number") {
          data[f.key] = v === "" || v === false ? null : Number(v);
        } else if (f.type === "boolean") {
          data[f.key] = Boolean(v);
        } else if (f.type === "date") {
          data[f.key] = v ? String(v) : null;
        } else {
          data[f.key] = v === "" ? null : v;
        }
      });
      const u = firebaseAuth().currentUser;
      const idToken = await u?.getIdToken();
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken || ""}`,
        },
        body: JSON.stringify({
          collection: collectionName,
          id: editing?.id,
          data,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed");
      setMsg(editing ? "Saved." : "Created.");
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setBusy(true);
    setErr(null);
    try {
      const u = firebaseAuth().currentUser;
      const idToken = await u?.getIdToken();
      const res = await fetch(
        `/api/admin/content?collection=${collectionName}&id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken || ""}` },
        },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || "Failed");
      }
      setMsg("Deleted.");
      await load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const listCols = fields.filter((f) => f.listCol);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={icon}
        eyebrow="Admin"
        title={title}
        description={description}
        action={
          <Button onClick={() => openForm(undefined)}>
            <Plus className="h-4 w-4" /> New
          </Button>
        }
      />

      {msg && <Banner tone="success">{msg}</Banner>}
      {err && <Banner tone="error">{err}</Banner>}

      {showForm && (
        <Card>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                <Field label={f.label + (f.required ? " *" : "")} hint={f.hint}>
                  {f.type === "textarea" ? (
                    <Textarea
                      required={f.required}
                      rows={4}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                    />
                  ) : f.type === "select" && f.options ? (
                    <Select
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    >
                      <option value="">—</option>
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  ) : f.type === "boolean" ? (
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.key])}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                      />
                      <span>Yes</span>
                    </label>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "url" ? "url" : "text"}
                      required={f.required}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                    />
                  )}
                </Field>
              </div>
            ))}
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>
                Cancel
              </Button>
              <Button type="submit" loading={busy}>
                {editing ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <LoadingPanel />
      ) : rows.length === 0 ? (
        <Empty title="Nothing yet" description="Click New to add the first entry." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">
                      {String(titleField ? r[titleField] ?? r.id : r.id)}
                    </span>
                    {listCols.map((c) => {
                      const v = r[c.key];
                      if (v == null || v === "") return null;
                      return (
                        <Chip key={c.key}>
                          {c.label}: {String(v).slice(0, 60)}
                        </Chip>
                      );
                    })}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-ink-mute">{r.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openForm(r)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => void remove(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
