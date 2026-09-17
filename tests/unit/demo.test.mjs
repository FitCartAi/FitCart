import test from 'node:test';
import assert from 'node:assert/strict';
import { makeDemoSchedule, consolidateDemo, swapDemoLunch, money } from '../../src/lib/demo-plan.ts';
test('fixture has seven days and twenty-one meals', () => { const days = makeDemoSchedule(); assert.equal(days.length, 7); assert.equal(days.flatMap(d => Object.values(d)).length, 21); });
test('ingredients consolidate into unique IDs', () => { const items = consolidateDemo(makeDemoSchedule()); assert.equal(new Set(items.map(i => i.id)).size, items.length); assert.equal(items.find(i => i.id === 'chicken').quantity, 960); });
test('package rounding charges for whole packages', () => { const chicken = consolidateDemo(makeDemoSchedule()).find(i => i.id === 'chicken'); assert.equal(chicken.packs, 3); assert.equal(chicken.costCents, 1797); assert.equal(chicken.leftover, 402); });
test('all package quantities cover planned use and totals are cents', () => { for (const i of consolidateDemo(makeDemoSchedule())) { assert.ok(i.packs * i.packSize >= i.quantity); assert.ok(i.leftover >= 0); assert.ok(Number.isInteger(i.costCents)); } });
test('lunch swap preserves other days and changes quantities', () => {
  const days = makeDemoSchedule(); const swapped = swapDemoLunch(days, 0);
  assert.equal(days[0].lunch, 'chicken'); assert.equal(swapped[0].lunch, 'beans');
  assert.equal(swapped[0].breakfast, days[0].breakfast); assert.equal(swapped[0].dinner, days[0].dinner); assert.deepEqual(swapped.slice(1), days.slice(1));
  assert.equal(consolidateDemo(swapped).find(i => i.id === 'chicken').quantity, 800);
});
test('swap twice restores original fixture', () => { const days = makeDemoSchedule(); assert.deepEqual(swapDemoLunch(swapDemoLunch(days, 0), 0), days); });
test('unknown recipes and invalid day indices fail explicitly', () => { assert.throws(() => consolidateDemo([{ breakfast: 'bogus', lunch: 'beans', dinner: 'turkey' }])); assert.throws(() => swapDemoLunch(makeDemoSchedule(), -1)); });
test('currency formatter uses exact cents', () => assert.equal(money(8547), '$85.47'));
