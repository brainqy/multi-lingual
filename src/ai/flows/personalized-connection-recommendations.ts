
'use server';

/**
 * @fileOverview THIS FLOW IS DEPRECATED AND NO LONGER IN USE.
 * Provides AI-driven suggestions for alumni connections.
 *
 * - personalizedConnectionRecommendations - A function that suggests alumni connections.
 * - PersonalizedConnectionRecommendationsInput - The input type for the personalizedConnectionRecommendations function.
 * - PersonalizedConnectionRecommendationsOutput - The return type for the personalizedConnectionRecommendationsOutput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedConnectionRecommendationsInputSchema = z.object({
  userProfile: z
    .string()
    .describe('The user profile including skills, experience, and interests.'),
  careerInterests: z.string().describe('The career interests and specific goals of the user.'),
});
export type PersonalizedConnectionRecommendationsInput = z.infer<
  typeof PersonalizedConnectionRecommendationsInputSchema
>;

const PersonalizedConnectionRecommendationsOutputSchema = z.object({
  suggestedConnections: z
    .array(z.string())
    .describe('A list of suggested alumni connection names.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind these connection suggestions, explaining how each connection aligns with the user\'s goals.'),
});
export type PersonalizedConnectionRecommendationsOutput = z.infer<
  typeof PersonalizedConnectionRecommendationsOutputSchema
>;

export async function personalizedConnectionRecommendations(
  input: PersonalizedConnectionRecommendationsInput
): Promise<PersonalizedConnectionRecommendationsOutput> {
  // This flow is deprecated. Return a default or error response.
  console.warn("DEPRECATED: personalizedConnectionRecommendations flow was called.");
  return {
    suggestedConnections: [],
    reasoning: "This feature (AI Mentorship Matching) is currently unavailable or has been removed."
  };
}

// The actual Genkit flow definition can be commented out or removed
/*
const prompt = ai.definePrompt({
  name: 'personalizedConnectionRecommendationsPrompt',
  input: {schema: PersonalizedConnectionRecommendationsInputSchema},
  output: {schema: PersonalizedConnectionRecommendationsOutputSchema},
  prompt: `You are an AI career networking assistant. Your goal is to provide highly tailored alumni connection recommendations to help users achieve their specific career goals.

Analyze the user's profile, explicitly stated career interests, and any implied career goals.
Suggest a list of alumni connections who are particularly well-suited to help with these specific goals, whether for networking, mentorship, or insights.
For each suggestion, provide a detailed reasoning that clearly links the alumnus's profile/experience to the user's stated interests and goals.

User Profile:
{{{userProfile}}}

Career Interests & Goals:
{{{careerInterests}}}

Output in JSON format with 'suggestedConnections' (an array of alumni names or IDs) and 'reasoning' (a comprehensive explanation for the suggestions, tying them to the user's goals).
  `,
});

const personalizedConnectionRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedConnectionRecommendationsFlow',
    inputSchema: PersonalizedConnectionRecommendationsInputSchema,
    outputSchema: PersonalizedConnectionRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate connection recommendations.");
    }
    return output;
  }
);
*/
