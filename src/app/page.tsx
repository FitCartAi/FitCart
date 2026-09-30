import Link from "next/link";
import { consolidateDemo, makeDemoSchedule, money } from "@/lib/demo-plan";

const valueCards = [
  { label: "Budgeting", title: "Start with what you can spend.", copy: "Your grocery budget is a core input, not an afterthought." },
  { label: "Fitness", title: "Plan around your goal.", copy: "Tell FitCart whether you want to gain muscle, lose weight, maintain, or simply eat better." },
  { label: "Meal planning", title: "Turn goals into a real week.", copy: "Build toward practical meals that fit your preferences, schedule, and kitchen." },
  { label: "Grocery planning", title: "Finish with one useful list.", copy: "Bring the week together in a consolidated cart with quantities and estimated cost." },
];

export default function Home() {
  const total = consolidateDemo(makeDemoSchedule()).reduce((sum, item) => sum + item.costCents, 0);

  return (
    <main className="container page-space">
      <section className="hero">
        <div>
          <p className="eyebrow">BUDGET + FITNESS + MEAL PLANNING + GROCERIES</p>
          <h1>One plan for the way you <span>eat, train, and spend.</span></h1>
          <p className="hero-copy">
            FitCart is being built to turn your goals, food preferences, grocery budget, and shopping habits into one practical weekly plan.
          </p>
          <div className="hero-actions">
            <Link href="/onboarding" className="button primary">Build My Cart <span aria-hidden="true">&rarr;</span></Link>
            <Link href="/demo" className="button secondary">Explore a sample</Link>
          </div>
          <p className="help">No account. No payment. Use sample answers to test the prototype without entering personal information.</p>
        </div>

        <aside className="hero-preview">
          <div className="preview-top"><span className="eyebrow">CURRENT PROTOTYPE</span><span className="pill">FIXED SAMPLE</span></div>
          <h2>A week with a plan.</h2>
          <div className="preview-meal"><span>BREAKFAST</span><strong>Banana overnight oats</strong></div>
          <div className="preview-meal"><span>LUNCH</span><strong>Chicken, rice &amp; broccoli</strong></div>
          <div className="preview-meal"><span>DINNER</span><strong>Turkey taco wraps</strong></div>
          <div className="preview-bottom"><div><small>Fictional weekly total</small><strong>{money(total)}</strong></div><span>7 days<br />1 person</span></div>
          <p className="help">Example layout only. Not personalized or allergy-checked. Prices are fictional.</p>
        </aside>
      </section>

      <section className="value-section" aria-labelledby="value-heading">
        <div className="section-intro">
          <p className="eyebrow">WHY FITCART</p>
          <h2 id="value-heading">Four jobs. One weekly workflow.</h2>
          <p className="muted">Instead of bouncing between a budget, fitness goal, meal ideas, and a grocery list, FitCart is designed to connect them.</p>
        </div>
        <div className="value-grid">
          {valueCards.map(card => (
            <article className="value-card" key={card.label}>
              <span className="eyebrow">{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="how-grid" aria-label="Prototype workflow">
        <article><span className="eyebrow">01 / TELL US ABOUT YOU</span><h2>Start with your constraints.</h2><p>Goals, food preferences, budget, household, and kitchen setup.</p></article>
        <article><span className="eyebrow">02 / CHECK THE DETAILS</span><h2>Stay in control.</h2><p>Review, edit, or clear your answers before moving forward.</p></article>
        <article><span className="eyebrow">03 / TEST THE EXPERIENCE</span><h2>Help shape the product.</h2><p>Explore the fixed sample, then tell us what feels useful, confusing, or missing.</p></article>
      </section>

      <section className="feedback-callout">
        <div>
          <p className="eyebrow">BUILDING WITH REAL FEEDBACK</p>
          <h2>Try it, then tell us what would make you come back next week.</h2>
          <p>Our current priority is learning whether the workflow is clear and whether the combined budget + fitness + meal + grocery concept feels useful.</p>
        </div>
        <Link href="/feedback" className="button primary">Give prototype feedback <span aria-hidden="true">&rarr;</span></Link>
      </section>

      <div className="notice">
        <strong>Where we are today:</strong> onboarding and sample result screens are working. Personalized AI plans, nutrition targets, live grocery prices, accounts, and saved weekly history are not connected yet.
      </div>
    </main>
  );
}
