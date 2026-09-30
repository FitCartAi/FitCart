"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/onboarding/profile-provider";
import { ProfileSummary } from "@/components/onboarding/profile-summary";
import { validateDraft } from "@/lib/profile";
export default function PlanPage() {
  const { ready, draft, completed, remember, notice, clear } = useProfile();
  const router = useRouter();
  if (!ready) return <main className="container page-space"><p role="status">Opening your profile...</p></main>;
  if (!completed || Object.keys(validateDraft(draft)).length) return <main className="container page-space narrow"><section className="panel"><p className="eyebrow">LET&apos;S START WITH YOU</p><h1>No completed profile in this session.</h1><p className="muted">Complete the questionnaire first. Refreshing without optional tab storage clears your previous answers.</p><Link className="button primary" href="/onboarding">Open questionnaire</Link></section></main>;
  return <main className="container page-space narrow"><section className="panel"><p className="eyebrow">QUESTIONNAIRE COMPLETE</p><h1>Your preferences are ready.</h1><p className="muted">Thanks, {draft.nickname.trim()}. You can review your answers below. A personalized meal plan has not been generated.</p><div className="notice">{remember ? "Your answers are stored in this browser tab, not in a FitCart account." : "Your answers are kept only in page memory. Refreshing will clear them."} No profile data has been sent to an AI provider or database.</div><ProfileSummary draft={draft} /><div className="hero-actions"><Link href="/onboarding" className="button secondary">Edit answers</Link><button type="button" className="text-button" onClick={() => { clear(); router.push("/onboarding"); }}>Forget my answers</button></div>{notice && <p role="status" className="field-error">{notice}</p>}</section><section className="panel next-card"><p className="eyebrow">NEXT / A PREVIEW, NOT A PERSONAL PLAN</p><h2>Take a look at the sample week.</h2><p>The fixed demo uses fictional prices and does not adapt to your answers, allergies, household size or budget. It is for feedback on the layout only.</p><Link href="/demo" className="button primary">Explore fixed sample <span aria-hidden="true">&rarr;</span></Link></section></main>;
}
