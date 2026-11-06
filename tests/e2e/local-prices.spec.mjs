import { test, expect } from '@playwright/test';
async function start(page) {
  await page.goto('/compare');
  await expect(page.getByRole('heading', { name: 'Compare prices you can trace.' })).toBeVisible();
}
async function riceOnly(page) {
  await page.getByRole('checkbox', { name: 'Plain rolled oats', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Whole dairy milk', exact: true }).uncheck();
}
async function price(page, store, pack, cost, loyalty = false) {
  const f = page.getByRole('form', { name: 'Record a local price' });
  await f.getByLabel('Retailer branch').selectOption(store);
  await f.getByLabel('Exact product and brand').fill('TEST ONLY rice');
  await f.getByLabel('Amount in one package').fill(pack);
  await f.getByLabel('Whole package price (USD)').fill(cost);
  await f.getByLabel('Requires a loyalty membership').setChecked(loyalty);
  await f.getByRole('checkbox', { name: /I checked the listed branch/ }).check();
  await f.getByRole('button', { name: 'Save price observation' }).click();
  await expect(page.locator('.local-prices').getByRole('status')).toContainText('price saved');
}
async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}
test('research starts empty with no fabricated winner', async ({ page }) => {
  await start(page);
  await expect(page.getByText('No automatic retailer price feed is connected.', { exact: true })).toBeVisible();
  await expect(page.getByTestId('price-no-winner')).toBeVisible();
  await expect(page.getByTestId('quote-aldi')).toContainText('Incomplete');
  await noOverflow(page);
});
test('empty record is rejected without inventing zero prices', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Save price observation' }).click();
  await expect(page.locator('.local-prices').getByRole('alert')).toContainText('valid package price');
  await expect(page.getByTestId('quote-aldi')).toContainText('Incomplete');
});
test('package size controls the winner and charges can reverse it', async ({ page }) => {
  await start(page); await riceOnly(page);
  await price(page, 'aldi', '1', '2.40');
  await expect(page.getByTestId('price-no-winner')).toBeVisible();
  await price(page, 'walmart', '2', '3.10');
  await expect(page.getByTestId('price-winner')).toContainText('Walmart - $3.10');
  await expect(page.getByTestId('quote-publix')).toContainText('Incomplete');
  await page.getByLabel('Extra costs for Walmart (USD)').fill('2.00');
  await expect(page.getByTestId('price-winner')).toContainText('ALDI - $4.80');
  await noOverflow(page);
});
test('switching shopping method excludes unrelated shelf prices', async ({ page }) => {
  await start(page); await riceOnly(page); await price(page, 'aldi', '1', '2.40');
  await page.getByLabel('Shopping method', { exact: true }).selectOption('pickup');
  await expect(page.getByTestId('quote-aldi')).toContainText('Incomplete');
});
test('loyalty prices are excluded until eligibility is explicitly selected', async ({ page }) => {
  await start(page); await riceOnly(page); await price(page, 'aldi', '1', '2.40', true);
  await expect(page.getByTestId('quote-aldi')).toContainText('Incomplete');
  const store = page.locator('.lp-store').filter({ has: page.getByRole('checkbox', { name: 'ALDI', exact: true }) });
  await store.getByRole('checkbox', { name: 'I qualify for recorded member prices' }).check();
  await expect(page.getByTestId('quote-aldi')).toContainText('$4.80');
});
test('notes are memory-only by default and optional tab persistence clears', async ({ page }) => {
  await start(page); await price(page, 'aldi', '1', '2.40');
  await page.reload();
  await expect(page.getByText(/0 notes in this tab/)).toBeVisible();
  await price(page, 'aldi', '1', '2.40');
  await page.getByRole('checkbox', { name: 'Remember price notes in this browser tab' }).check();
  await page.reload(); await expect(page.getByText(/1 notes in this tab/)).toBeVisible();
  await page.getByRole('button', { name: 'Clear all price notes' }).click();
  await page.getByRole('button', { name: 'Confirm clear' }).click();
  expect(await page.evaluate(() => sessionStorage.getItem('fitcart.local-prices.v1'))).toBeNull();
  await expect(page.getByText(/0 notes in this tab/)).toBeVisible();
});
test('malformed import does not destroy existing records', async ({ page }) => {
  await start(page); await price(page, 'aldi', '1', '2.40');
  await page.getByLabel('Import FitCart price notes').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"version":9}') });
  await expect(page.locator('.local-prices').getByRole('alert')).toContainText('FitCart price export');
  await expect(page.getByText(/1 notes in this tab/)).toBeVisible();
});
test('pantry coverage removes need to shop and never crowns a store', async ({ page }) => {
  await start(page); await riceOnly(page);
  await page.getByLabel('Already have: Dry long-grain white rice').fill('3');
  await expect(page.getByTestId('price-no-winner')).toContainText('No shopping trip is needed');
  await expect(page.getByTestId('price-winner')).toHaveCount(0);
});
