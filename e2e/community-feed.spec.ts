
import { test, expect } from '@playwright/test';

test('should allow a user to create a new post', async ({ page }) => {
  // Step 1: Sign up a new user to ensure an authenticated session.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_community_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Community Test User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Wait for redirect and navigate to the community feed.
  await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  await page.goto('/community-feed');
  await expect(page.getByRole('heading', { name: /Community Feed/i })).toBeVisible();

  // Step 3: Open the create post dialog.
  await page.getByRole('button', { name: /Create New Post/i }).click();
  await expect(page.getByRole('heading', { name: /Create New Post/i })).toBeVisible();

  // Step 4: Fill in the post content with a unique message.
  const postContent = `This is a test post from Playwright, created at ${new Date().toISOString()}`;
  await page.getByPlaceholder(/Share updates, ask questions, or start a discussion.../i).fill(postContent);
  
  // Step 5: Submit the post.
  await page.getByRole('button', { name: /Post/i }).click();

  // Step 6: Verify the new post appears on the feed.
  // We check for the unique content to ensure it's our new post.
  await expect(page.getByText(postContent)).toBeVisible({ timeout: 10000 });
});
