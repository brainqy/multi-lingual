import { test, expect } from '@playwright/test';

test('should allow a user to edit and save their profile', async ({ page }) => {
  // Step 1: Sign up a new user.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_profile_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Profile Test User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Navigate to the profile page.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: /My Profile/i })).toBeVisible();

  // Step 3: Enable editing.
  await page.getByRole('button', { name: /Edit Profile/i, exact: true }).click();

  // Step 4: Fill in a new bio with a unique value.
  const newBio = `This is my updated bio from a Playwright test at ${new Date().toISOString()}`;
  const bioTextarea = page.getByLabel(/Short Bio/i);
  
  // Verify the bio is not visible before editing, then fill and check again.
  await expect(page.getByText(newBio)).not.toBeVisible();
  await bioTextarea.fill(newBio);

  // Step 5: Save the changes.
  await page.getByRole('button', { name: /Save Changes/i }).click();

  // Step 6: Verify the new bio is visible on the page.
  // We give it a moment as the save operation might have a slight delay.
  await expect(page.getByText(newBio)).toBeVisible({ timeout: 10000 });
  
  // Step 7: Verify the form is no longer in edit mode.
  await expect(page.getByRole('button', { name: /Save Changes/i })).not.toBeVisible();
  await expect(page.getByRole('button', { name: /Edit Profile/i })).toBeVisible();
});
