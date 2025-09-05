
import { test, expect } from '@playwright/test';

test('should allow a user to redeem a valid promo code and see their balance update', async ({ page }) => {
  // Step 1: Sign up a new user. Their wallet starts with 100 coins (seeded).
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_wallet_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Wallet Test User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();
  
  // Step 2: Navigate to the wallet page.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/wallet');
  await expect(page.getByRole('heading', { name: /Digital Wallet/i })).toBeVisible();

  // Step 3: Verify the initial wallet balance is 100 coins.
  // The main balance display is inside a <p> tag.
  const balanceDisplay = page.locator('p:has-text("100 Coins")');
  await expect(balanceDisplay).toBeVisible();

  // Step 4: Enter and redeem the pre-seeded promo code.
  // "WELCOME100" is seeded to give 100 coins.
  await page.getByLabel(/Enter Code/i).fill('WELCOME100');
  await page.getByRole('button', { name: /Redeem/i }).click();

  // Step 5: Verify the success toast appears.
  await expect(page.getByText(/Successfully redeemed code/i)).toBeVisible({ timeout: 10000 });

  // Step 6: Verify the wallet balance has updated to 200 coins.
  const updatedBalanceDisplay = page.locator('p:has-text("200 Coins")');
  await expect(updatedBalanceDisplay).toBeVisible();
  
  // Also verify the old balance is gone.
  await expect(balanceDisplay).not.toBeVisible();
});
