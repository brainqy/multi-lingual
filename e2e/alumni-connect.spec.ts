
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
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/alumni-connect');
  await expect(page.getByRole('heading', { name: /Alumni Directory/i })).toBeVisible();

  // Define locators for the main sections
  const distinguishedCarousel = page.getByTestId('distinguished-alumni-carousel');
  const directoryGrid = page.getByTestId('alumni-directory-grid');

  // Alice is distinguished and should always be visible in her carousel.
  await expect(distinguishedCarousel.getByText('Alice Wonderland')).toBeVisible();

  // Step 3: Apply a company filter first. This is more robust than checking the initial unfiltered list.
  await page.getByRole('button', { name: /Filters/i }).click();
  await page.getByLabel('Company').getByRole('checkbox', { name: 'Google' }).check();

  // Step 4: Verify that only alumni from that company are visible in the main grid.
  await expect(directoryGrid.getByText('Bob Builder')).toBeVisible();
  await expect(directoryGrid.getByText('Eve Engineer')).toBeVisible();
  await expect(directoryGrid.getByText('Alice Wonderland')).not.toBeVisible();

  // Step 5: Perform a search within the filtered results.
  await page.getByLabel(/Name or Job Title/i).fill('Bob');
  
  // Step 6: Verify only the searched and filtered user is visible.
  await expect(directoryGrid.getByText('Bob Builder')).toBeVisible();
  await expect(directoryGrid.getByText('Eve Engineer')).not.toBeVisible();
  await expect(directoryGrid.getByText('Alice Wonderland')).not.toBeVisible();
  
  // Step 7: Clear the search and ensure the filter is still applied.
  await page.getByLabel(/Name or Job Title/i).clear();
  
  // Step 8: Verify the filtered list returns to its previous state.
  await expect(directoryGrid.getByText('Bob Builder')).toBeVisible();
  await expect(directoryGrid.getByText('Eve Engineer')).toBeVisible();
  await expect(directoryGrid.getByText('Alice Wonderland')).not.toBeVisible();
});
