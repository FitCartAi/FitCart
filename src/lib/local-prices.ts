/** Local observation engine. Never imports the V2A fictional price fixture. */
export const researchDate = '2026-11-06';
export const stores = [
  { id: 'aldi', name: 'ALDI', branch: '13190 Clemson Boulevard, Seneca, SC', url: 'https://www.aldi.us/store/aldi/pages/locator/l/sc/seneca/13190-clemson-boulevard/l950', note: 'Official locator redirect identifies this branch; confirm the address in the retailer app.' },
  { id: 'food_lion', name: 'Food Lion', branch: '1085-D Old Clemson Hwy, Seneca, SC 29672', url: 'https://stores.foodlion.com/sc/seneca/1085-d-old-clemson-hwy', note: 'Official branch page checked. Product prices still require a selected store.' },
  { id: 'publix', name: 'Publix', branch: 'Gateway Village #1379, 1390 Tiger Blvd, Clemson, SC 29631', url: 'https://www.publix.com/locations/1379-gateway-village', note: 'Pickup/delivery prices are not the same as physical-store prices.' },
  { id: 'walmart', name: 'Walmart', branch: 'Neighborhood Market #4445, 680 Old Greenville Hwy, Clemson, SC 29631', url: 'https://www.walmart.com/store/4445-clemson-sc', note: 'Official branch page checked. A price on a general product page is not a verified local quote.' },
] as const;
export type StoreId = typeof stores[number]['id'];
export const channels = ['in_store', 'pickup', 'delivery'] as const;
export type Channel = typeof channels[number];
export const channelNames: Record<Channel, string> = { in_store: 'In store', pickup: 'Pickup', delivery: 'Delivery' };
export const units = {
  g: { factor: 1, dimension: 'mass', label: 'g' },
  oz: { factor: 28.349523125, dimension: 'mass', label: 'oz (weight)' },
  lb: { factor: 453.59237, dimension: 'mass', label: 'lb' },
  ml: { factor: 1, dimension: 'volume', label: 'ml' },
  l: { factor: 1000, dimension: 'volume', label: 'liters' },
  fl_oz: { factor: 29.5735295625, dimension: 'volume', label: 'US fl oz' },
  gallon: { factor: 3785.411784, dimension: 'volume', label: 'US gallons' },
  each: { factor: 1, dimension: 'count', label: 'items' },
} as const;
export type Unit = keyof typeof units;
export const products = [
  { id: 'rice', name: 'Dry long-grain white rice', unit: 'lb', amount: 2, spec: 'Uncooked regular white rice; not instant, brown or seasoned.' },
  { id: 'oats', name: 'Plain rolled oats', unit: 'oz', amount: 18, spec: 'Unflavored old-fashioned rolled oats; not flavored packets.' },
  { id: 'milk', name: 'Whole dairy milk', unit: 'gallon', amount: 1, spec: 'Regular whole dairy milk; not 2%, organic or lactose-free.' },
  { id: 'eggs', name: 'Large shell eggs', unit: 'each', amount: 12, spec: 'Conventional large eggs. Keep specialty/cage-free requirements consistent yourself.' },
  { id: 'beans', name: 'Canned black beans', unit: 'oz', amount: 30, spec: 'Regular canned black beans; use labeled NET weight, not drained weight.' },
  { id: 'oil', name: 'Extra virgin olive oil', unit: 'fl_oz', amount: 16, spec: 'Extra virgin olive oil; not a blended or flavored oil.' },
  { id: 'yogurt', name: 'Plain nonfat Greek yogurt', unit: 'oz', amount: 32, spec: 'Plain, nonfat Greek yogurt; not sweetened, flavored or regular yogurt.' },
  { id: 'broccoli', name: 'Frozen broccoli florets', unit: 'oz', amount: 32, spec: 'Frozen plain florets; not fresh, cuts, seasoned or sauced.' },
  { id: 'chicken', name: 'Boneless skinless chicken breast', unit: 'lb', amount: 2, spec: 'Raw unseasoned breast. Enter an actual package weight and total package price; not a per-pound price.' },
  { id: 'bananas', name: 'Loose yellow bananas', unit: 'lb', amount: 2, spec: 'Conventional bananas. For loose fruit enter 1 lb as the pricing unit and the shelf price per lb.' },
  { id: 'pasta', name: 'Dry spaghetti', unit: 'oz', amount: 16, spec: 'Plain regular wheat spaghetti; not gluten-free, fresh or specialty pasta.' },
  { id: 'tortillas', name: 'Medium flour tortillas', unit: 'each', amount: 8, spec: 'Compare equivalent 8-inch plain flour tortillas; not corn or low-carb.' },
] as const;
export type ProductId = typeof products[number]['id'];
export type Selection = { product: ProductId; quantity: number; pantry: number; unit: Unit };
export type Observation = {
  id: string; store: StoreId; product: ProductId; channel: Channel; productName: string;
  packageQuantity: number; unit: Unit; priceCents: number; checkedOn: string;
  source: 'shelf' | 'receipt' | 'retailer'; sourceUrl: string;
  priceType: 'regular' | 'sale'; validThrough: string; loyalty: boolean;
  available: boolean; confirmed: boolean;
};
export type Options = { today: string; channel: Channel; loyalty: StoreId[]; extras: Partial<Record<StoreId, number>> };
export const MAX_AGE_DAYS = 7; // Product policy, not a promise that prices remain unchanged for seven days.
export const STORAGE_KEY = 'fitcart.local-prices.v1';
export const publishedObservations: Observation[] = []; // No locally verified, authorized price feed yet.
export function todayInClemson(now = new Date()): string {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return `${p.find(x => x.type === 'year')!.value}-${p.find(x => x.type === 'month')!.value}-${p.find(x => x.type === 'day')!.value}`;
}
function day(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return NaN;
  const n = Date.parse(`${s}T00:00:00Z`);
  return Number.isFinite(n) && new Date(n).toISOString().slice(0, 10) === s ? n : NaN;
}
export function dollars(s: string): number | null {
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(s.trim())) return null;
  const cents = Math.round(Number(s) * 100);
  return cents <= 1000000 ? cents : null;
}
export function money(cents: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100); }
function amount(n: unknown): n is number { return typeof n === 'number' && Number.isFinite(n) && n > 0 && n <= 100000; }
export function safeRetailerUrl(value: string, store: StoreId): boolean {
  try {
    const url = new URL(value);
    const hosts: Record<StoreId, string[]> = { aldi: ['aldi.us'], food_lion: ['foodlion.com'], publix: ['publix.com'], walmart: ['walmart.com'] };
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && hosts[store].some(h => url.hostname === h || url.hostname.endsWith('.' + h));
  } catch { return false; }
}
/** Imported records remain personal, unverified observations. Never trust a status field. */
export function parseObservation(value: unknown): Observation {
  if (!value || typeof value !== 'object') throw new Error('Invalid price record.');
  const v = value as Record<string, unknown>;
  const text = (key: string, max: number) => {
    const val = v[key];
    if (typeof val !== 'string' || val.length > max) throw new Error(`Invalid ${key}.`);
    return val.trim();
  };
  const id = text('id', 100), store = text('store', 40) as StoreId, product = text('product', 40) as ProductId;
  const unit = text('unit', 20) as Unit, channel = text('channel', 20) as Channel;
  const productName = text('productName', 160), checkedOn = text('checkedOn', 10), validThrough = text('validThrough', 10);
  const source = text('source', 20) as Observation['source'], sourceUrl = text('sourceUrl', 1000), priceType = text('priceType', 20) as Observation['priceType'];
  const productInfo = products.find(p => p.id === product);
  if (!id || !stores.some(s => s.id === store) || !productInfo || !(unit in units) || !channels.includes(channel) || !productName) throw new Error('Select a supported store, product, unit and shopping method; enter the exact product name.');
  if (units[unit].dimension !== units[productInfo.unit].dimension) throw new Error('The package unit must match the product type.');
  if (!amount(v.packageQuantity) || (unit === 'each' && !Number.isInteger(v.packageQuantity))) throw new Error('Enter a valid package quantity; counted items must be whole.');
  if (typeof v.priceCents !== 'number' || !Number.isSafeInteger(v.priceCents) || v.priceCents <= 0 || v.priceCents > 1000000) throw new Error('Enter a package price above $0 and no more than $10,000.');
  if (!Number.isFinite(day(checkedOn))) throw new Error('Enter a valid observation date.');
  if (!['regular', 'sale'].includes(priceType) || (validThrough && (!Number.isFinite(day(validThrough)) || validThrough < checkedOn)) || (priceType === 'sale' && !validThrough)) throw new Error('A sale needs a valid end date on or after its observation date.');
  if (!['shelf', 'receipt', 'retailer'].includes(source) || (source === 'shelf' && channel !== 'in_store')) throw new Error('Shelf observations must use in-store pricing.');
  if ((source === 'retailer' && !sourceUrl) || (sourceUrl && !safeRetailerUrl(sourceUrl, store))) throw new Error('Use an HTTPS product link on the selected retailer domain.');
  if (typeof v.loyalty !== 'boolean' || typeof v.available !== 'boolean' || v.confirmed !== true) throw new Error('Confirm the exact branch and comparable product before saving.');
  return { id, store, product, channel, productName, packageQuantity: v.packageQuantity, unit, priceCents: v.priceCents, checkedOn, source, sourceUrl, priceType, validThrough, loyalty: v.loyalty, available: v.available, confirmed: true };
}
export function importObservations(raw: string, today: string): Observation[] {
  if (raw.length > 200000) throw new Error('Price file is too large (200 KB limit).');
  const doc = JSON.parse(raw);
  if (doc?.version !== 1 || !Array.isArray(doc.observations) || doc.observations.length > 300) throw new Error('Use a FitCart price export (maximum 300 observations).');
  const records = doc.observations.map((v: unknown) => parseObservation(v)) as Observation[];
  if (records.some(r => r.checkedOn > today)) throw new Error('Price observations cannot be dated in the future.');
  if (new Set(records.map(r => r.id)).size !== records.length) throw new Error('Duplicate record IDs.');
  const keys = records.map(r => `${r.store}|${r.product}|${r.channel}`);
  if (new Set(keys).size !== keys.length) throw new Error('Only one current observation per product, branch and shopping method is supported.');
  return records;
}
export function exportObservations(observations: Observation[]): string { return JSON.stringify({ version: 1, observations: observations.map(parseObservation) }, null, 2); }
export function observationIssue(o: Observation, opts: Options): string | null {
  if (o.channel !== opts.channel) return 'Different shopping method';
  if (!Number.isFinite(day(opts.today))) return 'Invalid comparison date';
  if (o.checkedOn > opts.today) return 'Future date';
  if ((day(opts.today) - day(o.checkedOn)) / 86400000 > MAX_AGE_DAYS) return 'Older than 7 days';
  if (o.validThrough && o.validThrough < opts.today) return 'Offer expired';
  if (!o.available) return 'Marked unavailable';
  if (o.loyalty && !opts.loyalty.includes(o.store)) return 'Loyalty eligibility not confirmed';
  return null;
}
export type Line = { selection: Selection; observation: Observation | null; required: number; packages: number; cost: number | null; reason: string | null };
export type Quote = { store: StoreId; lines: Line[]; covered: number; required: number; merchandise: number | null; extra: number; total: number | null };
export function quoteBasket(selections: Selection[], records: Observation[], store: StoreId, opts: Options): Quote {
  if (!stores.some(s => s.id === store) || !channels.includes(opts.channel) || !Number.isFinite(day(opts.today))) throw new Error('Invalid comparison options.');
  const extra = opts.extras[store] ?? 0;
  if (!Number.isSafeInteger(extra) || extra < 0 || extra > 1000000) throw new Error('Invalid store charges.');
  if (selections.length > products.length || new Set(selections.map(s => s.product)).size !== selections.length) throw new Error('Invalid shopping list.');
  const parsed = records.map(parseObservation);
  const lines = selections.map(s => {
    const p = products.find(p => p.id === s.product);
    if (!p || !(s.unit in units) || units[s.unit].dimension !== units[p.unit].dimension || !amount(s.quantity) || !Number.isFinite(s.pantry) || s.pantry < 0 || s.pantry > 100000 || (s.unit === 'each' && (!Number.isInteger(s.quantity) || !Number.isInteger(s.pantry)))) throw new Error('Check shopping quantities and pantry amounts.');
    const required = Math.max(0, s.quantity - s.pantry) * units[s.unit].factor;
    if (required === 0) return { selection: s, observation: null, required, packages: 0, cost: 0, reason: null };
    // A newer unavailable/expired record must not fall back to an older cheaper price.
    const candidates = parsed.filter(o => o.store === store && o.product === s.product && o.channel === opts.channel).sort((a, b) => b.checkedOn.localeCompare(a.checkedOn));
    const observation = candidates[0] ?? null;
    const reason = observation ? observationIssue(observation, opts) : 'Price needed';
    if (reason || !observation) return { selection: s, observation, required, packages: 0, cost: null, reason };
    const pack = observation.packageQuantity * units[observation.unit].factor;
    // Loose bananas are billed by weight; packaged products round UP to whole packs.
    const packages = s.product === 'bananas' ? required / pack : Math.ceil(required / pack - 1e-9);
    return { selection: s, observation, required, packages, cost: Math.round(packages * observation.priceCents), reason: null };
  });
  const needed = lines.filter(l => l.required > 0);
  const covered = needed.filter(l => l.cost !== null).length;
  const complete = selections.length > 0 && covered === needed.length;
  const merchandise = complete ? lines.reduce((n, l) => n + (l.cost ?? 0), 0) : null;
  const actualExtra = needed.length ? extra : 0;
  return { store, lines, covered, required: needed.length, merchandise, extra: actualExtra, total: merchandise === null ? null : merchandise + actualExtra };
}
export function compareBasket(selections: Selection[], records: Observation[], selected: StoreId[], opts: Options) {
  const quotes = [...new Set(selected)].map(store => quoteBasket(selections, records, store, opts));
  const complete = quotes.filter(q => q.total !== null).sort((a, b) => a.total! - b.total! || a.store.localeCompare(b.store));
  // No winner for a single quote, an empty basket, or a fully pantry-covered basket.
  const ranked = complete.length >= 2 && complete.some(q => q.required > 0);
  const lowest = ranked ? complete[0].total : null;
  const winners = lowest === null ? [] : complete.filter(q => q.total === lowest).map(q => q.store);
  return { quotes, complete, lowest, winners };
}
export function bestSplit(quotes: Quote[]) {
  let best: { total: number; assignments: { product: ProductId; store: StoreId; cost: number }[]; stores: StoreId[] } | null = null;
  for (let i = 0; i < quotes.length; i++) for (let j = i + 1; j < quotes.length; j++) {
    const a = quotes[i], b = quotes[j];
    if (a.lines.length !== b.lines.length || !a.lines.length) continue;
    const assignments: { product: ProductId; store: StoreId; cost: number }[] = [];
    let incomplete = false;
    for (const line of a.lines) {
      if (!line.required) continue;
      const other = b.lines.find(l => l.selection.product === line.selection.product);
      if (!other) { incomplete = true; break; }
      if (line.cost === null && other.cost === null) { incomplete = true; break; }
      const chooseA = line.cost !== null && (other.cost === null || line.cost <= other.cost);
      assignments.push({ product: line.selection.product, store: chooseA ? a.store : b.store, cost: (chooseA ? line.cost : other.cost)! });
    }
    const used = [...new Set(assignments.map(x => x.store))];
    if (incomplete || used.length !== 2) continue;
    const total = assignments.reduce((n, l) => n + l.cost, 0) + a.extra + b.extra;
    if (!best || total < best.total) best = { total, assignments, stores: used };
  }
  const singleTotals = quotes.flatMap(q => q.total === null ? [] : [q.total]);
  const bestSingle = singleTotals.length ? Math.min(...singleTotals) : null;
  return best && (bestSingle === null || best.total < bestSingle) ? { ...best, difference: bestSingle === null ? null : bestSingle - best.total } : null;
}
