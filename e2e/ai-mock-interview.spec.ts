import { test, expect } from '@playwright/test';

test('should allow a user to set up and start an AI mock interview', async ({ page }) => {
  // Step 1: Sign up a new user.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_mockinterview_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Mock Interview User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Wait for redirect and navigate to the AI mock interview page.
  await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  await page.goto('/ai-mock-interview');
  await expect(page.getByRole('heading', { name: /AI Mock Interview/i })).toBeVisible();

  // Step 3: Fill out the setup form.
  await page.getByLabel(/Interview Topic/i).fill('React Developer');
  await page.getByLabel(/Number of Questions/i).fill('3');
  
  // The setup form should be visible.
  await expect(page.getByTestId('mock-interview-setup-form')).toBeVisible();
  // The interview interface should NOT be visible yet.
  await expect(page.getByTestId('mock-interview-interface')).not.toBeVisible();

  // Step 4: Start the interview.
  await page.getByRole('button', { name: /Start Mock Interview/i }).click();

  // Step 5: Verify the interview interface is now visible.
  // The AI can take time to generate questions, so we use a long timeout.
  const interviewInterface = page.getByTestId('mock-interview-interface');
  await expect(interviewInterface).toBeVisible({ timeout: 25000 });
  
  // A strong indicator that the interview has started is the question progress label.
  await expect(interviewInterface.getByText(/Question 1 of 3/i)).toBeVisible();
  
  // The setup form should now be hidden.
  await expect(page.getByTestId('mock-interview-setup-form')).not.toBeVisible();
});
