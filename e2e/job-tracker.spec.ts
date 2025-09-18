
import { test, expect } from '@playwright/test';

test('should allow a user to create a new job application', async ({ page }) => {
  // Step 1: Sign up a new user to ensure a clean state.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_jobtracker_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Job Tracker User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Wait for redirect and navigate to the job tracker.
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/job-tracker');
  await expect(page.getByRole('heading', { name: /Job Application Tracker/i })).toBeVisible();

  // Step 3: Open the "Add Job" dialog.
  await page.getByRole('button', { name: /Add Job/i }).click();
  await expect(page.getByRole('heading', { name: /Add New Job Application/i })).toBeVisible();

  // Step 4: Fill out the form.
  const companyName = 'TestCorp';
  const jobTitle = 'Software Engineer';
  await page.getByLabel('Company Name').fill(companyName);
  await page.getByLabel('Job Title').fill(jobTitle);
  // The status defaults to 'Saved', which is what we want to test.

  // Step 5: Save the application.
  await page.getByRole('button', { name: /Save/i }).click();

  // Step 6: Verify the new job card appears in the 'Saved' column.
  const savedColumn = page.getByTestId('kanban-column-Saved');
  await expect(savedColumn).toBeVisible();
  
  const newJobCard = savedColumn.getByText(jobTitle);
  await expect(newJobCard).toBeVisible();
  
  // Also check for company name within the card's context if possible,
  // but checking for the title is a strong indicator.
  const companyInCard = savedColumn.getByText(companyName, { exact: true });
  await expect(companyInCard).toBeVisible();
});


test('should allow a user to edit an existing job application', async ({ page }) => {
  // Step 1: Setup - Sign up and create a job.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_jobedit_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Job Edit User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();
  
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/job-tracker');
  await page.getByRole('button', { name: /Add Job/i }).click();

  const originalCompany = 'OriginalCorp';
  const jobTitle = 'Editable Engineer';
  await page.getByLabel('Company Name').fill(originalCompany);
  await page.getByLabel('Job Title').fill(jobTitle);
  await page.getByRole('button', { name: /Save/i }).click();

  // Step 2: Find and open the created job card.
  const savedColumn = page.getByTestId('kanban-column-Saved');
  const jobCard = savedColumn.getByText(jobTitle);
  await expect(jobCard).toBeVisible();
  await jobCard.click();

  // Step 3: Edit the details in the dialog.
  await expect(page.getByRole('heading', { name: /Edit Job Application/i })).toBeVisible();
  const updatedCompany = 'UpdatedCorp';
  await page.getByLabel('Company Name').fill(updatedCompany);
  await page.getByRole('button', { name: /Save/i }).click();

  // Step 4: Verify the changes are reflected on the card.
  await expect(savedColumn.getByText(originalCompany)).not.toBeVisible();
  await expect(savedColumn.getByText(updatedCompany)).toBeVisible();
  await expect(savedColumn.getByText(jobTitle)).toBeVisible(); // Title should remain
});

test('should allow a user to delete a job application', async ({ page }) => {
  // Step 1: Setup - Sign up and create a job.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_jobdelete_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Job Delete User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();
  
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  await page.goto('/job-tracker');
  await page.getByRole('button', { name: /Add Job/i }).click();

  const jobTitleToDelete = 'Deletable Engineer';
  await page.getByLabel('Company Name').fill('DeleteCorp');
  await page.getByLabel('Job Title').fill(jobTitleToDelete);
  await page.getByRole('button', { name: /Save/i }).click();

  // Step 2: Find and open the job card.
  const savedColumn = page.getByTestId('kanban-column-Saved');
  const jobCard = savedColumn.getByText(jobTitleToDelete);
  await expect(jobCard).toBeVisible();
  await jobCard.click();

  // Step 3: Click the delete button and confirm.
  await expect(page.getByRole('heading', { name: /Edit Job Application/i })).toBeVisible();
  await page.getByRole('button', { name: /Delete/i }).click();
  
  // Handle the confirmation dialog that appears.
  await expect(page.getByRole('heading', { name: /Are you sure/i })).toBeVisible();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  
  // Step 4: Verify the card is no longer on the board.
  await expect(savedColumn.getByText(jobTitleToDelete)).not.toBeVisible();
});
