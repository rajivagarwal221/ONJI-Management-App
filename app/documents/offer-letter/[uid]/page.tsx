"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import {
  LetterShell,
  LetterHeader,
  PrintBar,
} from "@/components/DocumentPage";
import {
  addMonths,
  formatLongDate,
  LetterIntern,
  offerRef,
  todayIso,
} from "@/lib/letter";
import Image from "next/image";

export default function OfferLetterPage({ params }: { params: { uid: string } }) {
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

  if (loading) return <PrintBarLoading label="Loading…" />;
  if (err) return <PrintBarLoading label={err} />;
  if (!intern) return <PrintBarLoading label="Loading intern…" />;

  const start = intern.startDate || todayIso();
  const duration = intern.durationMonths || 4;
  const expiry = addMonths(start, 1); // offer valid 1 month from start

  return (
    <>
      <PrintBar />
      <LetterShell>
        <LetterHeader />

        <div className="flex items-start justify-between text-[11pt]">
          <div>
            <b>Ref: {offerRef(intern.referenceNo)}</b>
          </div>
          <div>
            <b>Date: {formatLongDate(todayIso())}</b>
          </div>
        </div>

        <div className="mt-3 text-[11pt]">
          <div>
            <b>Name:</b> {intern.displayName}
          </div>
          <div>
            <b>Student of:</b> {intern.institute || "—"}
          </div>
        </div>

        <div className="mt-4">
          <b>Subject: Internship Offer — Software Engineer Position</b>
        </div>

        <p className="mt-4">Dear {intern.displayName.split(" ")[0]},</p>

        <p className="mt-3">
          We are pleased to offer you the position of{" "}
          <b>Software Engineer Intern</b> at{" "}
          <b>Onji Software Labs Pvt. Ltd.</b>, based on your application and
          your performance during the selection process.
        </p>

        <p className="mt-3">
          <b>Internship Details:</b>
        </p>
        <ul className="mt-1 list-disc pl-6">
          <li>
            <b>Position:</b> Software Engineer Intern
          </li>
          <li>
            <b>Department:</b> Software Development
          </li>
          <li>
            <b>Start Date:</b> {formatLongDate(start)}
          </li>
          <li>
            <b>Duration:</b> {duration} months (subject to project requirements)
          </li>
        </ul>

        <p className="mt-3">
          Your internship timings shall align with company working hours, and
          you will be granted weekly holidays and public holidays as
          applicable. You are entitled to one leave per working month. You are
          expected to adhere to all workplace policies, processes, and
          guidelines as laid down by Onji Software Labs. Confidentiality of all
          proprietary and sensitive information accessed during your
          internship must be strictly maintained.
        </p>

        <p className="mt-3">
          You are expected to perform your assignments diligently in accordance
          with project schedules. Your performance will be periodically
          reviewed, and if required, a report may be shared with your
          institute. The internship period may be extended at the company's
          discretion, particularly if requested by your sponsoring institute.
        </p>

        <p className="mt-3">
          Please note that this offer is solely for an internship and does not
          imply any guarantee or preference for employment after the
          internship period unless explicitly stated by the company.
        </p>

        <div className="break-before-page" />

        <p className="mt-3">
          This offer is valid until {formatLongDate(expiry)}. Kindly confirm
          your acceptance by signing and returning a scanned copy of this
          letter to{" "}
          <a
            href="mailto:hr@onjisoftware.com"
            className="text-blue-700 underline"
          >
            <b>hr@onjisoftware.com</b>
          </a>
          .
        </p>

        <p className="mt-3">
          We are excited about the opportunity to work with you and are
          confident that this internship will offer valuable learning and
          exposure. Please feel free to reach out in case of any queries.
        </p>

        <p className="mt-4">
          <b>Sincerely,</b>
        </p>

        <Image
          src="/letter-assets/ceo-sign.png"
          alt="CEO signature"
          width={200}
          height={80}
          className="mt-2 h-[4.2cm] w-auto"
        />
        <div className="mt-[-2px]">
          <b>Anish Jathan</b>
          <br />
          CEO, Onji Software Labs Pvt. Ltd.
        </div>

        <div className="mt-8">
          <b>Acceptance by Applicant Below:</b>
        </div>
        <hr className="mt-1 w-3/4 border-neutral-800" />

        <p className="mt-2">I have read the above offer and accept the same.</p>

        <table className="mt-8 w-full text-[11pt]">
          <tbody>
            <tr>
              <td className="pr-8">
                <b>Name:</b>
              </td>
              <td className="pr-8">
                <b>Signature:</b>
              </td>
              <td>
                <b>Date:</b>
              </td>
            </tr>
            <tr className="h-10">
              <td>
                <div className="w-[3.5cm] border-b border-black" />
              </td>
              <td>
                <div className="w-[3.5cm] border-b border-black" />
              </td>
              <td>
                <div className="w-[2.5cm] border-b border-black" />
              </td>
            </tr>
          </tbody>
        </table>
      </LetterShell>
    </>
  );
}

function PrintBarLoading({ label }: { label: string }) {
  return (
    <div className="grid min-h-dvh place-items-center text-sm text-neutral-600">
      {label}
    </div>
  );
}
