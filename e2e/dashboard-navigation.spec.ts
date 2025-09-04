import { test, expect } from '@playwright/test';

test('should allow a logged-in user to navigate to the job tracker', async ({ page }) => {
  // Step 1: Sign up a new user to ensure we have an authenticated session.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_nav_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Nav Test User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Wait for the redirect to the dashboard after signup.
  // We give this a longer timeout as creating a user and logging in can take time.
  await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Step 3: Directly navigate to the job tracker page.
  // This is more robust than trying to find and click a link, especially if modals appear.
  await page.goto('/job-tracker');

  // Step 4: Verify the navigation was successful.
  await expect(page).toHaveURL('/job-tracker');
  await expect(page.getByRole('heading', { name: /Job Application Tracker/i })).toBeVisible();
});
