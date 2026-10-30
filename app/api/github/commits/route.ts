import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/**
 * GET /api/github/commits?repo=owner/name&author=handle&since=ISO
 * Returns up to 50 commits from the GitHub REST API.
 *
 * Auth: requires a signed-in user; non-admin interns are allowed because
 * they're just reading commits that already exist on GitHub.
 */
export async function GET(req: NextRequest) {
  try {
    const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!idToken) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    await adminAuth().verifyIdToken(idToken);

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "GITHUB_TOKEN not set." },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const repo = searchParams.get("repo");
    const author = searchParams.get("author");
    const since = searchParams.get("since");
    if (!repo || !/^[\w\-\.]+\/[\w\-\.]+$/.test(repo)) {
      return NextResponse.json(
        { error: "repo must be owner/name" },
        { status: 400 },
      );
    }

    const qs = new URLSearchParams({ per_page: "50" });
    if (author) qs.set("author", author);
    if (since) qs.set("since", since);

    const url = `https://api.github.com/repos/${repo}/commits?${qs.toString()}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      // GitHub asks for a cache; a few seconds is fine
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `GitHub ${res.status}`, detail: text.slice(0, 400) },
        { status: res.status },
      );
    }
    type GHCommit = {
      sha: string;
      html_url: string;
      commit: {
        message: string;
        author?: { name?: string; email?: string; date?: string };
      };
      author?: { login?: string; avatar_url?: string };
    };
    const data = (await res.json()) as GHCommit[];
    const commits = data.map((c) => ({
      sha: c.sha,
      message: c.commit.message.split("\n")[0],
      html_url: c.html_url,
      author: c.author?.login || c.commit.author?.name,
      authored_at: c.commit.author?.date,
    }));
    return NextResponse.json({ ok: true, commits });
  } catch (ex) {
    const msg = ex instanceof Error ? ex.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
