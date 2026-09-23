import Link from "next/link";
import { FeedbackForm } from "@/components/feedback-form";

export default function FeedbackPage() {
  return (
    <main className="container page-space narrow">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PROTOTYPE FEEDBACK</p>
          <h1>Help us learn what matters.</h1>
          <p className="muted">A few quick questions for teammates and early testers. This page does not submit or store responses.</p>
        </div>
        <Link href="/demo" className="button secondary">Back to sample</Link>
      </div>
      <div className="notice">
        <strong>Why this exists:</strong> we want specific feedback about usefulness, clarity, budget value, and what would make someone use FitCart weekly. Generate a response summary below, then copy it and send it to the FitCart team.
      </div>
      <FeedbackForm />
    </main>
  );
}
