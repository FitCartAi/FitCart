import test from 'node:test';
import assert from 'node:assert/strict';
import { initialDraft, sampleDraft, validateDraft, validateStep, updateAppliance, sanitizeDraft, readStoredDraft, cartSettings } from '../../src/lib/v2/profile.ts';
import { basket, compare, quote, bestPair, budgetStatus, money, provenance } from '../../src/lib/v2/cart.ts';
const settings = () => cartSettings(sampleDraft());
test('budget is required but fitness and body fields are not', () => {
  assert.ok(validateStep(initialDraft(), 0).budget);
  assert.deepEqual(validateDraft(sampleDraft()), {});
  for (const field of ['age', 'sex', 'weightKg', 'heightCm', 'activity']) assert.equal(validateDraft(initialDraft())[field], undefined);
});
test('lowest-cost mode accepts no cap; hard and target require it', () => {
  assert.deepEqual(validateDraft({ ...sampleDraft(), budgetStyle: 'lowest', budget: '' }), {});
  for (const budgetStyle of ['hard', 'target']) assert.ok(validateDraft({ ...sampleDraft(), budgetStyle, budget: '' }).budget);
});
test('budgets are bounded decimals converted to exact cents without proration', () => {
  assert.equal(cartSettings({ ...sampleDraft(), budget: '75.47', days: '3' }).budgetCents, 7547);
  for (const budget of ['-1', '0', 'NaN', '1e3', '75.999', '5001']) assert.ok(validateDraft({ ...sampleDraft(), budget }).budget);
});
test('unknown choices, counts and stores are rejected', () => {
  for (const key of ['budgetStyle', 'savingsMode', 'trip', 'goal', 'diet']) assert.ok(validateDraft({ ...sampleDraft(), [key]: 'bad' })[key]);
  for (const key of ['days', 'people', 'meals']) assert.ok(validateDraft({ ...sampleDraft(), [key]: '0' })[key]);
  assert.ok(validateDraft({ ...sampleDraft(), stores: [] }).stores);
  assert.ok(validateDraft({ ...sampleDraft(), stores: ['bogus'] }).stores);
});
test('step validation does not block progress for later fields', () => {
  assert.equal(validateStep(initialDraft(), 0).stores, undefined);
  assert.ok(validateStep(initialDraft(), 1).stores);
});
test('allergy yes requires detail and no drops stale allergens', () => {
  assert.ok(validateDraft({ ...sampleDraft(), allergyStatus: 'yes' }).allergens);
  assert.deepEqual(validateDraft({ ...sampleDraft(), allergyStatus: 'yes', otherAllergies: 'kiwi' }), {});
  assert.deepEqual(sanitizeDraft({ ...sampleDraft(), allergens: ['Milk'] }).allergens, []);
});
test('pantry bounds and free-text bounds are enforced', () => {
  assert.ok(validateDraft({ ...sampleDraft(), pantryRice: '-10' }).pantryRice);
  assert.ok(validateDraft({ ...sampleDraft(), pantryOats: 'NaN' }).pantryOats);
  assert.ok(validateDraft({ ...sampleDraft(), pantryNotes: 'a'.repeat(301) }).pantryNotes);
});
test('removing an available appliance removes its preference', () => {
  const d = updateAppliance(sampleDraft(), 'microwave', false);
  assert.equal(d.preferred.includes('microwave'), false);
});
test('preferred appliances must be an available subset of at most three', () => {
  assert.ok(validateDraft({ ...sampleDraft(), preferred: ['grill'] }).preferred);
  assert.ok(validateDraft({ ...sampleDraft(), appliances: ['oven', 'grill', 'blender', 'microwave'], preferred: ['oven', 'grill', 'blender', 'microwave'] }).preferred);
});
test('no-cook requires no appliance or preference', () => {
  assert.deepEqual(validateDraft({ ...sampleDraft(), noCook: true, appliances: [], preferred: [] }), {});
  assert.ok(validateDraft({ ...sampleDraft(), noCook: true }).appliances);
  assert.ok(validateDraft({ ...sampleDraft(), appliances: [], preferred: [] }).appliances);
});
test('opt-out clears all sensitive optional fields', () => {
  const d = sanitizeDraft({ ...sampleDraft(), age: '21', weightKg: '70', heightCm: '180', sex: 'male', activity: 'high' });
  for (const k of ['age', 'weightKg', 'heightCm', 'sex', 'activity']) assert.equal(d[k], '');
});
test('opt-in details are optional but values must be valid', () => {
  assert.deepEqual(validateDraft({ ...sampleDraft(), nutritionOptIn: true }), {});
  assert.ok(validateDraft({ ...sampleDraft(), nutritionOptIn: true, age: '16' }).age);
});
test('malformed and legacy storage never crashes or auto-migrates health data', () => {
  for (const raw of [null, '{', 'null', '{}', 'x'.repeat(20001), JSON.stringify({ version: 1, draft: sampleDraft(), completed: true })]) assert.equal(readStoredDraft(raw), null);
});
test('untrusted storage checks field types and completion', () => {
  const store = (draft, completed = true) => JSON.stringify({ version: 2, draft, completed });
  assert.equal(readStoredDraft(store({ ...sampleDraft(), stores: 'walmart' })), null);
  assert.equal(readStoredDraft(store({ ...sampleDraft(), noCook: 'true' })), null);
  assert.equal(readStoredDraft(store(sampleDraft())).completed, true);
  assert.equal(readStoredDraft(store(initialDraft())).completed, false);
});
test('cart settings do not include optional health fields', () => {
  assert.equal('age' in settings(), false);
  assert.throws(() => cartSettings(initialDraft()));
});
test('every displayed store quote is entirely synthetic', () => {
  assert.equal(provenance.kind, 'synthetic');
  assert.equal(provenance.checkedAt, null);
  assert.equal(provenance.storeLocationId, null);
});
test('whole package cost is consistent and all totals are integer cents', () => {
  const lines = basket(settings());
  const yogurt = lines.find(i => i.id === 'yogurt');
  assert.equal(yogurt.quantity, 1050); assert.equal(yogurt.packs, 2);
  const w = quote(lines, 'walmart');
  assert.equal(w.total, lines.reduce((n, i) => n + i.packs * i.prices.walmart, 0));
  assert.ok(Number.isInteger(w.total));
});
test('pantry reduces required quantities before package rounding', () => {
  const s = settings();
  const lines = basket({ ...s, pantry: { ...s.pantry, oats: 500, rice: 5000 } });
  assert.equal(lines.find(i => i.id === 'oats').packs, 0);
  assert.equal(lines.find(i => i.id === 'rice').needed, 0);
  assert.ok(quote(lines, 'walmart').total < quote(basket(s), 'walmart').total);
});
test('free-text pantry items never silently reduce cost', () => {
  assert.deepEqual(basket(cartSettings({ ...sampleDraft(), pantryNotes: 'everything' })), basket(settings()));
});
test('household, days and meals affect basket quantities', () => {
  const s = settings(); const baseline = basket(s);
  const doubled = basket({ ...s, people: 2 });
  assert.equal(doubled[0].quantity, 2 * baseline[0].quantity);
  assert.ok(basket({ ...s, days: 3 })[0].quantity < baseline[0].quantity);
  assert.ok(basket({ ...s, meals: 4 })[0].quantity > baseline[0].quantity);
});
test('same basket is compared and ties do not manufacture savings', () => {
  const lines = basket(settings());
  for (const i of lines) i.prices = { walmart: 100, aldi: 100 };
  const all = compare(lines, ['walmart', 'aldi']);
  assert.equal(all[0].total, all[1].total);
  assert.equal(bestPair(lines, ['walmart', 'aldi']).total, all[0].total);
});
test('missing prices are incomplete, never zero or a false winner', () => {
  const lines = basket(settings()); delete lines[0].prices.walmart;
  assert.equal(quote(lines, 'walmart').total, null);
  assert.equal(compare(lines, ['walmart', 'aldi'])[0].store, 'aldi');
});
test('pairs respect selected stores and do not exceed best single total', () => {
  const lines = basket(settings()); const result = bestPair(lines, ['walmart', 'food_lion']);
  assert.ok(result.total <= compare(lines, ['walmart', 'food_lion'])[0].total);
  assert.ok(Object.values(result.assignments).every(s => ['walmart', 'food_lion'].includes(s)));
  assert.equal(bestPair(lines, ['walmart']), null);
});
test('pair total equals its item assignments', () => {
  const lines = basket(settings()); const result = bestPair(lines, settings().stores);
  assert.equal(result.total, lines.reduce((n, i) => n + i.packs * i.prices[result.assignments[i.id]], 0));
});
test('incomplete pair cannot be shown as complete', () => {
  const lines = basket(settings()); lines[0].prices = {};
  assert.equal(bestPair(lines, settings().stores), null);
});
test('swaps recalculate whole packs and consolidate identical bean products', () => {
  const s = settings(); const cheaper = basket(s, ['yogurt', 'vegetables', 'protein']);
  assert.ok(quote(cheaper, 'walmart').total < quote(basket(s), 'walmart').total);
  assert.equal(cheaper.some(i => i.id === 'protein'), false);
  assert.equal(cheaper.find(i => i.id === 'beans').quantity, 2250);
});
test('hard limits never report an overage as success', () => {
  assert.equal(budgetStatus(8000, 7500, 'hard').state, 'blocked');
  assert.equal(budgetStatus(8000, 7500, 'target').state, 'over');
  assert.equal(budgetStatus(8000, null, 'lowest').state, 'no-limit');
  assert.equal(budgetStatus(null, 7500, 'hard').state, 'unknown');
  assert.equal(budgetStatus(7500, 7500, 'hard').difference, 0);
});
test('money formatting does not round away cents', () => assert.equal(money(7547), '$75.47'));
