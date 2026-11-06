import { test, expect } from '@playwright/test';
async function start(page) {
  await page.goto('/budget');
  await page.getByRole('button', { name: 'Use sample answers', exact: true }).click();
}
async function next(page) { await page.getByRole('button', { name: 'Continue', exact: true }).click(); }
async function finish(page) {
  await page.getByRole('checkbox', { name: /I understand prices and savings are fictional/ }).check();
  await page.getByRole('button', { name: 'Compare sample cart', exact: true }).click();
  await expect(page.getByTestId('cart-total')).toBeVisible();
}
async function fullSample(page) { await start(page); for (let i = 0; i < 5; i++) await next(page); await finish(page); }

test('budget validation blocks an empty amount and focuses the field', async ({ page }) => {
  await page.goto('/budget'); await next(page);
  await expect(page.getByRole('alert', { name: 'Budget questionnaire errors' })).toBeVisible();
  await expect(page.getByLabel('Grocery budget (USD)', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Grocery budget (USD)', { exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Budget', exact: true })).toBeVisible();
});
test('lowest cost permits a blank cap and stores remain required', async ({ page }) => {
  await page.goto('/budget');
  await page.getByRole('radio', { name: /^Lowest cost/ }).check(); await next(page);
  await expect(page.getByRole('heading', { name: 'Stores', exact: true })).toBeVisible(); await next(page);
  await expect(page.getByText('Select at least one of the four stores.', { exact: true })).toBeVisible();
});
test('new flow completes without measurements and edits preserve answers', async ({ page }) => {
  await fullSample(page);
  await expect(page.getByTestId('synthetic-notice')).toContainText('Not live pricing.');
  await page.getByRole('link', { name: 'Edit my setup', exact: true }).click();
  await expect(page.getByLabel('Grocery budget (USD)', { exact: true })).toHaveValue('75');
});
test('preferred appliances are a capped available subset and prune on removal', async ({ page }) => {
  await start(page); for (let i = 0; i < 3; i++) await next(page);
  const available = page.getByRole('group', { name: 'Appliances you have access to', exact: true });
  await available.getByRole('checkbox', { name: 'Oven', exact: true }).check();
  await page.getByLabel('Prefer Stovetop', { exact: true }).check();
  await page.getByLabel('Prefer Air fryer', { exact: true }).check();
  await expect(page.getByLabel('Prefer Oven', { exact: true })).toBeDisabled();
  await available.getByRole('checkbox', { name: 'Microwave', exact: true }).uncheck();
  await expect(page.getByLabel('Prefer Microwave', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Prefer Oven', { exact: true })).toBeEnabled();
  await page.getByLabel('Minimal / no-cook setup only', { exact: true }).check();
  await expect(available.getByRole('checkbox', { name: 'Oven', exact: true })).not.toBeChecked();
  await next(page); await page.getByRole('button', { name: 'Skip fitness details', exact: true }).click();
  await finish(page);
  await expect(page.getByRole('heading', { name: 'Microwave bean wraps', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Overnight oats with yogurt and banana', exact: true })).toBeVisible();
});
test('optional health data clears when opt-in is removed', async ({ page }) => {
  await start(page); for (let i = 0; i < 4; i++) await next(page);
  await page.getByLabel('Add optional nutrition details', { exact: true }).check();
  await page.getByLabel('Age (optional, adults 18+)', { exact: true }).fill('21');
  await page.getByLabel('Add optional nutrition details', { exact: true }).uncheck();
  await page.getByLabel('Add optional nutrition details', { exact: true }).check();
  await expect(page.getByLabel('Age (optional, adults 18+)', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Skip fitness details', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review', exact: true })).toBeVisible();
});
test('reported allergies require detail without implying a safe sample', async ({ page }) => {
  await start(page); await next(page); await next(page);
  await page.getByLabel('Any food allergies?', { exact: true }).selectOption('yes'); await next(page);
  await expect(page.getByText('Select an allergy or enter it under Other allergies.', { exact: true })).toBeVisible();
  await page.getByLabel('Milk', { exact: true }).check();
  for (let i = 0; i < 3; i++) await next(page);
  await expect(page.locator('dd').filter({ hasText: /^Milk$/ })).toBeVisible();
  await finish(page); await expect(page.getByTestId('synthetic-notice')).toContainText('do not filter it');
});
test('hard cap overage remains visible and blocks final list copying', async ({ page }) => {
  await start(page); await page.getByLabel('Grocery budget (USD)', { exact: true }).fill('1');
  for (let i = 0; i < 5; i++) await next(page); await finish(page);
  await expect(page.getByTestId('budget-status')).toContainText('No budget-fitting cart selected');
  await expect(page.getByRole('button', { name: 'Copy example list', exact: true })).toBeDisabled();
});
test('single-store preference does not suggest an extra stop', async ({ page }) => {
  await start(page); await next(page); await page.getByRole('radio', { name: /^One store only/ }).check();
  for (let i = 0; i < 4; i++) await next(page); await finish(page);
  await expect(page.getByRole('heading', { name: 'Would another stop be worth it?', exact: true })).toHaveCount(0);
});
test('two-store comparison is opt-in and swaps recalculate rather than stack savings', async ({ page }) => {
  await page.goto('/sample');
  const single = await page.getByTestId('cart-total').innerText();
  await page.getByRole('button', { name: 'Use this two-store example', exact: true }).click();
  await expect(page.getByTestId('cart-total')).not.toHaveText(single);
  await page.getByRole('button', { name: 'Use lowest single-store total', exact: true }).click();
  await expect(page.getByTestId('cart-total')).toHaveText(single);
  await page.getByRole('button', { name: 'Accept try a store-brand yogurt', exact: true }).click();
  await expect(page.getByTestId('cart-total')).not.toHaveText(single);
  await page.getByRole('button', { name: 'Undo try a store-brand yogurt', exact: true }).click();
  await expect(page.getByTestId('cart-total')).toHaveText(single);
});
test('tab opt-in survives reload and reset deletes V2 data', async ({ page }) => {
  await start(page);
  await page.getByLabel('Remember V2 answers in this browser tab', { exact: true }).check();
  for (let i = 0; i < 5; i++) await next(page); await finish(page); await page.reload();
  await expect(page.getByTestId('cart-total')).toBeVisible();
  await page.getByRole('link', { name: 'Edit my setup', exact: true }).click();
  await page.getByRole('button', { name: 'Clear V2 answers', exact: true }).click();
  await expect(page.getByLabel('Grocery budget (USD)', { exact: true })).toHaveValue('');
  expect(await page.evaluate(() => sessionStorage.getItem('fitcart.budget.v2'))).toBeNull();
});
test('without tab opt-in, refresh does not retain personal setup', async ({ page }) => {
  await fullSample(page); await page.reload();
  await expect(page.getByRole('heading', { name: 'Start with your budget.', exact: true })).toBeVisible();
});
test('pantry deductions and savings mode are reflected in the preview', async ({ page }) => {
  await start(page); await page.getByRole('radio', { name: /^Convenience first/ }).check();
  await next(page); await next(page);
  await page.getByLabel('Oats already at home (grams)', { exact: true }).fill('1000');
  for (let i = 0; i < 3; i++) await next(page); await finish(page);
  await expect(page.getByText(/Covered by measured pantry stock: Rolled oats/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept switch to frozen vegetables', exact: true })).toHaveCount(0);
});
test('budget pages do not overflow on the configured screen', async ({ page }, testInfo) => {
  for (const route of ['/', '/budget', '/sample']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  }
  await testInfo.attach('sample-cart', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
