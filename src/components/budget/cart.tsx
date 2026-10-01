'use client';
import Link from 'next/link';
import { useState } from 'react';
import { basket, bestPair, budgetStatus, compare, money, provenance, quote, swaps, type Line } from '@/lib/v2/cart';
import { cartSettings, labels, type Draft, type Store } from '@/lib/v2/profile';
import { BudgetSummary } from './summary';

const ideas = [
  { name: 'Overnight oats with yogurt and banana', appliance: '', uses: 'Oats, yogurt, bananas; refrigeration needed.' },
  { name: 'Microwave bean wraps', appliance: 'microwave', uses: 'Canned beans and tortillas.' },
  { name: 'Rice and vegetable skillet', appliance: 'stovetop', uses: 'Rice, vegetables and oil.' },
  { name: 'Roasted vegetable wraps', appliance: 'oven', uses: 'Vegetables, tortillas and oil.' },
  { name: 'Air-fryer vegetable wraps', appliance: 'air_fryer', uses: 'Vegetables, tortillas and oil.' },
  { name: 'Grilled vegetable wraps', appliance: 'grill', uses: 'Vegetables, tortillas and oil.' },
  { name: 'Slow-cooker rice and bean bowl', appliance: 'slow_cooker', uses: 'Rice and canned beans.' },
  { name: 'Yogurt and banana smoothie', appliance: 'blender', uses: 'Yogurt and bananas.' },
];
export function BudgetCart({ draft, sample = false }: { draft: Draft; sample?: boolean }) {
  const settings = cartSettings(draft);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [route, setRoute] = useState<Store | 'best' | 'split'>('best');
  const [checked, setChecked] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState('');
  const [copyText, setCopyText] = useState('');
  const lines = basket(settings, accepted);
  const quotes = compare(lines, settings.stores);
  const best = quotes.find(q => q.total !== null);
  const split = settings.trip !== 'single' ? bestPair(lines, settings.stores) : null;
  function calculate(items: Line[]) {
    if (route === 'split') return bestPair(items, settings.stores)?.total ?? null;
    if (route === 'best') return compare(items, settings.stores).find(q => q.total !== null)?.total ?? null;
    return quote(items, route).total;
  }
  const total = calculate(lines);
  const status = budgetStatus(total, settings.budgetCents, settings.budgetStyle);
  const selectedStore = route === 'best' ? best?.store : route !== 'split' ? route : undefined;
  const shoppingStores = route === 'split' ? split?.stores ?? [] : selectedStore ? [selectedStore] : [];
  const storeFor = (item: Line) => route === 'split' ? split?.assignments[item.id] : selectedStore;
  const additionalSaving = split && best?.total !== null && best?.total !== undefined ? best.total - split.total : null;
  const matchingIdeas = ideas.filter(idea => !idea.appliance || (!draft.noCook && draft.appliances.includes(idea.appliance)))
    .sort((a, b) => Number(draft.preferred.includes(b.appliance)) - Number(draft.preferred.includes(a.appliance)));
  function changeRoute(value: typeof route) { setRoute(value); setChecked([]); setCopyText(''); setCopyStatus(''); }
  function toggleSwap(id: string) {
    setAccepted(previous => previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]);
    setChecked([]); setCopyText(''); setCopyStatus('');
  }
  async function copy() {
    const text = [
      'FITCART V2A - SYNTHETIC EXAMPLE. NOT A LIVE QUOTE OR SHOPPING RECOMMENDATION.',
      `Source: ${provenance.source} / ${provenance.version}. Price verified: never.`,
      `Example total: ${total === null ? 'Incomplete' : money(total)}. Merchandise only; tax, fees and travel excluded.`,
      ...lines.filter(i => i.packs > 0).map(i => `${i.name}: ${i.packs} x ${i.pack} ${i.unit} at ${labels[storeFor(i) ?? ''] ?? 'Unpriced'}`),
    ].join('\n');
    setCopyText(text);
    try { await navigator.clipboard.writeText(text); setCopyStatus('Example copied. The synthetic-price warning is included.'); }
    catch { setCopyStatus('Copy is unavailable in this browser. Select and copy the text below.'); }
  }
  return <main className="container page-space v2-cart">
    <div className="page-heading"><div><p className="eyebrow">V2A / SYNTHETIC PRICE PREVIEW</p><h1>Your budget. Your cart. Your call.</h1><p className="muted">{sample ? 'You are exploring a sample profile.' : 'Your shopping inputs control this illustrative calculation.'}</p></div><Link href="/budget" className="button secondary">{sample ? 'Set up my budget' : 'Edit my setup'}</Link></div>
    <div className="notice warning" role="note" data-testid="synthetic-notice"><strong>Not live pricing. Not a shopping recommendation.</strong> Every product price, store ranking and saving below is invented for V2A testing. Retailer branches and coupon eligibility are not verified. The basket scales with days, household size and meals, but it is not a complete or nutritionally assessed meal plan. Allergies, dietary restrictions and fitness goals do not filter it.</div>
    <section className="stat-grid" aria-label="Example budget overview">
      <div className="stat"><span>{labels[settings.budgetStyle]}</span><strong>{settings.budgetCents === null ? 'No cap' : money(settings.budgetCents)}</strong><small>{settings.days} days / {settings.people} people / {settings.meals} meals daily</small></div>
      <div className="stat"><span>Selected sample merchandise total</span><strong data-testid="cart-total">{total === null ? 'Incomplete' : money(total)}</strong><small>{shoppingStores.map(s => labels[s]).join(' + ') || 'No priced option'} / fictional prices</small></div>
      <div className={`stat ${status.state === 'blocked' || status.state === 'over' ? 'v2-over' : ''}`}><span>{status.difference === null ? 'Comparison mode' : status.difference < 0 ? 'Above your example budget' : 'Room in your example budget'}</span><strong>{status.difference === null ? 'Compare costs' : money(Math.abs(status.difference))}</strong><small>Room in the budget is not a verified saving.</small></div>
    </section>
    <div className={`notice ${status.state === 'blocked' || status.state === 'over' ? 'warning' : ''}`} role="status" data-testid="budget-status"><strong>{status.text}</strong> Taxes, fees and travel are excluded, so even an under-budget example is not a checkout guarantee.</div>
    <section className="panel" aria-labelledby="compare-heading"><div className="section-heading"><div><p className="eyebrow">SAME EXAMPLE ITEMS / SAME PACK SIZES</p><h2 id="compare-heading">Compare selected stores</h2></div><button className="button secondary" type="button" onClick={() => changeRoute('best')}>Use lowest single-store total</button></div><p className="help">These rankings describe the fixture only, not which retailer is actually cheapest. No verified product matches or in-store prices.</p>
      <div className="v2-store-grid">{quotes.map(q => <label className={`v2-store ${selectedStore === q.store ? 'v2-selected' : ''}`} key={q.store}><span className="check"><input type="radio" name="cart-store" aria-label={`Use ${labels[q.store]} sample cart`} checked={selectedStore === q.store} disabled={q.total === null} onChange={() => changeRoute(q.store)} /><strong>{labels[q.store]}</strong></span><b>{q.total === null ? 'Incomplete basket' : money(q.total)}</b><span>{q.total !== null && best?.total !== null && best?.total !== undefined ? q.total === best.total ? 'Lowest single-store example' : `${money(q.total - best.total)} above the lowest example` : 'Missing prices; excluded from ranking'}</span><small>Source: FitCart fixture-1<br />Verified price date: none (synthetic)<br />Channel: example / location: unverified</small></label>)}</div>
      {settings.stores.length === 1 && <p className="help">Select more retailers in your setup to compare stores.</p>}
    </section>
    {settings.trip !== 'single' && <section className="panel next-card" aria-labelledby="split-heading"><p className="eyebrow">AN OPTION, NEVER A REQUIREMENT</p><h2 id="split-heading">Would another stop be worth it?</h2>{split && best?.total !== null && best?.total !== undefined ? <><p><strong>{split.stores.map(s => labels[s]).join(' + ') || 'Nothing to buy'}: {money(split.total)}</strong><br />{additionalSaving !== null && additionalSaving > 0 ? `${money(additionalSaving)} less in this fixture than the lowest single-store option.` : 'No additional merchandise saving in this fixture.'} Travel time and fuel are not included.</p><button type="button" className="button secondary" disabled={route === 'split' || split.stores.length < 2 || additionalSaving === null || additionalSaving <= 0} onClick={() => changeRoute('split')}>{route === 'split' ? 'Two-store example selected' : 'Use this two-store example'}</button></> : <p>Select at least two stores with complete example prices to explore this option.</p>}</section>}
    <section className="panel v2-space" aria-labelledby="swaps-heading"><p className="eyebrow">{labels[settings.savingsMode].toUpperCase()} / ALL CHANGES ARE OPTIONAL</p><h2 id="swaps-heading">Make my cart cheaper</h2><p className="muted">Review a fictional cost difference before accepting a substitution. Meals and nutrition are not equivalent just because an ingredient costs less.</p><div className="v2-swap-grid">{swaps.filter(s => s.modes.includes(settings.savingsMode)).map(s => {
      const active = accepted.includes(s.id);
      const next = active ? accepted.filter(id => id !== s.id) : [...accepted, s.id];
      const after = calculate(basket(settings, next));
      const saving = total !== null && after !== null ? (active ? after - total : total - after) : null;
      return <article className="v2-swap" key={s.id}><h3>{s.title}</h3><p>{s.detail}</p><strong>{saving === null ? 'Cost unavailable' : saving > 0 ? `${money(saving)} ${active ? 'example reduction applied' : 'lower in this example'}` : 'No lower total for this basket'}</strong><button type="button" className="button secondary" disabled={!active && (saving === null || saving <= 0)} onClick={() => toggleSwap(s.id)}>{active ? 'Undo' : 'Accept'} {s.title.toLowerCase()}</button></article>;
    })}</div><button className="text-button" type="button" onClick={() => { setAccepted([]); changeRoute('best'); }}>Reset sample changes</button></section>
    <section className="panel v2-space" aria-labelledby="list-heading"><div className="section-heading"><div><p className="eyebrow">WHOLE PACKAGES / PANTRY FIRST</p><h2 id="list-heading">Your example grocery list</h2></div><button className="button secondary" type="button" disabled={total === null || status.state === 'blocked'} onClick={copy}>Copy example list</button><button className="button secondary print-button" type="button" onClick={() => window.print()}>Print preview</button></div>
      <p className="help">Checkmarks track example shopping progress; they do not lower the total. Changing stores or swaps clears checkmarks. A hard-limit overage blocks copying a finalized example list.</p>
      {shoppingStores.map(store => <section key={store} className="grocery-category"><h3>{labels[store]} / sample items</h3>{lines.filter(i => i.packs > 0 && storeFor(i) === store).map(item => <div className="grocery-row" key={item.id}><label className={`check ${checked.includes(item.id) ? 'is-checked' : ''}`}><input type="checkbox" checked={checked.includes(item.id)} onChange={e => setChecked(e.target.checked ? [...checked, item.id] : checked.filter(x => x !== item.id))} /><span><strong>{item.name}</strong><small>Example need: {item.quantity} {item.unit} / pantry used: {item.pantryUsed} {item.unit}</small><small>Buy {item.packs} x {item.pack} {item.unit} / leftover after example use: {item.packs * item.pack - item.needed} {item.unit}</small></span></label><span className="price">{item.prices[store] === undefined ? 'Unpriced' : money(item.packs * item.prices[store]!)}</span></div>)}</section>)}
      {lines.some(i => !i.packs) && <div className="notice">Covered by measured pantry stock: {lines.filter(i => !i.packs).map(i => i.name).join(', ')}. Other pantry notes are not included in the calculation.</div>}
      <div className="grocery-total"><strong>Sample merchandise total</strong><strong>{total === null ? 'Incomplete' : money(total)}</strong></div>
      {copyStatus && <p role="status">{copyStatus}</p>}{copyText && <textarea className="v2-copy" aria-label="Copyable example list" readOnly value={copyText} rows={7} />}
    </section>
    <section className="panel v2-space"><h2>Deals &amp; coupons</h2><p><strong>No verified deals applied.</strong> V2A has no live offers or loyalty connection. Future offers must show a source, store, expiry and eligibility before changing a total. The fictional swaps above are not retailer coupons.</p></section>
    <section className="panel v2-space"><p className="eyebrow">MEALS SUPPORT THE CART, NOT THE OTHER WAY AROUND</p><h2>Appliance-aware inspiration</h2><p className="help">Only ideas compatible with your selected appliances appear, with preferred appliances first. These are not recipes or a full menu. They do not check allergies, diet, cooking time or nutrition; the example basket itself is not appliance-filtered and can include foods that require cooking.</p><div className="v2-swap-grid">{matchingIdeas.map(idea => <article className="v2-swap" key={idea.name}><span className="eyebrow">{idea.appliance ? labels[idea.appliance] : 'No cooking'}{draft.preferred.includes(idea.appliance) ? ' / preferred' : ''}</span><h3>{idea.name}</h3><p>{idea.uses}</p></article>)}</div></section>
    <details className="panel v2-space"><summary>Your setup and optional preferences</summary><BudgetSummary draft={draft} /></details>
    <section className="feedback-callout"><div><h2>Was the budget comparison useful?</h2><p>Test the experience, not the accuracy of these invented prices.</p></div><Link href="/feedback" className="button primary">Give prototype feedback</Link></section>
  </main>;
}
