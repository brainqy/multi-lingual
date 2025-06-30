

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
import {
  RewriteResumeInputSchema,
  RewriteResumeOutputSchema,
  type RewriteResumeInput,
  type RewriteResumeOutput,
} from '@/types';

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
  prompt: `You are an expert resume writer. Your task is to rewrite the provided resume to be a strong match for the given job description, incorporating specific instructions.

**Rewrite Instructions:**
1.  **AI Fixes:** Apply the following improvements that were previously identified:
    {{#if fixableByAi}}
    {{#each fixableByAi}}
    - {{{this}}}
    {{/each}}
    {{else}}
    - General improvements to grammar, spelling, and tone.
    {{/if}}
2.  **User Instructions:** Carefully read the user's specific instructions and integrate them into the resume naturally.
    {{#if userInstructions}}
    - {{{userInstructions}}}
    {{else}}
    - No specific user instructions provided.
    {{/if}}
3.  **Core Goal:** Analyze the job description for key skills and qualifications, and ensure they are highlighted in the rewritten resume. Improve the overall quality by using strong action verbs and ensuring conciseness.
4.  **Formatting:** Maintain a professional tone and standard resume formatting (e.g., section headers, bullet points).
5.  **Output:** After rewriting, create a concise list of the most important fixes you applied for the 'fixesApplied' field.

**Original Resume Text to Rewrite:**
{{{resumeText}}}

**Target Job Description:**
{{{jobDescriptionText}}}
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
