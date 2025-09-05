
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

  // Initially, both platform alumni should be visible in their respective sections.
  // Alice is distinguished, so she appears in the carousel.
  await expect(distinguishedCarousel.getByText('Alice Wonderland')).toBeVisible();
  // We can't guarantee Bob and Eve are on the first page of the main directory,
  // so we won't check for them here initially. The core test is the filtering.

  // Step 3: Perform a search for a specific alumnus.
  await page.getByLabel(/Name or Job Title/i).fill('Alice');

  // Step 4: Verify that only the searched alumnus is visible in the main grid.
  await expect(directoryGrid.getByText('Alice Wonderland')).toBeVisible();
  await expect(directoryGrid.getByText('Bob Builder')).not.toBeVisible();
  await expect(directoryGrid.getByText('Eve Engineer')).not.toBeVisible();
  // The distinguished carousel should remain unchanged by the filter.
  await expect(distinguishedCarousel.getByText('Alice Wonderland')).toBeVisible();

  // Step 5: Clear the search and apply a company filter.
  await page.getByLabel(/Name or Job Title/i).clear();
  await page.getByRole('button', { name: /Filters/i }).click();
  await page.getByLabel('Company').getByRole('checkbox', { name: 'Google' }).check();
  
  // Step 6: Verify that only alumni from that company are visible in the main grid.
  await expect(directoryGrid.getByText('Bob Builder')).toBeVisible();
  await expect(directoryGrid.getByText('Eve Engineer')).toBeVisible();
  await expect(directoryGrid.getByText('Alice Wonderland')).not.toBeVisible();
  
  // Step 7: Perform a search within the filtered results.
  await page.getByLabel(/Name or Job Title/i).fill('Bob');
  
  // Step 8: Verify only the searched and filtered user is visible.
  await expect(directoryGrid.getByText('Bob Builder')).toBeVisible();
  await expect(directoryGrid.getByText('Eve Engineer')).not.toBeVisible();
  await expect(directoryGrid.getByText('Alice Wonderland')).not.toBeVisible();
});
