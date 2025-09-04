import { test, expect } from '@playwright/test';

test('should navigate to the signup page from the landing page', async ({ page }) => {
  // Start from the home page (landing page).
  await page.goto('/');

  // Find the main call-to-action link and click it.
  await page.getByRole('link', { name: 'Get Started Free' }).click();

  // The new URL should be /auth/signup.
  await expect(page).toHaveURL('/auth/signup');

  // The new page should have a heading related to joining.
  await expect(page.getByRole('heading', { name: 'Join Bhasha Setu' })).toBeVisible();
});
