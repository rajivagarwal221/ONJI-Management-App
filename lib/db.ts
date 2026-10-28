// Typed Firestore collections, read/write helpers, and seeding.
// Everything client-side; swap to server-side if you need admin ops.

import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { firebaseDb } from "./firebase";

// -------------------- Types --------------------

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  role: "intern" | "admin";
  primaryTrack: string; // track key
  tracks: string[]; // enrolled track keys
  cohort: string; // e.g. "July 2026"
  country?: string;
  timezone?: string;
  linkedin?: string;
  github?: string;
  createdAt?: Timestamp;
};

export type Track = {
  key: string;
  name: string;
  summary: string;
  requiredAssignments: number; // usually 5
  order: number;
};

export type Assignment = {
  id: string;
  title: string;
  track: string; // track key
  week: number;
  due: string; // ISO
  description?: string;
  isCapstone?: boolean;
};

export type Submission = {
  id?: string;
  userId: string;
  assignmentId: string;
  assignmentTitle: string;
  track: string;
  link: string; // repo / doc link
  notes?: string;
  status: "pending" | "accepted" | "needs_revisions";
  reviewer?: string;
  submittedAt: Timestamp;
};

export type Resource = {
  id: string;
  title: string;
  track: string; // track key or "all"
  week: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  href?: string;
  locked?: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  publishedAt: Timestamp;
};

export type EventDoc = {
  id: string;
  title: string;
  startsAt: Timestamp;
  host: string;
  joinUrl?: string;
};

export type Note = {
  id?: string;
  title: string;
  body: string;
  updatedAt: Timestamp;
};

export type OnboardingItem = {
  id: string;
  title: string;
  order: number;
  done: boolean;
};

export type InboxMessage = {
  id?: string;
  from: string;
  subject: string;
  body: string;
  unread: boolean;
  receivedAt: Timestamp;
};

export type Question = {
  id?: string;
  userId: string;
  title: string;
  body: string;
  track: string;
  status: "open" | "answered";
  updatedAt: Timestamp;
};

export type Feedback = {
  id?: string;
  userId: string;
  category: "bug" | "feature" | "program" | "other";
  message: string;
  createdAt: Timestamp;
};

export type Course = {
  id: string;
  title: string;
  hours: number;
  description: string;
};

// -------------------- Helpers --------------------

const db = () => firebaseDb();

// Users
export async function getUser(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db(), "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function ensureUser(
  uid: string,
  email: string,
  displayName: string,
): Promise<UserProfile> {
  const ref = doc(db(), "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfile;
  const profile: UserProfile = {
    uid,
    email,
    displayName: displayName || email.split("@")[0],
    role: "intern",
    primaryTrack: "ml",
    tracks: ["fluency", "ml"],
    cohort: "July 2026",
    createdAt: serverTimestamp() as unknown as Timestamp,
  };
  await setDoc(ref, profile);
  return profile;
}

export async function updateUser(uid: string, patch: Partial<UserProfile>) {
  await updateDoc(doc(db(), "users", uid), patch);
}

// Tracks
export async function listTracks(): Promise<Track[]> {
  const snap = await getDocs(query(collection(db(), "tracks"), orderBy("order")));
  return snap.docs.map((d) => ({ ...(d.data() as Track), key: d.id }));
}

// Assignments
export async function listAssignments(track?: string): Promise<Assignment[]> {
  const base = collection(db(), "assignments");
  const q = track
    ? query(base, where("track", "==", track), orderBy("week"))
    : query(base, orderBy("track"), orderBy("week"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as Assignment), id: d.id }));
}

// Submissions
export async function listMySubmissions(userId: string): Promise<Submission[]> {
  const snap = await getDocs(
    query(
      collection(db(), "submissions"),
      where("userId", "==", userId),
      orderBy("submittedAt", "desc"),
    ),
  );
  return snap.docs.map((d) => ({ ...(d.data() as Submission), id: d.id }));
}

export async function createSubmission(
  s: Omit<Submission, "id" | "submittedAt">,
): Promise<string> {
  const ref = await addDoc(collection(db(), "submissions"), {
    ...s,
    submittedAt: serverTimestamp(),
  });
  return ref.id;
}

// Resources
export async function listResources(): Promise<Resource[]> {
  const snap = await getDocs(
    query(collection(db(), "resources"), orderBy("week"), orderBy("level")),
  );
  return snap.docs.map((d) => ({ ...(d.data() as Resource), id: d.id }));
}

// Announcements
export async function listAnnouncements(): Promise<Announcement[]> {
  const snap = await getDocs(
    query(
      collection(db(), "announcements"),
      orderBy("pinned", "desc"),
      orderBy("publishedAt", "desc"),
    ),
  );
  return snap.docs.map((d) => ({ ...(d.data() as Announcement), id: d.id }));
}

// Events
export async function listEvents(): Promise<EventDoc[]> {
  const snap = await getDocs(
    query(collection(db(), "events"), orderBy("startsAt", "asc")),
  );
  return snap.docs.map((d) => ({ ...(d.data() as EventDoc), id: d.id }));
}

// Notes
export async function listNotes(uid: string): Promise<Note[]> {
  const snap = await getDocs(
    query(
      collection(db(), "users", uid, "notes"),
      orderBy("updatedAt", "desc"),
    ),
  );
  return snap.docs.map((d) => ({ ...(d.data() as Note), id: d.id }));
}
export async function createNote(uid: string, title: string, body: string) {
  await addDoc(collection(db(), "users", uid, "notes"), {
    title,
    body,
    updatedAt: serverTimestamp(),
  });
}
export async function deleteNote(uid: string, noteId: string) {
  await deleteDoc(doc(db(), "users", uid, "notes", noteId));
}

// Onboarding
export async function listOnboarding(uid: string): Promise<OnboardingItem[]> {
  const snap = await getDocs(
    query(collection(db(), "users", uid, "onboarding"), orderBy("order")),
  );
  return snap.docs.map((d) => ({ ...(d.data() as OnboardingItem), id: d.id }));
}
export async function setOnboardingDone(
  uid: string,
  itemId: string,
  done: boolean,
) {
  await updateDoc(doc(db(), "users", uid, "onboarding", itemId), { done });
}

// Inbox
export async function listInbox(uid: string): Promise<InboxMessage[]> {
  const snap = await getDocs(
    query(
      collection(db(), "users", uid, "inbox"),
      orderBy("receivedAt", "desc"),
    ),
  );
  return snap.docs.map((d) => ({ ...(d.data() as InboxMessage), id: d.id }));
}
export async function markInboxRead(uid: string, msgId: string) {
  await updateDoc(doc(db(), "users", uid, "inbox", msgId), { unread: false });
}

// Questions
export async function listMyQuestions(userId: string): Promise<Question[]> {
  const snap = await getDocs(
    query(
      collection(db(), "questions"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
    ),
  );
  return snap.docs.map((d) => ({ ...(d.data() as Question), id: d.id }));
}
export async function createQuestion(
  q: Omit<Question, "id" | "updatedAt" | "status">,
) {
  await addDoc(collection(db(), "questions"), {
    ...q,
    status: "open",
    updatedAt: serverTimestamp(),
  });
}

// Feedback
export async function createFeedback(f: Omit<Feedback, "id" | "createdAt">) {
  await addDoc(collection(db(), "feedback"), {
    ...f,
    createdAt: serverTimestamp(),
  });
}

// Courses
export async function listCourses(): Promise<Course[]> {
  const snap = await getDocs(query(collection(db(), "courses")));
  return snap.docs.map((d) => ({ ...(d.data() as Course), id: d.id }));
}

// Realtime inbox count
export function watchUnreadInbox(
  uid: string,
  cb: (count: number) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db(), "users", uid, "inbox"), where("unread", "==", true)),
    (snap) => cb(snap.size),
  );
}

// -------------------- Seeder --------------------

const SEED_FLAG = "seed_done_v1";

export async function seedReferenceData(uid: string) {
  const flagRef = doc(db(), "users", uid, "flags", SEED_FLAG);
  const flagSnap = await getDoc(flagRef);
  if (flagSnap.exists()) return "already_seeded";

  const b = writeBatch(db());

  // Tracks
  const tracks: Track[] = [
    {
      key: "fluency",
      name: "AI Fluency",
      summary:
        "Understand how modern AI systems work, where they fail, and how to use them well.",
      requiredAssignments: 5,
      order: 1,
    },
    {
      key: "ml",
      name: "Machine Learning",
      summary:
        "Build and evaluate ML systems end-to-end: data, modeling, deployment, and iteration.",
      requiredAssignments: 5,
      order: 2,
    },
    {
      key: "ai-eng",
      name: "AI Engineering",
      summary:
        "Ship LLM-powered products: evals, retrieval, tools, agents, and production hygiene.",
      requiredAssignments: 5,
      order: 3,
    },
  ];
  tracks.forEach((t) => b.set(doc(db(), "tracks", t.key), t));

  // Assignments
  const assignments: Omit<Assignment, "id">[] = [
    { title: "Train your first classifier", track: "ml", week: 1, due: "2026-11-03" },
    { title: "Evaluate with the right metric", track: "ml", week: 1, due: "2026-11-03" },
    { title: "Write a data-leak postmortem", track: "ml", week: 1, due: "2026-11-05" },
    { title: "Clean a messy dataset", track: "ml", week: 2, due: "2026-11-10" },
    { title: "Model selection on a budget", track: "ml", week: 3, due: "2026-11-17" },
    { title: "Prompt the same task three ways", track: "fluency", week: 1, due: "2026-11-02" },
    { title: "Fact-check an LLM answer", track: "fluency", week: 1, due: "2026-11-04" },
    { title: "Build a tool-using agent", track: "fluency", week: 2, due: "2026-11-11" },
    {
      title: "ML Capstone: deploy a classifier",
      track: "ml",
      week: 6,
      due: "2026-12-15",
      isCapstone: true,
    },
    {
      title: "AI Fluency Capstone: ship a Claude-powered tool",
      track: "fluency",
      week: 6,
      due: "2026-12-15",
      isCapstone: true,
    },
  ];
  assignments.forEach((a) => {
    const ref = doc(collection(db(), "assignments"));
    b.set(ref, a);
  });

  // Resources
  const resources: Omit<Resource, "id">[] = [
    { title: "ONJI ML Internship Starter (GitHub)", track: "ml", week: 1, level: "Beginner", locked: true },
    { title: "How Google Search Works", track: "all", week: 1, level: "Beginner", href: "https://developers.google.com/search" },
    { title: "AI Features and Your Website", track: "all", week: 1, level: "Intermediate", href: "#" },
    { title: "Debug Search Traffic Drops", track: "all", week: 1, level: "Intermediate", href: "#" },
    { title: "The ML Loop: data → model → metric", track: "ml", week: 2, level: "Beginner", href: "#" },
    { title: "Prompting patterns that actually work", track: "fluency", week: 1, level: "Beginner", href: "#" },
    { title: "Fairness & evaluation for classifiers", track: "ml", week: 3, level: "Advanced", href: "#" },
    { title: "RAG without tears", track: "fluency", week: 3, level: "Intermediate", href: "#" },
  ];
  resources.forEach((r) => {
    const ref = doc(collection(db(), "resources"));
    b.set(ref, r);
  });

  // Announcements
  const announcements: Omit<Announcement, "id">[] = [
    {
      title: "Capstone review windows for July 2026 cohort",
      body: "Capstones submitted before Dec 10 get first-round review within 5 business days.",
      pinned: true,
      publishedAt: Timestamp.fromDate(new Date("2026-10-24")),
    },
    {
      title: "New ML resource: time-series starter",
      body: "Added a time-series starter repo under Week 3 resources.",
      publishedAt: Timestamp.fromDate(new Date("2026-10-20")),
    },
    {
      title: "Office hours moved to Thursdays",
      body: "Mentor office hours now Thu 18:00 UTC. Recordings in the Events tab.",
      publishedAt: Timestamp.fromDate(new Date("2026-10-18")),
    },
  ];
  announcements.forEach((a) => {
    const ref = doc(collection(db(), "announcements"));
    b.set(ref, a);
  });

  // Courses
  const courses: Omit<Course, "id">[] = [
    { title: "Anthropic Fundamentals", hours: 4, description: "The basics of Claude and the Anthropic API." },
    { title: "Prompt Engineering with Claude", hours: 6, description: "Patterns that make Claude reliable in production." },
    { title: "Tool Use & Agents", hours: 8, description: "Build Claude-powered agents with tool use." },
    { title: "AI Safety for Builders", hours: 3, description: "Guardrails, evals, and responsible deployment." },
  ];
  courses.forEach((c) => {
    const ref = doc(collection(db(), "courses"));
    b.set(ref, c);
  });

  // Per-user: onboarding items + welcome inbox message
  const onboarding = [
    "Create your account",
    "Verify your email",
    "Fill out your profile",
    "Pick your primary track",
    "Join the cohort Slack",
    "Add ONJI to your LinkedIn",
    "Watch the portal overview video",
    "Read the handbook",
    "Sign the code of conduct",
    "Submit intro assignment",
    "Install the ONJI CLI",
    "Set your working hours",
    "Pair with an onboarding buddy",
    "Attend kickoff event (recording OK)",
    "Mark onboarding complete",
  ];
  onboarding.forEach((title, i) => {
    const ref = doc(collection(db(), "users", uid, "onboarding"));
    b.set(ref, { title, order: i, done: true });
  });

  b.set(doc(collection(db(), "users", uid, "inbox")), {
    from: "ONJI Program",
    subject: "Welcome to the July 2026 cohort",
    body: "Here is everything you need for Week 1 — track pages, assignment list, and office hours.",
    unread: true,
    receivedAt: serverTimestamp(),
  });

  b.set(flagRef, { seededAt: serverTimestamp() });

  await b.commit();
  return "ok";
}

export async function fetchLimited<T>(
  coll: string,
  n: number,
): Promise<T[]> {
  const snap = await getDocs(query(collection(db(), coll), fsLimit(n)));
  return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id })) as T[];
}
