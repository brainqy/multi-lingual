
import { test, expect } from '@playwright/test';

test('should allow a user to nominate another user for an award', async ({ page }) => {
  // Step 1: Sign up a new user (the nominator).
  await page.goto('/auth/signup');
  const uniqueEmail = `nominator_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Nominator User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Navigate to the Awards page.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/awards');
  await expect(page.getByRole('heading', { name: /Awards & Recognition/i })).toBeVisible();

  // Step 3: Find an award that is open for nomination and open the dialog.
  // The "Rising Star Award" is seeded to be in the 'Nominating' phase.
  const awardCard = page.getByRole('heading', { name: /Rising Star Award/i }).locator('..').locator('..');
  await awardCard.getByRole('button', { name: /Nominate/i }).click({ timeout: 20000 });
  
  // Step 4: Fill out the nomination form.
  await expect(page.getByRole('heading', { name: /Nominate for: Rising Star Award/i })).toBeVisible();
  
  // Select a nominee from the dropdown.
  await page.getByRole('button', { name: /Select a user to nominate/i }).click();
  await page.getByRole('option', { name: 'Alice Wonderland' }).click(); // Alice is a seeded user

  // Provide a justification.
  const justification = `Alice has shown incredible growth and leadership in her recent projects. - Playwright ${new Date().toISOString()}`;
  await page.getByLabel(/Justification/i).fill(justification);

  // Step 5: Submit the nomination.
  await page.getByRole('button', { name: /Submit Nomination/i }).click();

  // Step 6: Verify the success toast appears.
  await expect(page.getByText(/Nomination Submitted!/i)).toBeVisible({ timeout: 15000 });
});
