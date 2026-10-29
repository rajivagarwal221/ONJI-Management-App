import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb, requireAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/**
 * POST /api/admin/seed
 * Writes starter reference data (tracks, assignments, resources,
 * announcements, courses, events, onboarding template). Idempotent via
 * a `seedVersion` doc; running it again upgrades existing docs in place.
 */
export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    await requireAdmin(idToken);
    const db = adminDb();

    const tracks = [
      {
        key: "fluency",
        name: "AI Fluency",
        summary:
          "Understand how modern AI systems work, where they fail, and how to use them well.",
        requiredAssignments: 5,
        order: 1,
        weeks: 6,
      },
      {
        key: "ml",
        name: "Machine Learning",
        summary:
          "Build and evaluate ML systems end-to-end: data, modeling, deployment, iteration.",
        requiredAssignments: 5,
        order: 2,
        weeks: 6,
      },
      {
        key: "ai-eng",
        name: "AI Engineering",
        summary:
          "Ship LLM-powered products: evals, retrieval, tools, agents, production hygiene.",
        requiredAssignments: 5,
        order: 3,
        weeks: 6,
      },
    ];

    const assignments = [
      { id: "A-ML-W1-01", title: "Train your first classifier", track: "ml", week: 1, dueOffsetDays: 7, description: "Train a baseline classifier on a provided dataset. Report accuracy, precision, recall." },
      { id: "A-ML-W1-02", title: "Pick the right metric", track: "ml", week: 1, dueOffsetDays: 7, description: "Explain which metric fits the problem. Defend your pick in 300 words." },
      { id: "A-ML-W1-03", title: "Data-leak postmortem", track: "ml", week: 1, dueOffsetDays: 9 },
      { id: "A-ML-W2-01", title: "Clean a messy dataset", track: "ml", week: 2, dueOffsetDays: 14 },
      { id: "A-ML-W3-01", title: "Model selection on a budget", track: "ml", week: 3, dueOffsetDays: 21 },
      { id: "A-ML-CAP", title: "ML Capstone: deploy a classifier", track: "ml", week: 6, dueOffsetDays: 45, isCapstone: true, description: "Ship an end-to-end classifier with a hosted demo + repo." },
      { id: "A-AIF-W1-01", title: "Prompt the same task three ways", track: "fluency", week: 1, dueOffsetDays: 6 },
      { id: "A-AIF-W1-02", title: "Fact-check an LLM answer", track: "fluency", week: 1, dueOffsetDays: 8 },
      { id: "A-AIF-W2-01", title: "Build a tool-using agent", track: "fluency", week: 2, dueOffsetDays: 15 },
      { id: "A-AIF-W3-01", title: "RAG a document", track: "fluency", week: 3, dueOffsetDays: 22 },
      { id: "A-AIF-CAP", title: "AI Fluency Capstone: ship a Claude-powered tool", track: "fluency", week: 6, dueOffsetDays: 45, isCapstone: true },
    ];

    const resources = [
      { id: "R-STARTER-ML", title: "ONJI ML Internship Starter (GitHub)", track: "ml", week: 1, level: "Beginner", locked: true },
      { id: "R-SEARCH-WORKS", title: "How Google Search Works", track: "all", week: 1, level: "Beginner", href: "https://developers.google.com/search/docs/fundamentals/how-search-works" },
      { id: "R-AI-FEATURES", title: "AI Features and Your Website", track: "all", week: 1, level: "Intermediate", href: "https://developers.google.com/search/docs/essentials/ai-features" },
      { id: "R-ML-LOOP", title: "The ML Loop: data → model → metric", track: "ml", week: 2, level: "Beginner", href: "https://developers.google.com/machine-learning/crash-course" },
      { id: "R-PROMPT-PATTERNS", title: "Prompting patterns that work", track: "fluency", week: 1, level: "Beginner", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" },
      { id: "R-FAIRNESS-EVAL", title: "Fairness & evaluation for classifiers", track: "ml", week: 3, level: "Advanced", href: "https://developers.google.com/machine-learning/fairness-overview" },
      { id: "R-RAG", title: "RAG without tears", track: "fluency", week: 3, level: "Intermediate", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips" },
      { id: "R-DEPLOY", title: "Deploy a Next.js app on Vercel", track: "ai-eng", week: 4, level: "Beginner", href: "https://nextjs.org/learn/dashboard-app" },
    ];

    const announcements = [
      {
        id: "AN-WELCOME",
        title: "Welcome to the ONJI Internship Portal",
        body: "This portal is your home base. Finish the Getting Started guide on your dashboard, then jump into Week 1 of your track.",
        pinned: true,
        publishedAt: Timestamp.now(),
      },
      {
        id: "AN-OFFICE-HOURS",
        title: "Office hours every Thursday 18:00 UTC",
        body: "Mentor office hours are live every Thursday. Links are posted under Events the morning of.",
        pinned: false,
        publishedAt: Timestamp.now(),
      },
    ];

    const courses = [
      { id: "C-FUNDAMENTALS", title: "Anthropic Fundamentals", hours: 4, description: "Basics of Claude and the Anthropic API.", href: "https://docs.anthropic.com/" },
      { id: "C-PROMPT", title: "Prompt Engineering with Claude", hours: 6, description: "Patterns that make Claude reliable in production.", href: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" },
      { id: "C-TOOL-USE", title: "Tool Use & Agents", hours: 8, description: "Build Claude-powered agents with tool use.", href: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use" },
      { id: "C-SAFETY", title: "AI Safety for Builders", hours: 3, description: "Guardrails, evals, and responsible deployment.", href: "https://www.anthropic.com/safety" },
    ];

    const events: {
      id: string;
      title: string;
      startsAtDaysAhead: number;
      host: string;
      joinUrl?: string;
    }[] = [
      { id: "E-KICKOFF", title: "Cohort kickoff", startsAtDaysAhead: 2, host: "ONJI Program", joinUrl: "https://meet.google.com/" },
      { id: "E-OH-WEEK1", title: "Office hours — Week 1", startsAtDaysAhead: 4, host: "Priya Shah" },
    ];

    const onboardingTemplate = [
      "Verify your email",
      "Fill out your profile",
      "Pick your primary track",
      "Watch the portal overview video",
      "Read the handbook",
      "Add ONJI to your LinkedIn",
      "Submit intro assignment",
    ];

    const batch = db.batch();

    // tracks
    for (const t of tracks) {
      const { key, ...rest } = t;
      batch.set(db.collection("tracks").doc(key), rest, { merge: true });
    }
    // assignments — compute real due dates
    const now = Date.now();
    for (const a of assignments) {
      const { id, dueOffsetDays, ...rest } = a;
      const due = new Date(now + dueOffsetDays * 24 * 60 * 60 * 1000);
      batch.set(
        db.collection("assignments").doc(id),
        { ...rest, due: Timestamp.fromDate(due) },
        { merge: true },
      );
    }
    for (const r of resources) {
      const { id, ...rest } = r;
      batch.set(db.collection("resources").doc(id), rest, { merge: true });
    }
    for (const a of announcements) {
      const { id, ...rest } = a;
      batch.set(db.collection("announcements").doc(id), rest, { merge: true });
    }
    for (const c of courses) {
      const { id, ...rest } = c;
      batch.set(db.collection("courses").doc(id), rest, { merge: true });
    }
    for (const e of events) {
      const { id, startsAtDaysAhead, ...rest } = e;
      const startsAt = new Date(now + startsAtDaysAhead * 24 * 60 * 60 * 1000);
      batch.set(
        db.collection("events").doc(id),
        { ...rest, startsAt: Timestamp.fromDate(startsAt) },
        { merge: true },
      );
    }

    // Onboarding template lives at /meta/onboarding so intern provisioning can
    // mint a per-user copy from it.
    batch.set(
      db.collection("meta").doc("onboarding"),
      { items: onboardingTemplate },
      { merge: true },
    );

    batch.set(
      db.collection("meta").doc("seed"),
      { seedVersion: 1, lastRun: FieldValue.serverTimestamp() },
      { merge: true },
    );

    await batch.commit();

    return NextResponse.json({
      ok: true,
      counts: {
        tracks: tracks.length,
        assignments: assignments.length,
        resources: resources.length,
        announcements: announcements.length,
        courses: courses.length,
        events: events.length,
      },
    });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    const code = msg === "Not authorized." ? 403 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
