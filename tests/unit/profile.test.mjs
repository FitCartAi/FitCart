import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDraft, sampleDraft, validateDraft, validateStep, normalizeProfile, readStoredDraft, splitFoods } from '../../src/lib/profile.ts';

test('empty questionnaire identifies required fields', () => {
  const errors = validateDraft(emptyDraft());
  for (const key of ['nickname', 'goal', 'age', 'sex', 'activity', 'weight', 'feet', 'inches', 'allergyStatus', 'budget']) assert.ok(errors[key], key);
});
test('sample answers pass all validation', () => assert.deepEqual(validateDraft(sampleDraft()), {}));
test('each step validates only its fields', () => {
  assert.equal(validateStep(emptyDraft(), 0).budget, undefined);
  assert.ok(validateStep(emptyDraft(), 2).budget);
});
test('age gate rejects minors and fractional ages', () => {
  for (const age of ['17', '21.5', '-1', 'Infinity', 'abc', '101']) assert.ok(validateDraft({ ...sampleDraft(), age }).age);
});
test('both metric and imperial units are accepted and normalized', () => {
  const p = normalizeProfile(sampleDraft());
  assert.equal(p.heightCm, 175.26); assert.equal(p.weightKg, 63.5);
  const metric = normalizeProfile({ ...sampleDraft(), heightUnit: 'cm', heightCm: '175.26', weightUnit: 'kg', weight: '63.5' });
  assert.equal(metric.heightCm, p.heightCm); assert.equal(metric.weightKg, p.weightKg);
});
test('negative weights, unsupported units, implausible heights are rejected', () => {
  assert.ok(validateDraft({ ...sampleDraft(), weight: '-1' }).weight);
  assert.ok(validateDraft({ ...sampleDraft(), weightUnit: 'stone' }).weightUnit);
  assert.ok(validateDraft({ ...sampleDraft(), inches: '12' }).inches);
  assert.ok(validateDraft({ ...sampleDraft(), heightUnit: 'cm', heightCm: '20' }).heightCm);
});
test('weekly budget is exact integer cents, never silently prorated', () => {
  assert.equal(normalizeProfile({ ...sampleDraft(), budget: '85.47', days: '3' }).weeklyBudgetCents, 8547);
  for (const budget of ['0', '-1', '85.999', '5e2', 'NaN', '5001']) assert.ok(validateDraft({ ...sampleDraft(), budget }).budget);
});
test('unknown enum values are rejected', () => {
  for (const key of ['goal', 'activity', 'sex', 'diet', 'mealPrep', 'skill', 'minutes']) assert.ok(validateDraft({ ...sampleDraft(), [key]: 'bogus' })[key]);
});
test('allergy response must be explicit', () => assert.ok(validateDraft({ ...sampleDraft(), allergyStatus: '' }).allergyStatus));
test('yes requires listed or other allergies', () => {
  assert.ok(validateDraft({ ...sampleDraft(), allergyStatus: 'yes' }).allergens);
  assert.deepEqual(validateDraft({ ...sampleDraft(), allergyStatus: 'yes', otherAllergies: 'Kiwi' }), {});
});
test('reported allergies are preserved and deduplicated', () => {
  const p = normalizeProfile({ ...sampleDraft(), allergyStatus: 'yes', allergens: ['Milk'], otherAllergies: 'milk, Kiwi' });
  assert.deepEqual(p.allergies, ['milk', 'kiwi']);
});
test('no allergies does not preserve stale hidden answers', () => {
  assert.deepEqual(normalizeProfile({ ...sampleDraft(), allergyStatus: 'no', allergens: ['Milk'] }).allergies, []);
});
test('other diet requires explanation', () => assert.ok(validateDraft({ ...sampleDraft(), diet: 'other' }).restrictions));
test('free text and household counts are bounded', () => {
  assert.ok(validateDraft({ ...sampleDraft(), restrictions: 'x'.repeat(301) }).restrictions);
  for (const key of ['days', 'meals', 'people']) assert.ok(validateDraft({ ...sampleDraft(), [key]: '0' })[key]);
});
test('normalization trims text and preserves absent optional fields as null', () => {
  const p = normalizeProfile({ ...sampleDraft(), nickname: '  Alex  ', store: '', location: '' });
  assert.equal(p.nickname, 'Alex'); assert.equal(p.preferredStore, null); assert.equal(p.location, null);
  assert.deepEqual(splitFoods(' Mushrooms, mushrooms; olives\n'), ['mushrooms', 'olives']);
});
test('invalid profiles cannot be normalized', () => assert.throws(() => normalizeProfile(emptyDraft())));
test('corrupted, oversized and wrong-version browser storage is ignored', () => {
  for (const raw of [null, '{', 'null', '[]', 'x'.repeat(15001), JSON.stringify({ version: 2, draft: sampleDraft(), completed: true })]) assert.equal(readStoredDraft(raw), null);
});
test('only valid completed drafts can restore completion', () => {
  const valid = readStoredDraft(JSON.stringify({ version: 1, draft: sampleDraft(), completed: true }));
  assert.equal(valid.completed, true);
  assert.equal(readStoredDraft(JSON.stringify({ version: 1, draft: emptyDraft(), completed: true })).completed, false);
});
test('wrong field types in storage are ignored', () => {
  assert.equal(readStoredDraft(JSON.stringify({ version: 1, draft: { ...sampleDraft(), nickname: 5 }, completed: false })), null);
  assert.equal(readStoredDraft(JSON.stringify({ version: 1, draft: { ...sampleDraft(), equipment: [4] }, completed: false })), null);
});
