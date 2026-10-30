// Rule-based resume text extractor. Pulls as much structured data as
// regex can reliably recover from arbitrary resume text. Everything is
// best-effort: missing fields come back as null, callers show them for
// manual edit before persisting.

export type ExtractedResume = {
  displayName?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
  behance?: string;
  dribbble?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  discord?: string;
  reddit?: string;
  newsletter?: string;
  university?: string;
  city?: string;
  country?: string;
  techStack: string[];
  aiTools: string[];
  oneLiner?: string;
};

const SOCIAL = [
  { key: "linkedin",  pattern: /\b(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/[A-Za-z0-9_\-\/\.]+/i },
  { key: "github",    pattern: /\b(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_\-]+(?:\/[A-Za-z0-9_\-\.]+)?/i },
  { key: "twitter",   pattern: /\b(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+/i },
  { key: "behance",   pattern: /\b(?:https?:\/\/)?(?:www\.)?behance\.net\/[A-Za-z0-9_\-]+/i },
  { key: "dribbble",  pattern: /\b(?:https?:\/\/)?(?:www\.)?dribbble\.com\/[A-Za-z0-9_\-]+/i },
  { key: "instagram", pattern: /\b(?:https?:\/\/)?(?:www\.)?instagram\.com\/[A-Za-z0-9_\.]+/i },
  { key: "facebook",  pattern: /\b(?:https?:\/\/)?(?:www\.)?facebook\.com\/[A-Za-z0-9_\.\-]+/i },
  { key: "youtube",   pattern: /\b(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:@|c\/|user\/|channel\/)?[A-Za-z0-9_\-]+/i },
  { key: "tiktok",    pattern: /\b(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?[A-Za-z0-9_\.]+/i },
  { key: "reddit",    pattern: /\b(?:https?:\/\/)?(?:www\.)?reddit\.com\/user\/[A-Za-z0-9_\-]+/i },
] as const;

// Common tech-stack keywords. Case-insensitive, word-boundary matching.
const TECH_KEYWORDS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
  "React", "React Native", "Next.js", "Vue", "Nuxt", "Angular", "Svelte", "SvelteKit",
  "Node.js", "Express", "Fastify", "NestJS", "Django", "Flask", "FastAPI", "Rails", "Laravel", "Spring",
  "GraphQL", "REST", "gRPC",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firestore", "Firebase", "Supabase",
  "AWS", "GCP", "Azure", "Vercel", "Docker", "Kubernetes", "Terraform",
  "TensorFlow", "PyTorch", "scikit-learn", "Hugging Face", "LangChain", "LlamaIndex",
  "Pandas", "NumPy", "Matplotlib", "Jupyter",
  "Tailwind", "CSS", "HTML", "Three.js", "WebGL", "D3",
  "Git", "GitHub Actions", "CI/CD",
];

const AI_TOOL_KEYWORDS = [
  "ChatGPT", "Claude", "Claude Code", "Cursor", "GitHub Copilot", "Windsurf", "Perplexity",
  "Gemini", "Midjourney", "Stable Diffusion", "DALL-E", "ElevenLabs", "Runway",
  "LangChain", "LlamaIndex", "LangGraph", "Hugging Face",
];

const UNIVERSITY_HINTS =
  /(University|College|Institute|School) (?:of )?[A-Z][A-Za-z\.\-\s&,]+/g;

const SKILLS_SECTION =
  /\n(?:technical\s+)?skills?(?:\s*&\s*(?:tools|technologies))?[:\s]*\n+([^\n]+(?:\n[^\n]+){0,8})/i;

export function extractFromText(text: string): ExtractedResume {
  const normalized = text.replace(/\r/g, "").replace(/ /g, " ");
  const lines = normalized.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  const out: ExtractedResume = { techStack: [], aiTools: [] };

  // Email
  const email = normalized.match(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/);
  if (email) out.email = email[0];

  // Phone (very permissive)
  const phone = normalized.match(
    /(?:\+?\d{1,3}[\s\-\.]?)?(?:\(?\d{3,4}\)?[\s\-\.]?){2,3}\d{3,4}/,
  );
  if (phone) {
    const p = phone[0].trim();
    // reject matches that look like dates / IDs
    if (p.replace(/\D/g, "").length >= 7) out.phone = p;
  }

  // Social links
  for (const { key, pattern } of SOCIAL) {
    const m = normalized.match(pattern);
    if (m) {
      let url = m[0];
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      (out as Record<string, unknown>)[key] = url;
    }
  }

  // Portfolio: any other http(s) URL that isn't one of the above sites
  const urlRegex = /https?:\/\/[^\s<>"]+/gi;
  const urls = normalized.match(urlRegex) || [];
  const skipHosts = /(linkedin|github|twitter|x\.com|behance|dribbble|instagram|facebook|youtube|tiktok|reddit)\./i;
  const portfolio = urls.find((u) => !skipHosts.test(u));
  if (portfolio) out.portfolio = portfolio.replace(/[.,);]+$/, "");

  // Display name: usually one of the first 3 non-empty lines that looks like "First Last".
  const nameLine = lines
    .slice(0, 5)
    .find(
      (l) =>
        /^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3}$/.test(l) &&
        !/@/.test(l) &&
        l.length < 60,
    );
  if (nameLine) out.displayName = nameLine;

  // University — first match wins
  const uniMatch = normalized.match(UNIVERSITY_HINTS);
  if (uniMatch) {
    out.university = uniMatch[0].replace(/\s{2,}/g, " ").trim().slice(0, 120);
  }

  // City / country — look for "City, Country" style line in the top 10 lines
  const locationLine = lines
    .slice(0, 10)
    .find((l) =>
      /^[A-Z][A-Za-z\.\s\-]+,\s*[A-Z][A-Za-z\.\s\-]+$/.test(l) && l.length < 60,
    );
  if (locationLine) {
    const [city, country] = locationLine.split(",").map((s) => s.trim());
    if (city) out.city = city;
    if (country) out.country = country;
  }

  // Tech stack from a Skills section (if any) + whole-doc keyword scan.
  const techSet = new Set<string>();
  const aiSet = new Set<string>();
  const skillsSection = normalized.match(SKILLS_SECTION);
  const haystack = (skillsSection ? skillsSection[1] + "\n" : "") + normalized;
  for (const kw of TECH_KEYWORDS) {
    const re = new RegExp(`(?<![A-Za-z])${escapeRegex(kw)}(?![A-Za-z])`, "i");
    if (re.test(haystack)) techSet.add(kw);
  }
  for (const kw of AI_TOOL_KEYWORDS) {
    const re = new RegExp(`(?<![A-Za-z])${escapeRegex(kw)}(?![A-Za-z])`, "i");
    if (re.test(haystack)) aiSet.add(kw);
  }
  out.techStack = Array.from(techSet);
  out.aiTools = Array.from(aiSet);

  // One-liner: the first "Summary" / "About" / "Objective" paragraph if present.
  const summary = normalized.match(
    /\n(?:summary|about(?:\s*me)?|profile|objective)[\s:]*\n+([^\n]+(?:\n[^\n]+){0,2})/i,
  );
  if (summary) {
    out.oneLiner = summary[1].trim().split("\n").join(" ").slice(0, 220);
  }

  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
