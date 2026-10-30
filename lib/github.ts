// Parse a GitHub profile URL into just the username (owner-of-profile).
// Accepts bare handle too. Returns null if we can't recover anything.
export function parseGithubHandle(input?: string | null): string | null {
  if (!input) return null;
  const s = input.trim();
  if (!s) return null;
  // Bare @handle
  if (/^@?[A-Za-z0-9](?:[A-Za-z0-9-]){0,38}$/.test(s.replace(/^@/, ""))) {
    return s.replace(/^@/, "");
  }
  const m = s.match(/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]){0,38})(?:$|[/?#])/i);
  return m ? m[1] : null;
}
