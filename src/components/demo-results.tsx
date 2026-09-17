"use client";
import Link from "next/link";
import { useState } from "react";
import { consolidateDemo, makeDemoSchedule, money, recipes, swapDemoLunch } from "@/lib/demo-plan";

export function DemoResults() {
  const [days, setDays] = useState(makeDemoSchedule);
  const [checked, setChecked] = useState<string[]>([]);
  const items = consolidateDemo(days);
  const total = items.reduce((sum, item) => sum + item.costCents, 0);
  const budget = 8500;
  return <main className="container page-space">
    <div className="page-heading"><div><p className="eyebrow">FIXED SAMPLE / NOT YOUR PERSONAL PLAN</p><h1>A week, made visible.</h1><p className="muted">Explore how meals and a shopping list could work together.</p></div><Link className="button secondary" href="/onboarding">Back to questionnaire</Link></div>
    <div className="notice warning" role="note"><strong>For layout feedback only.</strong> This fixed example is for one person, seven days and three meals per day. It does not use your questionnaire answers, screen allergies or match nutrition needs. Prices are fictional, not Publix or any other store&apos;s prices. It is not a shopping recommendation.</div>
    <section className="stat-grid" aria-label="Sample plan overview"><div className="stat"><span>Example budget</span><strong>{money(budget)}</strong><small>Not your entered budget</small></div><div className="stat"><span>Fictional package total</span><strong data-testid="demo-total">{money(total)}</strong><small>Includes full packs and pantry staples</small></div><div className="stat"><span>{total <= budget ? "Sample budget remaining" : "Sample amount over budget"}</span><strong>{money(Math.abs(budget - total))}</strong><small>Excludes tax, fees and delivery</small></div></section>
    <div className="section-heading"><h2>Sample meal plan</h2><button type="button" className="text-button" onClick={() => { setDays(makeDemoSchedule()); setChecked([]); }}>Reset sample</button></div>
    <p className="muted">Try a sample lunch swap. The list and fictional total below update with it; this is a preset switch, not AI.</p>
    <section className="day-grid" aria-label="Seven sample days">{days.map((day, i) => <article className="day-card" key={i}><p className="day-number">DAY {i + 1}</p>{(["breakfast", "lunch", "dinner"] as const).map(slot => <div className="meal" key={slot}><span>{slot}</span><h3>{recipes[day[slot]].name}</h3></div>)}<button className="text-button" aria-label={`Swap sample lunch for day ${i + 1}`} onClick={() => { setDays(swapDemoLunch(days, i)); setChecked([]); }}>Try a lunch swap &rarr;</button></article>)}</section>
    <section className="panel grocery-panel"><div className="section-heading"><div><p className="eyebrow">ONE CONSOLIDATED LIST</p><h2>Sample grocery list</h2></div><button className="button secondary print-button" type="button" onClick={() => window.print()}>Print sample</button></div><p className="muted">{checked.length} of {items.length} items checked. Quantities are combined across meals. A swap clears checkmarks because amounts may change.</p>
      {[...new Set(items.map(item => item.category))].map(category => <section className="grocery-category" key={category}><h3>{category}</h3>{items.filter(item => item.category === category).map(item => <div className="grocery-row" key={item.id}><label className={checked.includes(item.id) ? "check is-checked" : "check"}><input type="checkbox" checked={checked.includes(item.id)} onChange={e => setChecked(e.target.checked ? [...checked, item.id] : checked.filter(id => id !== item.id))} /><span><strong>{item.name}</strong><small>Buy {item.packs} &times; {item.packLabel}. Used: {item.quantity} {item.unit}. Left: {item.leftover} {item.unit}.</small><small>For: {item.meals.join("; ")}</small></span></label><span className="price">{money(item.costCents)}</span></div>)}</section>)}
      <div className="grocery-total"><strong>Fictional estimated total</strong><strong>{money(total)}</strong></div>
      <p className="help">These are fabricated package prices for testing arithmetic. Pantry staples are charged as full packages; no existing pantry inventory is assumed. Brands, availability, taxes and fees have not been checked. No nutritional adequacy or food-safety assessment has been performed.</p>
    </section>
    <section className="notice"><strong>What feedback helps us next?</strong> Are the questions clear? Can you find meal quantities and the list total? What would stop you from using this layout? Tell the FitCart team directly; this version does not collect survey responses.</section>
  </main>;
}
