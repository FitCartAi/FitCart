'use client';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useBudget } from '@/components/budget/provider';
import { bestSplit, channels, channelNames, compareBasket, dollars, exportObservations, importObservations, MAX_AGE_DAYS, money, parseObservation, products, researchDate, STORAGE_KEY, stores, todayInClemson, units, type Channel, type Observation, type ProductId, type Selection, type StoreId, type Unit } from '@/lib/local-prices';

type Row = { enabled: boolean; quantity: string; pantry: string; unit: Unit };
const newRows = (): Record<ProductId, Row> => Object.fromEntries(products.map((p, i) => [p.id, { enabled: i < 3, quantity: String(p.amount), pantry: '0', unit: p.unit }])) as Record<ProductId, Row>;
const newForm = () => ({ store: 'aldi' as StoreId, product: 'rice' as ProductId, channel: 'in_store' as Channel, productName: '', packageQuantity: '', unit: 'lb' as Unit, price: '', checkedOn: '', source: 'shelf' as Observation['source'], sourceUrl: '', priceType: 'regular' as Observation['priceType'], validThrough: '', loyalty: false, available: true, confirmed: false });
const storeName = (id: StoreId) => stores.find(s => s.id === id)!.name;
const productName = (id: ProductId) => products.find(p => p.id === id)!.name;
export function LocalPriceComparison() {
  const profile = useBudget();
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState('');
  const [records, setRecords] = useState<Observation[]>([]);
  const [remember, setRemember] = useState(false);
  const [rows, setRows] = useState(newRows);
  const [selected, setSelected] = useState<StoreId[]>(stores.map(s => s.id));
  const [channel, setChannel] = useState<Channel>('in_store');
  const [loyalty, setLoyalty] = useState<StoreId[]>([]);
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [budget, setBudget] = useState('');
  const [showSplit, setShowSplit] = useState(false);
  const [form, setForm] = useState(newForm);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  useEffect(() => {
    const date = todayInClemson();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time browser hydration, never read storage on the server
    setToday(date);
    setForm(f => ({ ...f, checkedOn: date }));
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) { setRecords(importObservations(stored, date)); setRemember(true); }
    } catch { setNotice('Saved notes could not be loaded. Nothing was uploaded; you can start again.'); }
    setReady(true);
    const timer = setInterval(() => setToday(todayInClemson()), 60000);
    return () => clearInterval(timer);
  }, []);
  function persist(next: Observation[], enabled = remember) {
    setRecords(next); setRemember(enabled);
    try { if (enabled) sessionStorage.setItem(STORAGE_KEY, exportObservations(next)); else sessionStorage.removeItem(STORAGE_KEY); }
    catch { setNotice('Tab storage is unavailable. Export your notes before closing or refreshing.'); }
  }
  function updateRow(id: ProductId, changes: Partial<Row>) { setRows(r => ({ ...r, [id]: { ...r[id], ...changes } })); }
  function toggle(list: StoreId[], value: StoreId): StoreId[] { return list.includes(value) ? list.filter(s => s !== value) : [...list, value]; }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    try {
      const cents = dollars(form.price);
      if (cents === null) throw new Error('Enter a valid package price with at most two decimals.');
      const record = parseObservation({ ...form, id: `${form.store}-${form.product}-${form.channel}`, packageQuantity: Number(form.packageQuantity), priceCents: cents });
      if (record.checkedOn > today) throw new Error('A price observation cannot be dated in the future.');
      const next = records.filter(o => !(o.store === record.store && o.product === record.product && o.channel === record.channel));
      persist([...next, record]);
      setNotice(`${storeName(record.store)} price saved as your observation, not independently verified.`);
      setForm(f => ({ ...f, price: '', productName: '', packageQuantity: '', sourceUrl: '', confirmed: false, loyalty: false, available: true, priceType: 'regular', validThrough: '' }));
    } catch (e) { setError(e instanceof Error ? e.message : 'Check your price entry.'); }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    setNotice(''); setError('');
    try {
      if (file.size > 200000) throw new Error('File is too large (200 KB limit).');
      const imported = importObservations(await file.text(), today);
      // Preserve newer records. Imported provenance cannot become independent verification.
      const merged = new Map(records.map(r => [`${r.store}|${r.product}|${r.channel}`, r]));
      for (const r of imported) {
        const key = `${r.store}|${r.product}|${r.channel}`, old = merged.get(key);
        if (!old || r.checkedOn >= old.checkedOn) merged.set(key, { ...r, id: key });
      }
      persist([...merged.values()]); setNotice('Price notes imported as personal observations. Review branch, product and dates before relying on them.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not read the file.'); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([exportObservations(records)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `fitcart-price-notes-${today}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  let inputError = '';
  const selections: Selection[] = products.filter(p => rows[p.id].enabled).map(p => ({ product: p.id, quantity: Number(rows[p.id].quantity), pantry: Number(rows[p.id].pantry), unit: rows[p.id].unit }));
  const storeExtras: Partial<Record<StoreId, number>> = {};
  for (const s of selected) {
    const value = dollars(extras[s] || '0');
    if (value === null) inputError = 'Check estimated additional charges. Use dollars with at most two decimals.';
    else storeExtras[s] = value;
  }
  const budgetCents = budget.trim() ? dollars(budget) : null;
  if (budget.trim() && budgetCents === null) inputError = 'Check your budget amount.';
  let comparison: ReturnType<typeof compareBasket> = { quotes: [], complete: [], lowest: null, winners: [] };
  if (ready && !inputError) {
    try { comparison = compareBasket(selections, records, selected, { today, channel, loyalty, extras: storeExtras }); }
    catch (e) { inputError = e instanceof Error ? e.message : 'Check your quantities.'; }
  }
  const split = showSplit && !inputError ? bestSplit(comparison.quotes) : null;
  const currentProduct = products.find(p => p.id === form.product)!;
  const relevantUnits = (Object.keys(units) as Unit[]).filter(u => units[u].dimension === units[currentProduct.unit].dimension);
  if (!ready) return <main className="container page-space"><p role="status">Opening local price comparison...</p></main>;
  return <main className="container page-space local-prices">
    <div className="page-heading"><div><p className="eyebrow">CLEMSON AREA / PRICE NOTEBOOK</p><h1>Compare prices you can trace.</h1><p className="muted">Build a shopping list, record branch-specific prices, and compare whole-package costs.</p></div><Link className="button secondary" href="/sample">Fictional demo instead</Link></div>
    <div className="lp-banner"><strong>No automatic retailer price feed is connected.</strong> Research checked {researchDate} did not establish a complete, current, same-method local basket across all four stores. This page starts without prices rather than inventing a ranking. Your entries are personal observations, not independently verified quotes.</div>
    <p className="help">Retailers are not partners. These are grocery comparisons, not allergy-screened or nutritionally complete meal recommendations. Existing sample carts remain fictional and separate.</p>
    <section className="panel lp-section" aria-labelledby="trip-title"><h2 id="trip-title">1. Set up your comparison</h2>
      <div className="lp-grid"><label>Shopping method<select value={channel} onChange={e => setChannel(e.target.value as Channel)}>{channels.map(c => <option value={c} key={c}>{channelNames[c]}</option>)}</select></label><label>Budget for this basket (optional, USD)<input value={budget} onChange={e => setBudget(e.target.value)} inputMode="decimal" placeholder="75.00" /></label></div>
      {profile.completed && <button className="button secondary lp-gap" onClick={() => { setBudget(profile.draft.budget); setSelected(profile.draft.stores.filter(s => stores.some(x => x.id === s)) as StoreId[]); setNotice('Copied your selected retailers and budget. Shopping items and prices are not imported from the fictional meal basket.'); }}>Use my saved budget and stores</button>}
      <p className="help">One fixed branch per retailer in this pilot. Add observations only for the branch listed below. In-store, pickup and delivery prices never mix. Store order below is alphabetical, not a price ranking.</p>
      <div className="lp-store-grid">{stores.map(s => <div className="lp-store" key={s.id}><label className="lp-check"><input type="checkbox" checked={selected.includes(s.id)} onChange={() => setSelected(toggle(selected, s.id))} />{s.name}</label><p>{s.branch}</p><a href={s.url} target="_blank" rel="noopener noreferrer">Open official store page</a><p className="help">{s.note}</p>{selected.includes(s.id) && <><label className="lp-check"><input type="checkbox" checked={loyalty.includes(s.id)} onChange={() => setLoyalty(toggle(loyalty, s.id))} />I qualify for recorded member prices</label><label>Extra costs for {s.name} (USD)<input inputMode="decimal" placeholder="0.00" value={extras[s.id] || ''} onChange={e => setExtras({ ...extras, [s.id]: e.target.value })} /></label></>}</div>)}</div>
      <p className="help">Extra costs are your estimate of tax, pickup/delivery fees or travel for each visited store. Blank means $0 included, not that checkout has no fees. For a two-store trip, count shared travel only once.</p>
    </section>
    <section className="panel lp-section" aria-labelledby="basket-title"><h2 id="basket-title">2. Choose what to buy</h2><p className="help">Enter quantities in the displayed unit. Pantry amounts use the same unit and are deducted before package rounding. These quantities are examples for editing, not a meal plan.</p>
      <div className="lp-items">{products.map(p => <div className="lp-item" key={p.id}><label className="lp-check"><input type="checkbox" checked={rows[p.id].enabled} onChange={e => updateRow(p.id, { enabled: e.target.checked })} />{p.name}</label>{rows[p.id].enabled && <><div className="lp-grid"><label>Need: {p.name}<input inputMode="decimal" value={rows[p.id].quantity} onChange={e => updateRow(p.id, { quantity: e.target.value })} /></label><label>Already have: {p.name}<input inputMode="decimal" value={rows[p.id].pantry} onChange={e => updateRow(p.id, { pantry: e.target.value })} /></label><label>Unit: {p.name}<select value={rows[p.id].unit} onChange={e => updateRow(p.id, { unit: e.target.value as Unit })}>{(Object.keys(units) as Unit[]).filter(u => units[u].dimension === units[p.unit].dimension).map(u => <option value={u} key={u}>{units[u].label}</option>)}</select></label></div><p className="help">{p.spec}</p></>}</div>)}</div>
    </section>
    <section className="panel lp-section" aria-labelledby="record-title"><h2 id="record-title">3. Record a local price</h2><p>Use a shelf label, your receipt, or a retailer product page with the exact branch selected. Do not enter general search-result prices as local quotes.</p>
      <form onSubmit={submit} noValidate aria-label="Record a local price"><div className="lp-grid">
        <label>Retailer branch<select value={form.store} onChange={e => setForm({ ...form, store: e.target.value as StoreId, sourceUrl: '', confirmed: false })}>{stores.map(s => <option key={s.id} value={s.id}>{s.name} - {s.branch}</option>)}</select></label>
        <label>Product to compare<select value={form.product} onChange={e => { const p = products.find(p => p.id === e.target.value)!; setForm({ ...form, product: p.id, unit: p.unit, productName: '', packageQuantity: '', confirmed: false }); }}>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label>Price shopping method<select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value as Channel, source: e.target.value === 'in_store' ? 'shelf' : 'retailer', confirmed: false })}>{channels.map(c => <option key={c} value={c}>{channelNames[c]}</option>)}</select></label>
        <label>Exact product and brand<input maxLength={160} value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} placeholder="Brand, product, variant" /></label>
        <label>{form.product === 'bananas' ? 'Priced weight amount' : 'Amount in one package'}<input inputMode="decimal" value={form.packageQuantity} onChange={e => setForm({ ...form, packageQuantity: e.target.value })} /></label>
        <label>Package unit<select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value as Unit })}>{relevantUnits.map(u => <option value={u} key={u}>{units[u].label}</option>)}</select></label>
        <label>{form.product === 'bananas' ? 'Price for that weight (USD)' : 'Whole package price (USD)'}<input inputMode="decimal" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" /></label>
        <label>Date observed<input type="date" max={today} value={form.checkedOn} onChange={e => setForm({ ...form, checkedOn: e.target.value })} /></label>
        <label>Evidence type<select value={form.source} onChange={e => setForm({ ...form, source: e.target.value as Observation['source'] })}>{form.channel === 'in_store' && <option value="shelf">Shelf label at this branch</option>}<option value="receipt">My receipt from this branch</option><option value="retailer">Retailer page with this branch selected</option></select></label>
        <label>Retailer product link {form.source === 'retailer' ? '(required)' : '(optional)'}<input type="url" value={form.sourceUrl} maxLength={1000} onChange={e => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://..." /></label>
        <label>Price type<select value={form.priceType} onChange={e => setForm({ ...form, priceType: e.target.value as Observation['priceType'], validThrough: '' })}><option value="regular">Regular single-package price</option><option value="sale">Sale single-package price</option></select></label>
        {form.priceType === 'sale' && <label>Sale valid through<input type="date" min={form.checkedOn} value={form.validThrough} onChange={e => setForm({ ...form, validThrough: e.target.value })} /></label>}
      </div><p className="help">Match rule: {currentProduct.spec} Brand changes are treated as equivalents only after your confirmation. Multi-buy/BOGO deals, clipped coupons, cashback and basket discounts are not supported; enter an unconditional single-package price instead.</p>
        <label className="lp-check"><input type="checkbox" checked={form.loyalty} onChange={e => setForm({ ...form, loyalty: e.target.checked })} />Requires a loyalty membership</label>
        <label className="lp-check"><input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />Available when observed</label>
        <label className="lp-check"><input type="checkbox" checked={form.confirmed} onChange={e => setForm({ ...form, confirmed: e.target.checked })} />I checked the listed branch, comparable product, pack size, method and price conditions.</label>
        <button className="button primary lp-gap" type="submit">Save price observation</button>
      </form>
      {error && <p role="alert" className="lp-error">{error}</p>}{notice && <p role="status" className="notice">{notice}</p>}
    </section>
    <section className="panel lp-section" aria-labelledby="results-title"><h2 id="results-title">4. Compare your recorded prices</h2><p>Based on personal observations only. Prices older than {MAX_AGE_DAYS} days, expired offers, incompatible shopping methods and unconfirmed loyalty prices are excluded. A recent price is not a guarantee it remains available.</p>
      {inputError && <p role="alert" className="lp-error">{inputError}</p>}
      {!selected.length && <p className="notice">Select at least one store.</p>}{!selections.length && <p className="notice">Select at least one grocery item.</p>}
      {comparison.lowest !== null ? <div className="lp-result" data-testid="price-winner"><strong>{comparison.winners.length > 1 ? 'Tied lowest complete estimates' : 'Lowest complete estimate'}: {comparison.winners.map(storeName).join(' / ')} - {money(comparison.lowest)}</strong><p>Among {comparison.complete.length} complete store records only; incomplete stores could be cheaper. Not a live quote or a general retailer ranking.</p></div> : <p className="notice" data-testid="price-no-winner">{comparison.complete.some(q => q.required === 0) ? 'Your pantry covers the selected quantities. No shopping trip is needed for these items.' : 'No lowest-price claim yet. At least two complete, comparable store baskets are needed.'}</p>}
      <div className="lp-store-grid">{comparison.quotes.map(q => <article className="lp-store" key={q.store} data-testid={`quote-${q.store}`}><h3>{storeName(q.store)}</h3><p>{q.covered}/{q.required} required item prices usable</p><p className="lp-price">{q.total === null ? 'Incomplete' : money(q.total)}</p>{q.total !== null && <><p className="help">Merchandise {money(q.merchandise!)} + your extra-cost estimate {money(q.extra)}</p>{budgetCents !== null && <p>{Math.abs(budgetCents - q.total) === 0 ? 'At your basket budget' : `${money(Math.abs(budgetCents - q.total))} ${q.total > budgetCents ? 'over' : 'below'} budget`} (not proven savings)</p>}</>}<details><summary>Item calculations and sources</summary>{q.lines.map(l => <div className="lp-line" key={l.selection.product}><strong>{productName(l.selection.product)}</strong><p>{l.reason ?? (l.required === 0 ? 'Covered by pantry' : `${Number(l.packages.toFixed(3))} ${l.selection.product === 'bananas' ? 'priced weight units' : 'whole package(s)'}: ${money(l.cost!)}`)}</p>{l.observation && <p className="help">{l.observation.productName} / {l.observation.packageQuantity} {units[l.observation.unit].label} / {money(l.observation.priceCents)} / {channelNames[l.observation.channel]} / observed {l.observation.checkedOn}{l.observation.validThrough && ` / through ${l.observation.validThrough}`}{l.observation.sourceUrl && <> / <a href={l.observation.sourceUrl} target="_blank" rel="noopener noreferrer">Retailer source</a></>}</p>}</div>)}</details></article>)}</div>
      <label className="lp-check lp-gap"><input type="checkbox" checked={showSplit} onChange={e => setShowSplit(e.target.checked)} />Show an optional two-store alternative</label>
      {showSplit && <div className="notice">{split ? <><strong>Two-store estimate: {money(split.total)} at {split.stores.map(storeName).join(' + ')}</strong><p>{split.difference === null ? 'No complete single-store basket exists for comparison; no savings claim is made.' : `${money(split.difference)} less than the lowest complete single-store record, including only your entered extra-cost estimates.`}</p><p>Choose whether the extra trip is worth your time. No trip is booked or cart submitted.</p>{split.assignments.map(a => <p key={a.product}>{productName(a.product)}: {storeName(a.store)} - {money(a.cost)}</p>)}</> : 'No fully priced, lower-cost two-store alternative found for these records and entered charges.'}</div>}
    </section>
    <section className="panel lp-section"><h2>Your price notes</h2><p>{records.length} notes in this tab. Nothing is sent to a FitCart server. Sharing an export shares the product, date, store and source information inside it; do not include personal details in product names or URLs.</p><label className="lp-check"><input type="checkbox" checked={remember} onChange={e => persist(records, e.target.checked)} />Remember price notes in this browser tab</label><p className="help">Off by default. Without this option, refresh clears price notes. Shopping quantities and comparison settings are not saved. Browser session restore may retain opted-in data.</p><div className="hero-actions"><button className="button secondary" onClick={download} disabled={!records.length}>Export price notes</button><label className="lp-file">Import FitCart price notes<input type="file" accept=".json,application/json" onChange={e => { const f = e.target.files?.[0]; void importFile(f); e.target.value = ''; }} /></label><button className="button secondary" onClick={() => setConfirmClear(true)}>Clear all price notes</button></div>{confirmClear && <div className="notice"><p>Remove all price observations and their saved tab copy?</p><button className="button secondary" onClick={() => { persist([], false); setConfirmClear(false); setNotice('Price notes cleared.'); }}>Confirm clear</button> <button className="button secondary" onClick={() => setConfirmClear(false)}>Cancel</button></div>}
      <details className="lp-gap"><summary>Review or remove individual records</summary>{records.map(r => <div className="lp-line" key={r.id}><p>{storeName(r.store)} / {r.productName} / {channelNames[r.channel]} / {money(r.priceCents)}</p><button className="button secondary" onClick={() => persist(records.filter(o => o.id !== r.id))}>Remove {r.productName} at {storeName(r.store)}</button></div>)}</details>
    </section>
    <section className="panel lp-section"><h2>Research and data coverage</h2><p>Research review: {researchDate}. These are source-access findings, not price verification dates. No retailer feed, price scraping or automatic coupon redemption runs on this page.</p><div className="lp-grid"><article><h3>What we could establish</h3><p>Official local branch links and retailer shopping-policy differences. Product pages can show prices without proving the selected local branch or shopping method.</p><p><a href="https://delivery.publix.com/store/publix/pages/pricing-policy" target="_blank" rel="noopener noreferrer">Publix pickup/delivery price policy</a></p></article><article><h3>Why some prices are missing</h3><p>Food Lion requires store selection; the retrieved Publix ad defaulted to Mobile, Alabama. General ALDI and Walmart product prices were not sufficient evidence for local shelf prices.</p><p><a href="https://foodlion.com/savings/weekly-ad/grid-view" target="_blank" rel="noopener noreferrer">Food Lion weekly ads</a> / <a href="https://www.aldi.us/store/aldi/pages/locator" target="_blank" rel="noopener noreferrer">ALDI store selection</a></p></article></div><p className="help">A dependable automated comparison needs permitted branch-specific product data, matched pack sizes and freshness checks. Instacart developer access is not assumed to permit cross-store comparison. <a href="https://docs.instacart.com/developer_platform_api/guide/terms_and_policies/developer_terms/" target="_blank" rel="noopener noreferrer">Read the developer terms.</a></p><p>Your experience that ALDI is often cheapest is a hypothesis to test. FitCart does not force any retailer into first or last place.</p></section>
  </main>;
}
