import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Basic smoke test to ensure the page loads and has some title
  await expect(page).toHaveTitle(/Oumra/i);
});
