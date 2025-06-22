'use server';
/**
 * @fileOverview Generates a rewritten resume tailored to a specific job description.
 *
 * - powerEditResume - A function that handles the resume rewriting process.
 * - PowerEditResumeInput - The input type for the powerEditResume function.
 * - PowerEditResumeOutput - The return type for the powerEditResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PowerEditResumeInputSchema = z.object({
  baseResumeText: z.string().describe('The original resume text to be adapted.'),
  jobDescriptionText: z.string().describe('The full job description to tailor the resume towards.'),
  userInstructions: z.string().optional().describe('Any specific instructions or points to emphasize from the user.'),
});
export type PowerEditResumeInput = z.infer<typeof PowerEditResumeInputSchema>;

const PowerEditResumeOutputSchema = z.object({
  editedResumeText: z.string().describe('The newly generated resume text, rewritten to match the job description.'),
});
export type PowerEditResumeOutput = z.infer<typeof PowerEditResumeOutputSchema>;

export async function powerEditResume(
  input: PowerEditResumeInput
): Promise<PowerEditResumeOutput> {
  return powerEditResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'powerEditResumePrompt',
  input: {schema: PowerEditResumeInputSchema},
  output: {schema: PowerEditResumeOutputSchema},
  prompt: `You are an expert resume writer and career coach. Your task is to rewrite the provided base resume to be a strong match for the given job description.

**Instructions:**
1.  Thoroughly analyze the Job Description to identify key skills, qualifications, responsibilities, and company values.
2.  Rewrite the Base Resume. Do not just add keywords; rephrase sentences, reorder bullet points, and adjust the summary to highlight the most relevant aspects of the user's experience.
3.  Quantify achievements where possible (e.g., "Increased efficiency by 20%").
4.  Use strong action verbs.
5.  If the user provides specific instructions, prioritize them in your rewrite.
6.  The output must be the full, rewritten resume text. Do not provide a summary of changes, just the final resume content.

**Base Resume Text:**
{{{baseResumeText}}}

**Job Description:**
{{{jobDescriptionText}}}

{{#if userInstructions}}
**User's Specific Instructions:**
{{{userInstructions}}}
{{/if}}
`,
});

const powerEditResumeFlow = ai.defineFlow(
  {
    name: 'powerEditResumeFlow',
    inputSchema: PowerEditResumeInputSchema,
    outputSchema: PowerEditResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate the edited resume.");
    }
    return output;
  }
);
