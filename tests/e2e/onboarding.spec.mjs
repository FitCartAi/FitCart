import { test, expect } from '@playwright/test';
async function loadSample(page) {
  await page.goto('/onboarding'); await page.getByRole('button', { name: 'Use sample answers' }).click();
}
async function complete(page) {
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review', exact: true })).toBeVisible();
  await page.getByRole('checkbox', { name: /I understand this is a prototype/ }).check();
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page.getByRole('heading', { name: 'Your preferences are ready.' })).toBeVisible();
}
test('empty questionnaire blocks progression and focuses a field', async ({ page }) => {
  await page.goto('/onboarding'); await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible(); await expect(page.getByLabel('First name or nickname')).toBeFocused();
});
test('sample completes, edit preserves, forget clears', async ({ page }) => {
  await loadSample(page); await complete(page);
  await page.getByRole('link', { name: 'Edit answers', exact: true }).click();
  await expect(page.getByLabel('First name or nickname')).toHaveValue('Alex (sample)');
  await page.getByRole('button', { name: 'Forget my answers' }).click();
  await expect(page.getByLabel('First name or nickname')).toHaveValue('');
});
test('optional storage survives refresh then is removed on reset', async ({ page }) => {
  await loadSample(page); await page.getByRole('checkbox', { name: 'Remember my answers in this browser tab', exact: true }).check();
  await complete(page); await page.reload();
  await expect(page.getByRole('heading', { name: 'Your preferences are ready.' })).toBeVisible();
  await page.getByRole('button', { name: 'Forget my answers' }).click();
  await expect(page.getByLabel('First name or nickname')).toHaveValue('');
  expect(await page.evaluate(() => sessionStorage.getItem('fitcart.onboarding.v1'))).toBeNull();
});
test('without opt-in, refresh loses answers', async ({ page }) => {
  await loadSample(page); await page.reload(); await expect(page.getByLabel('First name or nickname')).toHaveValue('');
});
test('allergies require details and remain in review', async ({ page }) => {
  await loadSample(page); await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('radio', { name: 'Yes', exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Select an allergy or describe it below.')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Peanuts', exact: true }).check();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('dd', { hasText: 'peanuts' })).toBeVisible();
});
test('sample swap recalculates and remains explicitly fictional', async ({ page }) => {
  await page.goto('/demo'); await expect(page.getByText('For layout feedback only.')).toBeVisible();
  const before = await page.getByTestId('demo-total').innerText();
  await page.getByRole('button', { name: 'Swap sample lunch for day 1', exact: true }).click();
  await expect(page.getByTestId('demo-total')).not.toHaveText(before);
  await page.getByRole('button', { name: 'Reset sample', exact: true }).click();
  await expect(page.getByTestId('demo-total')).toHaveText(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
