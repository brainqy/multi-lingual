import { test, expect } from '@playwright/test';

test('landing page has expected h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Unlock Your Career Potential with AI' })).toBeVisible();
});
