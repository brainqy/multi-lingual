
import { test, expect } from '@playwright/test';

test('should isolate data between tenants', async ({ page }) => {
  // --- SETUP: Create a user in the 'brainqy' tenant ---
  await page.goto('http://brainqy.localhost:9002/auth/signup');
  const brainqyUserEmail = `brainqy_user_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Brainqy User');
  await page.getByLabel('Email').fill(brainqyUserEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Wait for login and then navigate to the community feed to create a post.
  await expect(page).toHaveURL('http://brainqy.localhost:9002/dashboard', { timeout: 30000 });
  await page.goto('http://brainqy.localhost:9002/community-feed');
  
  // Create a post that is unique to the 'brainqy' tenant.
  const brainqyPostContent = `This is a test post from the Brainqy tenant at ${new Date().toISOString()}`;
  await page.getByRole('button', { name: /Create New Post/i }).click();
  await page.getByPlaceholder(/Share updates, ask questions, or start a discussion.../i).fill(brainqyPostContent);
  await page.getByRole('button', { name: /Post/i }).click();
  await expect(page.getByText(brainqyPostContent)).toBeVisible();
  
  // The 'brainqy' tenant should see its own user 'Charlie Chocolate' and platform users like 'Alice Wonderland'.
  // It should NOT see users from the 'guruji' tenant like 'Diana Prince'.
  await page.goto('http://brainqy.localhost:9002/alumni-connect');
  await expect(page.getByText('Charlie Chocolate')).toBeVisible();
  await expect(page.getByText('Alice Wonderland')).toBeVisible();
  await expect(page.getByText('Diana Prince')).not.toBeVisible();
  
  
  // --- TEST: Log in as a user from a different tenant ('guruji') ---
  // Note: We use the pre-seeded 'Diana Prince' user from the 'guruji' tenant.
  await page.goto('http://guruji.localhost:9002/auth/login');
  await page.getByLabel('Email').fill('diana@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /Login/i }).click();
  await expect(page).toHaveURL('http://guruji.localhost:9002/dashboard', { timeout: 30000 });

  // --- VERIFICATION ---
  // 1. Verify the 'guruji' user CANNOT see the post from the 'brainqy' tenant.
  await page.goto('http://guruji.localhost:9002/community-feed');
  await expect(page.getByText(brainqyPostContent)).not.toBeVisible();
  
  // 2. Verify the 'guruji' user can see their own alumni and platform users, but NOT 'brainqy' users.
  await page.goto('http://guruji.localhost:9002/alumni-connect');
  await expect(page.getByText('Diana Prince')).toBeVisible(); // Self
  await expect(page.getByText('Ethan Hunt')).toBeVisible();   // Own tenant
  await expect(page.getByText('Alice Wonderland')).toBeVisible(); // Platform user
  await expect(page.getByText('Charlie Chocolate')).not.toBeVisible(); // 'brainqy' user
});
