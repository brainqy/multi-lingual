
'use server';
/**
 * @fileOverview Rewrites a resume based on a job description and user-provided instructions.
 * This flow aims to incorporate user feedback and apply general improvements.
 *
 * - rewriteResumeWithFixes - A function that handles the resume rewriting process.
 * - RewriteResumeInput - The input type for the function.
 * - RewriteResumeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const RewriteResumeInputSchema = z.object({
  resumeText: z.string().describe('The original (or user-edited) resume text to be rewritten.'),
  jobDescription: z.string().describe('The target job description.'),
  userInstructions: z.string().optional().describe("Specific instructions from the user on what to add, change, or emphasize. E.g., 'Add that my team at XYZ was 5 people. Emphasize my experience with TypeScript.'"),
});
export type RewriteResumeInput = z.infer<typeof RewriteResumeInputSchema>;

export const RewriteResumeOutputSchema = z.object({
  rewrittenResume: z.string().describe('The full text of the newly rewritten resume.'),
  fixesApplied: z.array(z.string()).describe("A bulleted list of the key changes the AI made. E.g., 'Quantified achievement in the XYZ role.', 'Strengthened action verbs in the summary.'"),
});
export type RewriteResumeOutput = z.infer<typeof RewriteResumeOutputSchema>;

export async function rewriteResumeWithFixes(input: RewriteResumeInput): Promise<RewriteResumeOutput> {
  const result = await rewriteResumeFlow(input);
  if (!result || !result.rewrittenResume) {
    // Fallback in case of AI failure
    return {
      rewrittenResume: input.resumeText + "\n\n-- AI rewrite failed, no changes were applied. --",
      fixesApplied: ["AI rewrite failed. Please try again."]
    };
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'rewriteResumeWithFixesPrompt',
  input: {schema: RewriteResumeInputSchema},
  output: {schema: RewriteResumeOutputSchema},
  prompt: `You are an expert resume writer. Your task is to rewrite the provided resume to be a strong match for the given job description, incorporating specific instructions from the user.

**Rewrite Instructions:**
1.  Carefully read the user's instructions and integrate them into the resume naturally.
2.  Analyze the job description for key skills and qualifications, and ensure they are highlighted in the rewritten resume.
3.  Improve the overall quality by using strong action verbs, ensuring conciseness, correcting grammar, and quantifying achievements where possible.
4.  Maintain a professional tone and standard resume formatting (e.g., section headers, bullet points).
5.  After rewriting, create a concise list of the most important fixes you applied.

**User's Instructions:**
{{#if userInstructions}}
{{{userInstructions}}}
{{else}}
No specific instructions provided. Focus on general improvements based on the job description.
{{/if}}

**Original Resume Text to Rewrite:**
{{{resumeText}}}

**Target Job Description:**
{{{jobDescription}}}
`,
});

const rewriteResumeFlow = ai.defineFlow(
  {
    name: 'rewriteResumeFlow',
    inputSchema: RewriteResumeInputSchema,
    outputSchema: RewriteResumeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
