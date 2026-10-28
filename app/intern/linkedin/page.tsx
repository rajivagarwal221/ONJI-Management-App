import { Button, Card, PageHeader } from "@/components/ui";

const linkedinSnippet = `ONJI Internship — Machine Learning · July 2026
Remote, self-paced AI internship. Verifiable credential issued on completion.
onji.ai/verify/your-id`;

const postIdea = `Just started the ONJI Machine Learning internship (July 2026 cohort). Excited to ship real work on evaluation, deployment, and iteration against real metrics. Follow along — I'll share what I learn.`;

export default function LinkedInSharePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="LinkedIn"
        title="Share ONJI on LinkedIn"
        description="Add the internship to your Experience section, then share a short post so recruiters see it."
      />

      <Card>
        <h2 className="eyebrow">Experience entry</h2>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-paper-soft p-4 text-xs text-ink">
{linkedinSnippet}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary">Copy to clipboard</Button>
          <Button href="https://www.linkedin.com/in/me/edit/forms/position/new/">
            Open LinkedIn editor
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="eyebrow">Post idea</h2>
        <p className="mt-3 text-sm text-ink-mute">
          A short post you can paste into LinkedIn to announce your cohort.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-paper-soft p-4 text-xs text-ink">
{postIdea}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary">Copy post</Button>
          <Button href="https://www.linkedin.com/feed/?shareActive=true">
            Share on LinkedIn
          </Button>
        </div>
      </Card>
    </div>
  );
}
