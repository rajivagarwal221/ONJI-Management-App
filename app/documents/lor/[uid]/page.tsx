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
  durationWord,
  formatLongDate,
  LetterIntern,
  lorRef,
  monthsBetween,
  todayIso,
  trackFocus,
} from "@/lib/letter";

export default function LorPage({ params }: { params: { uid: string } }) {
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

  if (!intern.lorIssued) {
    return (
      <Centered label="This letter of recommendation has not been issued yet. The admin issues this document individually for selected interns." />
    );
  }

  const first = (intern.displayName || "the intern").split(" ")[0];
  const start = intern.startDate || todayIso();
  const end = intern.endDate || todayIso();
  const months = intern.durationMonths || monthsBetween(start, end) || 4;

  return (
    <>
      <PrintBar />
      <LetterShell>
        <LetterHeader />

        <div className="pt-2 text-center">
          <div className="text-[17pt] font-bold">Letter of Recommendation</div>
        </div>

        <div className="mt-4 flex items-start justify-between text-[11pt]">
          <div>
            <b>Ref: {lorRef(intern.referenceNo)}</b>
          </div>
          <div>
            <b>Date: {formatLongDate(todayIso())}</b>
          </div>
        </div>

        <p className="mt-6">To Whom It May Concern,</p>

        <p className="mt-3">
          I am pleased to recommend <b>{intern.displayName}</b>, who
          successfully completed a {durationWord(months)} internship as a{" "}
          <b>Software Engineer Intern</b> at{" "}
          <b>Onji Software Labs Pvt. Ltd.</b> from <b>{formatLongDate(start)}</b>{" "}
          to <b>{formatLongDate(end)}</b>. During {first}&apos;s tenure in our
          Software Development department, {first} worked on real-time{" "}
          {trackFocus(intern.primaryTrack)} projects, consistently delivering
          clean, well-structured code while meeting project deadlines.{" "}
          {first} demonstrated strong problem-solving abilities, a genuine
          eagerness to learn, and a collaborative attitude that earned{" "}
          {first} the respect of peers and senior developers.
        </p>

        <p className="mt-3">
          I am confident that {first} possesses the technical aptitude, work
          ethic, and professionalism to excel in any academic or professional
          endeavour {first} pursues. I recommend {first} without reservation
          and believe {first} will be a valuable asset to any organization or
          institution. Please feel free to contact me at{" "}
          <a
            href="mailto:ceo@onjisoftware.com"
            className="text-blue-700 underline"
          >
            <b>ceo@onjisoftware.com</b>
          </a>{" "}
          for any further information.
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
