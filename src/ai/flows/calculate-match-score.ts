
'use server';
/**
 * @fileOverview Calculates a match score between a resume and a job description, identifying missing keywords.
 *
 * - calculateMatchScore - A function that calculates the match score.
 * - CalculateMatchScoreInput - The input type for the calculateMatchScore function.
 * - CalculateMatchScoreOutput - The return type for the calculateMatchScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateMatchScoreInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The job description to match against.'),
});
export type CalculateMatchScoreInput = z.infer<typeof CalculateMatchScoreInputSchema>;

const CalculateMatchScoreOutputSchema = z.object({
  matchScore: z.number().describe('A score (0-100) indicating how well the resume matches the job description.'),
  missingKeywords: z.array(z.string()).describe('Keywords from the job description that are missing from the resume.'),
  relevantKeywords: z.array(z.string()).describe('Keywords from the job description that are present in the resume.'),
});
export type CalculateMatchScoreOutput = z.infer<typeof CalculateMatchScoreOutputSchema>;

export async function calculateMatchScore(input: CalculateMatchScoreInput): Promise<CalculateMatchScoreOutput> {
  return calculateMatchScoreFlow(input);
}

const calculateMatchScorePrompt = ai.definePrompt({
  name: 'calculateMatchScorePrompt',
  input: {schema: CalculateMatchScoreInputSchema},
  output: {schema: CalculateMatchScoreOutputSchema},
  prompt: `You are an AI assistant that analyzes a resume against a job description and provides a match score and identifies missing keywords.

  Instructions:
  1.  Analyze the resume text and job description to identify relevant skills and experience.
  2.  Calculate a match score (0-100) indicating how well the resume aligns with the job description.  Take into account how important each keyword is based on frequency of use in the job description.
  3.  Identify keywords from the job description that are missing from the resume.
  4. Identify keywords from the job description that are present in the resume.

  Resume Text: {{{resumeText}}}

  Job Description: {{{jobDescription}}}

  Output in JSON format:
  {
    "matchScore": number,
    "missingKeywords": string[],
    "relevantKeywords": string[],
  }`,
});

const calculateMatchScoreFlow = ai.defineFlow(
  {
    name: 'calculateMatchScoreFlow',
    inputSchema: CalculateMatchScoreInputSchema,
    outputSchema: CalculateMatchScoreOutputSchema,
  },
  async input => {
    const {output} = await calculateMatchScorePrompt(input);
    return output!;
  }
);
