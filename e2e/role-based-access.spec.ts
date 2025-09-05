
import { test, expect } from '@playwright/test';

// Test for Admin Access
test('admin user should be able to access admin-only pages', async ({ page }) => {
  // Step 1: Log in as the pre-seeded admin user.
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill('admin@bhashasetu.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /Login/i }).click();
  
  // Step 2: Verify redirection to the admin dashboard.
  await expect(page).toHaveURL('/admin/dashboard', { timeout: 30000 });

  // Step 3: Navigate to a strictly admin-only page.
  await page.goto('/admin/tenant-management');
  
  // Step 4: Verify the page loads correctly and does not show an "Access Denied" message.
  await expect(page.getByRole('heading', { name: /Tenant Management/i })).toBeVisible();
  await expect(page.getByText(/Access Denied/i)).not.toBeVisible();
});

// Test for Manager Access
test('manager user should be able to access manager pages', async ({ page }) => {
  // Step 1: Log in as a pre-seeded manager user (Bob Builder).
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill('bob@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /Login/i }).click();
  
  // Step 2: Verify redirection to the dashboard.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });

  // Step 3: Navigate to a page accessible by managers.
  await page.goto('/admin/user-management');

  // Step 4: Verify the page loads.
  await expect(page.getByRole('heading', { name: /User Management/i })).toBeVisible();
  await expect(page.getByText(/Access Denied/i)).not.toBeVisible();
});

// Test for Access Denial
test('standard user should be blocked from admin and manager pages', async ({ page }) => {
  // Step 1: Sign up and log in as a new standard user.
  await page.goto('/auth/signup');
  const userEmail = `standard_user_access_test_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Standard User');
  await page.getByLabel('Email').fill(userEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();
  
  // Step 2: Verify login is successful.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });

  // Step 3: Attempt to navigate to an admin/manager page.
  await page.goto('/admin/user-management');
  
  // Step 4: Verify the "Access Denied" message is shown.
  await expect(page.getByRole('heading', { name: /Access Denied/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /User Management/i })).not.toBeVisible();
});
