import { test, expect } from '@playwright/test';

test('should allow a user to analyze a resume against a job description', async ({ page }) => {
  // Step 1: Sign up a new user to ensure a clean state.
  await page.goto('/auth/signup');
  const uniqueEmail = `testuser_resumeanalyzer_${Date.now()}@example.com`;
  await page.getByLabel('Full Name').fill('Resume Analyzer User');
  await page.getByLabel('Email').fill(uniqueEmail);
  await page.getByLabel('Password').fill('password123');
  await page.getByLabel(/Agree to our terms and conditions/i).check();
  await page.getByRole('button', { name: /Create Account/i }).click();

  // Step 2: Wait for redirect and navigate to the resume analyzer page.
  await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  await page.goto('/resume-analyzer');
  await expect(page.getByRole('heading', { name: /Resume Analyzer/i })).toBeVisible();

  // Step 3: Fill out the form with sample data.
  const resumeText = "Experienced software engineer with a background in building scalable web applications using React and Node.js.";
  const jobDescription = "We are looking for a skilled React developer to join our team. Experience with TypeScript is a plus.";
  
  // Use getByLabel for better accessibility and robustness.
  await page.getByLabel(/Paste Resume Text/i).fill(resumeText);
  await page.getByLabel(/Job Description/i).fill(jobDescription);
  
  // Ensure the Analysis Report is not visible before submission.
  await expect(page.getByTestId('analysis-report-section')).not.toBeVisible();

  // Step 4: Click the "Analyze Resume" button.
  await page.getByRole('button', { name: /Analyze Resume/i }).click();

  // Step 5: Verify that the Analysis Report section becomes visible.
  // The AI analysis can take some time, so we give this a longer timeout.
  const analysisReportSection = page.getByTestId('analysis-report-section');
  await expect(analysisReportSection).toBeVisible({ timeout: 20000 });

  // Optional: A stronger assertion could be to check for a specific element within the report.
  await expect(analysisReportSection.getByRole('heading', { name: /Analysis Report/i })).toBeVisible();
});
