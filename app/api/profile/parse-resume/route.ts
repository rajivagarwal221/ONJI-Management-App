import { NextRequest, NextResponse } from "next/server";
import { extractFromText } from "@/lib/resume-extract";

export const runtime = "nodejs";
// Resume parsing can bump up against the small-body default on edge.
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    const name = (file as File).name || "upload";
    const buf = Buffer.from(await (file as File).arrayBuffer());
    if (buf.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File is larger than 5 MB." },
        { status: 413 },
      );
    }

    let text = "";
    const lower = name.toLowerCase();
    if (lower.endsWith(".pdf") || (file as File).type === "application/pdf") {
      // pdf-parse v1's index.js runs debug code at module load when
      // `!module.parent`, which is true inside Next's server bundle —
      // that debug code opens ./test/data/05-versions-space.pdf and
      // crashes with ENOENT. The deep path loads the real implementation
      // and skips the broken index entirely.
      const mod = (await import("pdf-parse/lib/pdf-parse.js")) as {
        default: (b: Buffer) => Promise<{ text: string }>;
      };
      const parsed = await mod.default(buf);
      text = parsed.text || "";
    } else if (
      lower.endsWith(".docx") ||
      (file as File).type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: buf });
      text = result.value || "";
    } else if (lower.endsWith(".txt") || (file as File).type.startsWith("text/")) {
      text = buf.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Only PDF, DOCX, or TXT files are supported." },
        { status: 415 },
      );
    }

    if (!text || text.length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not extract any text from this file. If it's a scanned PDF, re-upload a text-based version.",
        },
        { status: 422 },
      );
    }

    const extracted = extractFromText(text);
    return NextResponse.json({ ok: true, fields: extracted });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Parse failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
