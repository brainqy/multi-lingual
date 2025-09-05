
import { test, expect } from '@playwright/test';

test('should allow a user to book and view an appointment', async ({ page }) => {
  // Step 1: Sign up a new user (the requester).
  await page.goto('/auth/signup');
  const requesterEmail = `requester_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Requester User');
  await page.getByLabel('Email').fill(requesterEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Navigate to the Alumni Directory.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/alumni-connect');
  await expect(page.getByRole('heading', { name: /Alumni Directory/i })).toBeVisible();

  // Step 3: Find an alumnus to book (e.g., Bob Builder) and open the booking dialog.
  const alumniCard = page.getByTestId('alumni-directory-grid').getByText('Bob Builder').first().locator('..').locator('..');
  await alumniCard.getByRole('button', { name: /Book/i }).click();

  // Step 4: Fill out and submit the booking form.
  await expect(page.getByRole('heading', { name: /Book Appointment with Bob Builder/i })).toBeVisible();
  const purpose = `Playwright Test Appointment - ${new Date().toISOString()}`;
  await page.getByLabel(/Purpose of Meeting/i).fill(purpose);
  // We'll leave the default date/time for simplicity.
  await page.getByRole('button', { name: /Request Appointment/i }).click();

  // Step 5: Verify the "request sent" toast appears.
  await expect(page.getByText(/Appointment request sent/i)).toBeVisible({ timeout: 10000 });

  // Step 6: Navigate to the Appointments page.
  await page.goto('/appointments');
  await expect(page.getByTestId('appointments-page')).toBeVisible();

  // Step 7: Verify the new pending appointment is visible on the page.
  const appointmentList = page.getByTestId('appointments-list');
  await expect(appointmentList).toBeVisible();
  
  const newAppointmentCard = appointmentList.locator(`[data-testid*="appointment-card"]`);
  await expect(newAppointmentCard.getByText(purpose)).toBeVisible();
  await expect(newAppointmentCard.getByText(/With Bob Builder/i)).toBeVisible();
  await expect(newAppointmentCard.getByText(/Pending/i)).toBeVisible();
});
