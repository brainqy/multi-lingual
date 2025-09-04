import { test, expect } from '@playwright/test';

test('should allow a logged-in user to navigate to the job tracker', async ({ page }) => {
  // Start by signing up a new user to ensure we have an authenticated session.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_nav_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Nav Test User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  await page.waitForTimeout(7000);
  // Wait for the redirect to the dashboard.
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // The Daily Streak popup will appear on the first login. We need to dismiss it.
  // Wait for the popup to be visible by looking for its unique title.
 await page.waitForTimeout(15000);
  // Find the "Job Tracker" link in the sidebar and click it.
 await page.goto('/job-tracker');
await page.waitForTimeout(7000);
  // The new URL should be /job-tracker.
  await expect(page).toHaveURL('/job-tracker');

  // The new page should have a heading related to the job tracker.
  await expect(page.getByRole('heading', { name: /Job Application Tracker/i })).toBeVisible();
});
