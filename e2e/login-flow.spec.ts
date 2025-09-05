import { test, expect } from '@playwright/test';

test('should allow an existing user to log in and be redirected to the dashboard', async ({ page }) => {
  // Step 1: Create a user to ensure we have a valid account to log in with.
  // This makes the test self-contained and reliable.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_login_${Date.now()}@example.com`;
  const password = 'password123';
  await page.getByLabel('Full Name').fill('Login Test User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill(password);
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Wait for the initial signup and redirection to the dashboard to complete.
  await expect(page).toHaveURL('/dashboard', { timeout: 15000 });

  // Step 2: For this test, we can assume the session is cleared or simulate a logout
  // by navigating away and back to the login page.
  await page.goto('/auth/login');
  await expect(page).toHaveURL('/auth/login');
  
  // Step 3: Log in with the newly created user credentials.
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /Login/i }).click();

  // Step 4: Verify redirection to the dashboard after successful login.
  // We use a longer timeout to account for authentication and page load time.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
