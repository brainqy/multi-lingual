
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

test('should display referral history correctly', async ({ page }) => {
  // Step 1: Sign up a new user (the referrer).
  await page.goto('/auth/signup');
  const uniqueEmail = `referrer_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Referrer User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Navigate to the Referrals page and verify initial state.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/referrals');
  await expect(page.getByRole('heading', { name: /Referral Program/i })).toBeVisible();
  
  // Verify that there's no history initially.
  await expect(page.getByText(/You haven't referred anyone yet/i)).toBeVisible();

  // Step 3: Simulate a referral. This is a simplified mock.
  // In a real scenario, this would involve another user signing up with a referral code.
  // For this test, we assume the backend has processed a referral.
  // Our seed data already creates a referral for 'managerUser1'. We will log in as that user.
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill('managerUser1@example.com'); // A pre-seeded manager user
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /Login/i }).click();
  
  // Step 4: Navigate back to the referrals page.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/referrals');
  
  // Step 5: Verify the referral history now shows the seeded referral.
  const historyTable = page.getByRole('table');
  await expect(historyTable).toBeVisible();
  // Check for the name of the user who was referred in the seed data.
  await expect(historyTable.getByText(/colleague@example.com/i)).toBeVisible();
  await expect(historyTable.getByText(/Reward Earned/i)).toBeVisible();
});
