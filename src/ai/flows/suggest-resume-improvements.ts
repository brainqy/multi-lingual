
// src/ai/flows/suggest-resume-improvements.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting improvements to a resume based on job description analysis.
 *
 * - suggestResumeImprovements - A function that takes a resume and job description as input and suggests improvements to the resume.
 * - SuggestResumeImprovementsInput - The input type for the suggestResumeImprovements function.
 * - SuggestResumeImprovementsOutput - The return type for the suggestResumeImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestResumeImprovementsInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume.'),
  jobDescription: z
    .string()
    .describe('The job description to tailor the resume to.'),
});
export type SuggestResumeImprovementsInput = z.infer<typeof SuggestResumeImprovementsInputSchema>;

const SuggestResumeImprovementsOutputSchema = z.object({
  improvedResumeSections: z.array(
    z.object({
      sectionTitle: z.string().describe('The title of the resume section to improve.'),
      suggestedImprovements: z.array(z.string()).describe('Specific suggestions for improving the content of this section.'),
    })
  ).describe('A list of resume sections with suggested improvements.'),
});
export type SuggestResumeImprovementsOutput = z.infer<typeof SuggestResumeImprovementsOutputSchema>;

export async function suggestResumeImprovements(input: SuggestResumeImprovementsInput): Promise<SuggestResumeImprovementsOutput> {
  return suggestResumeImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResumeImprovementsPrompt',
  input: {schema: SuggestResumeImprovementsInputSchema},
  output: {schema: SuggestResumeImprovementsOutputSchema},
  prompt: `You are an expert resume writer. Given the following resume and job description, suggest improvements to the resume to better match the job description. Focus on improving the phrasing and highlighting relevant skills and experience.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}

Provide specific suggestions for each relevant section of the resume.  If a section is already well-written and aligned with the job description, you may omit it from the output.  The goal is to make the resume a stronger match for the job.
`,
});

const suggestResumeImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestResumeImprovementsFlow',
    inputSchema: SuggestResumeImprovementsInputSchema,
    outputSchema: SuggestResumeImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
