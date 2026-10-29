"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { firebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import {
  LetterShell,
  LetterHeader,
  PrintBar,
} from "@/components/DocumentPage";
import {
  certRef,
  formatLongDate,
  LetterIntern,
  todayIso,
  trackFocus,
} from "@/lib/letter";

export default function CertificatePage({ params }: { params: { uid: string } }) {
  const { user, profile, loading } = useAuth();
  const [intern, setIntern] = useState<LetterIntern | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    const canView = profile?.role === "admin" || user.uid === params.uid;
    if (!canView) {
      setErr("You don't have access to this document.");
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(firebaseDb(), "users", params.uid));
        if (!snap.exists()) {
          setErr("Intern not found.");
          return;
        }
        setIntern({ uid: snap.id, ...(snap.data() as Omit<LetterIntern, "uid">) });
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "Failed to load");
      }
    })();
  }, [loading, user, profile, params.uid]);

  if (loading) return <Centered label="Loading…" />;
  if (err) return <Centered label={err} />;
  if (!intern) return <Centered label="Loading intern…" />;

  // Certificate is gated on completion. Admin preview also respects this —
  // the admin should mark the intern completed before anyone sees it.
  if (!intern.completed) {
    return (
      <Centered label="This certificate has not been released yet. The admin must mark the internship as complete first." />
    );
  }

  const first = intern.displayName.split(" ")[0];
  const start = intern.startDate || todayIso();
  const end = intern.endDate || todayIso();

  return (
    <>
      <PrintBar />
      <LetterShell>
        <LetterHeader />

        <div className="pt-2 text-center">
          <div className="text-[17pt] font-bold">Internship Certificate</div>
        </div>

        <div className="mt-4 flex items-start justify-between text-[11pt]">
          <div>
            <b>Ref: {certRef(intern.referenceNo)}</b>
          </div>
          <div>
            <b>Date: {formatLongDate(todayIso())}</b>
          </div>
        </div>

        <p className="mt-6">
          This is to certify that <b>{intern.displayName}</b>, a student of{" "}
          {intern.institute || "—"}, has successfully completed an internship
          as a <b>Software Engineer Intern</b> at{" "}
          <b>Onji Software Labs Pvt. Ltd.</b> from{" "}
          <b>{formatLongDate(start)}</b> to <b>{formatLongDate(end)}</b>. During
          this period, <b>{intern.displayName}</b> was engaged in real-time
          project assignments focusing on {trackFocus(intern.primaryTrack)}.{" "}
          {first} demonstrated strong technical proficiency, dedication to
          learning, and adherence to company policies and guidelines.
        </p>

        <p className="mt-3">
          We appreciate {first}&apos;s contributions and efforts, and we wish{" "}
          {first} every success in future endeavors.
        </p>

        <div className="mt-10">
          <Image
            src="/letter-assets/ceo-sign.png"
            alt="CEO signature"
            width={200}
            height={80}
            className="h-[4.2cm] w-auto"
          />
          <div className="mt-[-2px]">
            <b>Anish Jathan</b>
            <br />
            CEO, Onji Software Labs Pvt. Ltd.
          </div>
        </div>
      </LetterShell>
    </>
  );
}

function Centered({ label }: { label: string }) {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center text-sm text-neutral-600">
      <div className="max-w-md rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
        {label}
      </div>
    </div>
  );
}
