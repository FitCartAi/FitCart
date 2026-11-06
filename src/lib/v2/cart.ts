import type { CartSettings, Store } from './profile';
/** ALL prices, products and deals in this module are invented for interface testing. */
export const provenance = { kind: 'synthetic', source: 'FitCart V2A fixture', version: 'fixture-1', checkedAt: null, storeLocationId: null, channel: 'example only' } as const;
export type Item = { id: string; name: string; unit: string; pack: number; quantity: number; category: string; prices: Partial<Record<Store, number>> };
const prices = (walmart: number, publix: number, food_lion: number, aldi: number) => ({ walmart, publix, food_lion, aldi });
const base: Item[] = [
  { id: 'oats', name: 'Rolled oats', unit: 'g', pack: 500, quantity: 420, category: 'Pantry', prices: prices(299, 329, 279, 289) },
  { id: 'rice', name: 'Dry rice', unit: 'g', pack: 1000, quantity: 700, category: 'Pantry', prices: prices(249, 319, 289, 239) },
  { id: 'oil', name: 'Olive oil', unit: 'ml', pack: 500, quantity: 140, category: 'Pantry', prices: prices(499, 629, 549, 529) },
  { id: 'beans', name: 'Canned beans (drained)', unit: 'g', pack: 250, quantity: 750, category: 'Pantry', prices: prices(99, 119, 109, 95) },
  { id: 'yogurt', name: 'Plain yogurt', unit: 'g', pack: 900, quantity: 1050, category: 'Dairy', prices: prices(479, 549, 459, 499) },
  { id: 'vegetables', name: 'Fresh vegetables', unit: 'g', pack: 500, quantity: 1500, category: 'Produce', prices: prices(329, 399, 349, 319) },
  { id: 'fruit', name: 'Bananas', unit: 'each', pack: 1, quantity: 7, category: 'Produce', prices: prices(29, 35, 25, 30) },
  { id: 'tortillas', name: 'Tortillas', unit: 'each', pack: 8, quantity: 14, category: 'Pantry', prices: prices(229, 259, 199, 219) },
  { id: 'protein', name: 'Chicken breast', unit: 'g', pack: 500, quantity: 1500, category: 'Protein', prices: prices(649, 729, 619, 659) },
];
export const swaps = [
  { id: 'yogurt', title: 'Try a store-brand yogurt', detail: 'Same example pack size; fictional lower price.', modes: ['convenience', 'balanced', 'maximum'] },
  { id: 'vegetables', title: 'Switch to frozen vegetables', detail: 'Changes storage and preparation needs. Review before accepting.', modes: ['balanced', 'maximum'] },
  { id: 'protein', title: 'Try a bean-based protein option', detail: 'Illustrates a meal change, not a nutritionally equivalent substitution.', modes: ['maximum'] },
];
const alternatives: Record<string, Pick<Item, 'name' | 'pack' | 'prices'>> = {
  yogurt: { name: 'Store-brand plain yogurt', pack: 900, prices: prices(349, 399, 359, 369) },
  vegetables: { name: 'Frozen vegetables', pack: 500, prices: prices(199, 249, 189, 209) },
  protein: { name: 'Extra canned beans (protein swap)', pack: 250, prices: prices(99, 119, 109, 95) },
};
export type Line = Item & { pantryUsed: number; needed: number; packs: number };
export function basket(settings: CartSettings, accepted: string[] = []): Line[] {
  const scale = settings.days / 7 * settings.people * settings.meals / 3;
  if (!Number.isFinite(scale) || scale <= 0) throw new Error('Invalid basket size');
  const lines = base.map(original => {
    const item = accepted.includes(original.id) ? { ...original, ...alternatives[original.id] } : { ...original };
    const quantity = Math.ceil(original.quantity * scale);
    const stock = settings.pantry[original.id as keyof typeof settings.pantry] ?? 0;
    const pantryUsed = Math.min(quantity, Math.max(0, stock));
    const needed = quantity - pantryUsed;
    return { ...item, prices: { ...item.prices }, quantity, pantryUsed, needed, packs: Math.ceil(needed / item.pack) };
  });
  // The meal swap uses the same example canned-bean product: round once after combining.
  if (accepted.includes('protein')) {
    const bean = lines.find(i => i.id === 'beans')!;
    const protein = lines.find(i => i.id === 'protein')!;
    bean.quantity += protein.quantity;
    bean.needed += protein.needed;
    bean.packs = Math.ceil(bean.needed / bean.pack);
    return lines.filter(i => i.id !== 'protein');
  }
  return lines;
}
export type Quote = { store: Store; total: number | null; missing: string[] };
export function quote(lines: Line[], store: Store): Quote {
  let total = 0;
  const missing: string[] = [];
  for (const item of lines) {
    if (!item.packs) continue;
    const price = item.prices[store];
    if (price === undefined || !Number.isInteger(price) || price < 0) missing.push(item.id);
    else total += price * item.packs;
  }
  return { store, total: missing.length ? null : total, missing };
}
export function compare(lines: Line[], selected: Store[]): Quote[] {
  return [...new Set(selected)].map(s => quote(lines, s)).sort((a, b) => (a.total ?? Infinity) - (b.total ?? Infinity) || a.store.localeCompare(b.store));
}
export type Split = { stores: Store[]; total: number; assignments: Record<string, Store> };
/** Exact comparison over pairs; each product's whole packages come from one store. */
export function bestPair(lines: Line[], selected: Store[]): Split | null {
  const options = [...new Set(selected)];
  let best: Split | null = null;
  for (let i = 0; i < options.length; i++) for (let j = i + 1; j < options.length; j++) {
    const pair = [options[i], options[j]];
    let total = 0;
    const assignments: Record<string, Store> = {};
    let complete = true;
    for (const item of lines) {
      if (!item.packs) continue;
      const valid = pair.filter(s => item.prices[s] !== undefined && Number.isInteger(item.prices[s]) && item.prices[s]! >= 0);
      valid.sort((a, b) => item.prices[a]! - item.prices[b]! || a.localeCompare(b));
      if (!valid.length) { complete = false; break; }
      assignments[item.id] = valid[0];
      total += item.packs * item.prices[valid[0]]!;
    }
    if (complete && (!best || total < best.total)) best = { stores: [...new Set(Object.values(assignments))], total, assignments };
  }
  return best;
}
export function budgetStatus(total: number | null, budget: number | null, style: string) {
  if (total === null) return { state: 'unknown', text: 'Incomplete pricing; budget cannot be checked.', difference: null };
  if (budget === null) return { state: 'no-limit', text: 'Lowest-cost comparison; no spending limit entered.', difference: null };
  const difference = budget - total;
  if (difference < 0) return { state: (style === 'hard' || style === 'lowest') ? 'blocked' : 'over', text: (style === 'hard' || style === 'lowest') ? 'No budget-fitting cart selected. Try a swap or revise your inputs.' : 'Above your target. Review the trade-offs before shopping.', difference };
  return { state: 'within', text: difference === 0 ? 'At your example budget.' : 'Below your example budget.', difference };
}
export function money(cents: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100); }
