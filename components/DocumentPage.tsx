"use client";

import Image from "next/image";
import { Printer } from "lucide-react";

export function PrintBar() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-neutral-300 bg-white px-5 py-3 print:hidden">
      <div className="text-sm text-neutral-600">
        Use <b>Print → Save as PDF</b> for an archival copy.
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-9 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-paper hover:opacity-90"
      >
        <Printer className="h-4 w-4" /> Print / Save as PDF
      </button>
    </div>
  );
}

export function LetterShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto my-6 flex min-h-[11in] w-[8.5in] flex-col bg-white px-[1in] pb-[1.25in] pt-[1in] text-[12pt] leading-[1.35] text-black shadow-xl print:my-0 print:shadow-none">
      <div className="flex-1">{children}</div>
      <LetterFooter />
    </div>
  );
}

export function LetterHeader() {
  return (
    <>
      <div className="text-right">
        <div className="text-[23pt] font-bold leading-[1.15]">
          Onji Software Labs
          <br />
          Pvt. Ltd.
        </div>
        <div className="mt-1 text-[10pt]">
          Onji Software Labs, Mattu Road, Katapdi, Udupi — 574105, India
          <br />
          <a
            href="https://www.onjisoftware.com"
            className="text-blue-700 underline"
          >
            www.onjisoftware.com
          </a>
        </div>
      </div>
      <hr className="my-3 border-t-[1.5px] border-black" />
    </>
  );
}

export function LetterFooter() {
  return (
    <div className="mt-6 flex justify-end print:fixed print:bottom-[0.4in] print:right-[0.6in]">
      <div className="w-[2.8cm] text-center">
        <Image
          src="/letter-assets/onji-logo.png"
          alt="Onji"
          width={40}
          height={40}
          className="mx-auto h-10 w-auto"
        />
        <div className="mt-1 text-[8pt] font-bold">
          CIN: U47912KA2025PTC198705
        </div>
      </div>
    </div>
  );
}
