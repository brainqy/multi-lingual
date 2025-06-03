
'use server';
/**
 * @fileOverview Provides AI-driven personalized job recommendations.
 *
 * - personalizedJobRecommendations - A function that suggests jobs based on user profile.
 * - PersonalizedJobRecommendationsInput - The input type.
 * - PersonalizedJobRecommendationsOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobOpeningSchema = z.object({
  id: z.string().describe('Unique identifier for the job opening.'),
  title: z.string().describe('The job title.'),
  company: z.string().describe('The name of the company.'),
  description: z.string().describe('The full job description text.'),
  location: z.string().optional().describe('The location of the job.'),
  type: z.string().optional().describe('The type of employment (e.g., Full-time, Contract).'),
});

const PersonalizedJobRecommendationsInputSchema = z.object({
  userProfileText: z.string().describe("A comprehensive summary of the user's profile, including skills, experience, and career aspirations."),
  careerInterests: z.string().describe("Specific career interests or roles the user is targeting."),
  availableJobs: z.array(JobOpeningSchema).describe("A list of currently available job openings to consider for recommendations."),
});
export type PersonalizedJobRecommendationsInput = z.infer<typeof PersonalizedJobRecommendationsInputSchema>;

const RecommendedJobSchema = z.object({
  jobId: z.string().describe('The ID of the recommended job opening, matching one from the input list.'),
  title: z.string().describe('The job title of the recommended job.'),
  company: z.string().describe('The company offering the recommended job.'),
  reasoning: z.string().describe("A detailed explanation of why this job is a good match for the user."),
  matchStrength: z.number().min(0).max(100).describe("A numerical score (0-100) indicating the strength of the match between the user's profile and this job."),
});

const PersonalizedJobRecommendationsOutputSchema = z.object({
  recommendedJobs: z.array(RecommendedJobSchema).describe("A list of job openings recommended for the user, sorted by match strength (highest first)."),
});
export type PersonalizedJobRecommendationsOutput = z.infer<typeof PersonalizedJobRecommendationsOutputSchema>;

export async function personalizedJobRecommendations(
  input: PersonalizedJobRecommendationsInput
): Promise<PersonalizedJobRecommendationsOutput> {
  return personalizedJobRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedJobRecommendationsPrompt',
  input: {schema: PersonalizedJobRecommendationsInputSchema},
  output: {schema: PersonalizedJobRecommendationsOutputSchema},
  prompt: `You are an expert career advisor AI. Your task is to analyze the provided user profile and their career interests, then compare them against a list of available job openings.
Based on this analysis, recommend the most suitable job openings for the user. For each recommended job, provide:
1.  The job's ID (jobId), title, and company (these must match an entry from the availableJobs input).
2.  A detailed 'reasoning' explaining why this specific job aligns well with the user's profile, skills, experience, and stated career interests.
3.  A 'matchStrength' score between 0 and 100, where 100 indicates a perfect match.

User Profile:
{{{userProfileText}}}

Career Interests:
{{{careerInterests}}}

Available Job Openings:
{{#each availableJobs}}
---
Job ID: {{{id}}}
Title: {{{title}}}
Company: {{{company}}}
Location: {{{location}}}
Type: {{{type}}}
Description:
{{{description}}}
---
{{/each}}

Please return up to 5 best-matching jobs, sorted by matchStrength in descending order.
Ensure the output is in the specified JSON format.
`,
});

const personalizedJobRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedJobRecommendationsFlow',
    inputSchema: PersonalizedJobRecommendationsInputSchema,
    outputSchema: PersonalizedJobRecommendationsOutputSchema,
  },
  async input => {
    if (input.availableJobs.length === 0) {
      return { recommendedJobs: [] };
    }
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate job recommendations.");
    }
    // Ensure the recommended jobs actually exist in the input list (simple check)
    const validRecommendedJobs = output.recommendedJobs.filter(recommendedJob =>
        input.availableJobs.some(availableJob => availableJob.id === recommendedJob.jobId)
    );
    return { recommendedJobs: validRecommendedJobs };
  }
);
