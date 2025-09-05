import { test, expect } from '@playwright/test';

test('should allow a user to search and filter the alumni directory', async ({ page }) => {
  // Step 1: Sign up a new user to ensure an authenticated session.
  // This user will be in the 'platform' tenant by default.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_alumni_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Alumni Test User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Wait for redirect and navigate to the alumni connect page.
  await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  await page.goto('/alumni-connect');
  await expect(page.getByRole('heading', { name: /Alumni Directory/i })).toBeVisible();

  // Initially, multiple alumni from the 'platform' tenant should be visible.
  await expect(page.getByText('Alice Wonderland')).toBeVisible();
  await expect(page.getByText('Bob Builder')).toBeVisible();
  // Charlie should not be visible as he is in the 'brainqy' tenant.
  await expect(page.getByText('Charlie Chocolate')).not.toBeVisible();

  // Step 3: Perform a search for a specific alumnus.
  await page.getByLabel(/Name or Job Title/i).fill('Alice');

  // Step 4: Verify that only the searched alumnus is visible.
  await expect(page.getByText('Alice Wonderland')).toBeVisible();
  await expect(page.getByText('Bob Builder')).not.toBeVisible();

  // Step 5: Clear the search and apply a company filter (for a user in another tenant).
  await page.getByLabel(/Name or Job Title/i).clear();
  // Ensure other cards are visible again after clearing.
  await expect(page.getByText('Bob Builder')).toBeVisible();

  // We can't test filtering for 'Microsoft' as that user is in a different tenant.
  // Instead, let's filter by a 'platform' tenant company.
  await page.getByLabel('Company').getByRole('checkbox', { name: 'Google' }).check();
  
  // Step 6: Verify that only the alumnus from that company is visible.
  await expect(page.getByText('Bob Builder')).toBeVisible();
  await expect(page.getByText('Alice Wonderland')).not.toBeVisible();
  await expect(page.getByText('Charlie Chocolate')).not.toBeVisible();
});
