"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";
import { Card, PageHeader } from "@/components/ui";

export default function AdminHome() {
  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0 });

  useEffect(() => {
    (async () => {
      try {
        const all = await getDocs(
          query(collection(firebaseDb(), "users"), where("role", "==", "intern")),
        );
        let active = 0;
        let disabled = 0;
        all.forEach((d) => {
          const data = d.data() as { disabled?: boolean };
          if (data.disabled) disabled++;
          else active++;
        });
        setStats({ total: all.size, active, disabled });
      } catch {
        // silent — show zeros
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Program overview"
        description="Manage interns, generate credentials, and keep the cohort moving."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="eyebrow">Total interns</div>
          <div className="mt-2 font-display text-3xl font-semibold">{stats.total}</div>
        </Card>
        <Card>
          <div className="eyebrow">Active</div>
          <div className="mt-2 font-display text-3xl font-semibold">{stats.active}</div>
        </Card>
        <Card>
          <div className="eyebrow">Disabled</div>
          <div className="mt-2 font-display text-3xl font-semibold">{stats.disabled}</div>
        </Card>
      </div>

      <Card>
        <h2 className="eyebrow">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/interns/new"
            className="h-9 rounded-xl bg-brand-bright px-4 text-sm font-medium text-brand-fg shadow-brand hover:bg-brand-hover grid place-items-center"
          >
            Provision a new intern
          </Link>
          <Link
            href="/admin/interns"
            className="h-9 rounded-xl border border-ink/20 bg-white px-4 text-sm font-medium text-ink hover:border-ink/40 grid place-items-center"
          >
            View all interns
          </Link>
        </div>
      </Card>
    </div>
  );
}
