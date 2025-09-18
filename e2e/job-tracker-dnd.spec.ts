import { test, expect } from '@playwright/test';

test('should allow a user to move a job application to a different column', async ({ page }) => {
  // Step 1: Sign up a new user.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_dnd_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Drag Drop User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Navigate to the job tracker.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/job-tracker');
  await expect(page.getByRole('heading', { name: /Job Application Tracker/i })).toBeVisible();

  // Step 3: Create a job to be dragged.
  await page.getByRole('button', { name: /Add Job/i }).click();
  const jobTitle = 'Draggable Job';
  await page.getByLabel('Company Name').fill('MoveIt Corp');
  await page.getByLabel('Job Title').fill(jobTitle);
  await page.getByRole('button', { name: /Save/i }).click();

  // Step 4: Locate the card and the columns.
  const savedColumn = page.getByTestId('kanban-column-Saved');
  const appliedColumn = page.getByTestId('kanban-column-Applied');
  const jobCard = savedColumn.getByText(jobTitle);

  // Verify initial state.
  await expect(jobCard).toBeVisible();
  await expect(appliedColumn.getByText(jobTitle)).not.toBeVisible();

  // Step 5: Perform the drag and drop.
  await jobCard.dragTo(appliedColumn);

  // Step 6: Verify the final state.
  await expect(savedColumn.getByText(jobTitle)).not.toBeVisible();
  await expect(appliedColumn.getByText(jobTitle)).toBeVisible();
});
