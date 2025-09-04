import { test, expect } from '@playwright/test';

test('should allow a new user to sign up and be redirected to the dashboard', async ({ page }) => {
  // Start from the signup page.
  await page.goto('/auth/signup');

  // Use a unique email for each test run to avoid conflicts.
  const uniqueEmail = `testuser_${Date.now()}@example.com`;

  // Fill out the form.
  await page.getByLabel('Full Name').fill('Test User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');

  // Agree to the terms.
  await page.getByLabel(/Agree to our terms and conditions/i).check();

  // Click the create account button.
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Wait for 1 second to allow for redirection
await page.waitForTimeout(10000);

  // The new URL should be the dashboard.
  await expect(page).toHaveURL('/dashboard');

  // The dashboard should have a welcome heading for the user.
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
