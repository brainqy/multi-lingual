
'use server';
/**
 * @fileOverview Suggests dynamic skills for a user based on their current skills and a given context.
 *
 * - suggestDynamicSkills - A function that suggests skills.
 * - SuggestDynamicSkillsInput - The input type.
 * - SuggestDynamicSkillsOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDynamicSkillsInputSchema = z.object({
  currentSkills: z.array(z.string()).describe("A list of the user's current skills."),
  contextText: z.string().describe("Contextual information, such as a job description the user is viewing, topics they engaged with, or their career interests and bio. This text will be used to derive relevant skill suggestions."),
});
export type SuggestDynamicSkillsInput = z.infer<typeof SuggestDynamicSkillsInputSchema>;

const SuggestedSkillSchema = z.object({
  skill: z.string().describe("The name of the suggested skill."),
  reasoning: z.string().describe("An explanation of why this skill is suggested based on the context and the user's current skills."),
  relevanceScore: z.number().min(0).max(100).describe("A score (0-100) indicating how relevant this skill suggestion is."),
});

const SuggestDynamicSkillsOutputSchema = z.object({
  suggestedSkills: z.array(SuggestedSkillSchema).describe("A list of suggested skills for the user to consider adding to their profile, sorted by relevance."),
});
export type SuggestDynamicSkillsOutput = z.infer<typeof SuggestDynamicSkillsOutputSchema>;

export async function suggestDynamicSkills(
  input: SuggestDynamicSkillsInput
): Promise<SuggestDynamicSkillsOutput> {
  return suggestDynamicSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDynamicSkillsPrompt',
  input: {schema: SuggestDynamicSkillsInputSchema},
  output: {schema: SuggestDynamicSkillsOutputSchema},
  prompt: `You are an AI career development assistant. Your task is to analyze a user's current skills and a provided contextual text (like a job description, their bio, or topics of interest).
Based on this, suggest new skills the user could add to their profile that would be relevant and beneficial for their career development.
For each suggested skill, provide:
1.  The 'skill' name.
2.  A 'reasoning' explaining why this skill is relevant given their current skills and the context.
3.  A 'relevanceScore' (0-100) indicating how important or fitting this skill suggestion is.

Do not suggest skills that are already in the user's current skills list.

User's Current Skills:
{{#if currentSkills}}
{{#each currentSkills}}
- {{{this}}}
{{/each}}
{{else}}
User has not listed any current skills.
{{/if}}

Contextual Information:
{{{contextText}}}

Please return up to 5 highly relevant skill suggestions, sorted by relevanceScore in descending order.
Ensure the output is in the specified JSON format.
`,
});

const suggestDynamicSkillsFlow = ai.defineFlow(
  {
    name: 'suggestDynamicSkillsFlow',
    inputSchema: SuggestDynamicSkillsInputSchema,
    outputSchema: SuggestDynamicSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (!output) {
        throw new Error("AI failed to generate skill suggestions.");
    }
    return output;
  }
);
