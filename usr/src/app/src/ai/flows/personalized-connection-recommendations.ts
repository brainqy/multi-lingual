
'use server';
/**
 * @fileOverview Provides AI-driven suggestions for alumni connections.
 *
 * - personalizedConnectionRecommendations - A function that suggests alumni connections.
 * - PersonalizedConnectionRecommendationsInput - The input type for the personalizedConnectionRecommendations function.
 * - PersonalizedConnectionRecommendationsOutput - The return type for the personalizedConnectionRecommendationsOutput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AIError } from '@/lib/exceptions';

const AlumniProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    currentJobTitle: z.string(),
    company: z.string(),
    skills: z.array(z.string()),
    offersHelpWith: z.array(z.string()).optional(),
});

const PersonalizedConnectionRecommendationsInputSchema = z.object({
  userProfileText: z.string().describe("A comprehensive summary of the current user's profile, including skills, experience, and career aspirations."),
  careerInterests: z.string().describe("Specific career interests or roles the user is targeting."),
  availableAlumni: z.array(AlumniProfileSchema).describe("A list of available alumni profiles to choose from for recommendations."),
});
export type PersonalizedConnectionRecommendationsInput = z.infer<
  typeof PersonalizedConnectionRecommendationsInputSchema
>;

const RecommendedConnectionSchema = z.object({
    alumniId: z.string().describe("The ID of the recommended alumnus, which must match one from the input list."),
    name: z.string().describe("The name of the recommended alumnus."),
    reasoning: z.string().describe("A concise, personalized reason explaining why this alumnus is a good connection for the user."),
});

const PersonalizedConnectionRecommendationsOutputSchema = z.object({
  suggestedConnections: z
    .array(RecommendedConnectionSchema)
    .describe('A list of up to 3 highly relevant suggested alumni connections.'),
});
export type PersonalizedConnectionRecommendationsOutput = z.infer<
  typeof PersonalizedConnectionRecommendationsOutputSchema
>;

export async function personalizedConnectionRecommendations(
  input: PersonalizedConnectionRecommendationsInput
): Promise<PersonalizedConnectionRecommendationsOutput> {
  return personalizedConnectionRecommendationsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'personalizedConnectionRecommendationsPrompt',
  input: {schema: PersonalizedConnectionRecommendationsInputSchema},
  output: {schema: PersonalizedConnectionRecommendationsOutputSchema},
  prompt: `You are an AI career networking assistant for an alumni platform. Your goal is to provide highly tailored alumni connection recommendations to help users achieve their specific career goals.

Analyze the current user's profile and their stated career interests.
From the provided list of available alumni, select up to 3 individuals who are best suited to help the user.

For each suggestion, provide:
1.  'alumniId': The exact ID of the alumnus from the list.
2.  'name': The name of the alumnus.
3.  'reasoning': A short, compelling, one-sentence explanation for the recommendation. The reasoning should directly connect the user's goals with the alumnus's experience or skills. Example: "His experience in scaling startups at Google aligns perfectly with your entrepreneurial interests."

Current User Profile:
{{{userProfileText}}}

Career Interests & Goals:
{{{careerInterests}}}

Available Alumni to choose from:
{{#each availableAlumni}}
---
ID: {{{id}}}
Name: {{{name}}}
Job Title: {{{currentJobTitle}}} at {{{company}}}
Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Offers Help With: {{#each offersHelpWith}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
---
{{/each}}

Output strictly in the specified JSON format.
  `,
});

const personalizedConnectionRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedConnectionRecommendationsFlow',
    inputSchema: PersonalizedConnectionRecommendationsInputSchema,
    outputSchema: PersonalizedConnectionRecommendationsOutputSchema,
  },
  async input => {
    if (input.availableAlumni.length === 0) {
      return { suggestedConnections: [] };
    }
    const {output} = await prompt(input);
    if (!output) {
        throw new AIError("AI failed to generate connection recommendations.");
    }
    return output;
  }
);

    