
import { test, expect } from '@playwright/test';

test('should allow a user to change and save a notification setting', async ({ page }) => {
  // Step 1: Sign up a new user.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_settings_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Settings User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Navigate to the settings page.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();

  // Step 3: Locate the "Gamification & Rewards Notifications" switch.
  // Switches have an accessible role of 'checkbox'. We find it by its label.
  const gamificationSwitch = page.getByLabel(/Gamification & Rewards Notifications/i);
  
  // Verify its initial state (should be checked by default).
  await expect(gamificationSwitch).toBeChecked();
  
  // Step 4: Uncheck the switch.
  await gamificationSwitch.uncheck();
  await expect(gamificationSwitch).not.toBeChecked();

  // Step 5: Save the settings.
  await page.getByRole('button', { name: /Save All Settings/i }).click();
  
  // Step 6: Verify the success toast appears.
  await expect(page.getByText(/Settings Saved/i)).toBeVisible({ timeout: 15000 });

  // Step 7: Reload the page to confirm the setting has persisted.
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  
  // Re-locate the switch after reload.
  const reloadedGamificationSwitch = page.getByLabel(/Gamification & Rewards Notifications/i);

  // Step 8: Verify the setting is still unchecked.
  await expect(reloadedGamificationSwitch).not.toBeChecked();
});
