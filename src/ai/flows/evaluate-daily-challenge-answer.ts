'use server';
/**
 * @fileOverview Evaluates a user's answer to a daily interview challenge question.
 *
 * - evaluateDailyChallengeAnswer - A function that handles answer evaluation.
 * - EvaluateDailyChallengeAnswerInput - The input type.
 * - EvaluateDailyChallengeAnswerOutput - The return type.
 */

import { genkit } from 'genkit';
import { z } from 'genkit';
import { getGoogleAIPlugin } from '@/ai/genkit';
import { EvaluateDailyChallengeAnswerInputSchema as BaseInputSchema, EvaluateDailyChallengeAnswerOutputSchema, type EvaluateDailyChallengeAnswerOutput } from '@/types';
import { AIError } from '@/lib/exceptions';

const EvaluateDailyChallengeAnswerInputSchema = BaseInputSchema.extend({
  apiKey: z.string().optional(),
});
export type EvaluateDailyChallengeAnswerInput = z.infer<typeof EvaluateDailyChallengeAnswerInputSchema>;

export async function evaluateDailyChallengeAnswer(
  input: EvaluateDailyChallengeAnswerInput
): Promise<EvaluateDailyChallengeAnswerOutput> {
  const customAI = genkit({
    plugins: [getGoogleAIPlugin(input.apiKey)],
    model: 'googleai/gemini-2.0-flash',
  });

  const prompt = customAI.definePrompt({
    name: 'evaluateDailyChallengeAnswerPrompt',
    input: { schema: BaseInputSchema },
    output: { schema: EvaluateDailyChallengeAnswerOutputSchema },
    prompt: `You are an expert Interview Coach AI. Your task is to evaluate a user's answer to a daily interview challenge question and provide feedback and a score.

Question Asked:
{{{question}}}

User's Answer:
{{{answer}}}

{{#if solution}}
Ideal Solution/Key Points for Reference:
{{{solution}}}
{{/if}}

Evaluation Criteria:
1.  **Correctness:** Does the answer correctly solve the problem or answer the question?
2.  **Clarity & Conciseness:** Is the answer clear and to the point?
3.  **Completeness:** Does it cover the main points expected?

Based on this, provide:
- 'feedback': Constructive feedback on the answer. If the answer is wrong, gently explain why and guide towards the correct solution.
- 'score': A score from 0-100. A score above 80 indicates a strong, correct answer.
- 'isCorrect': A boolean set to true if the answer is fundamentally correct, otherwise false.

Output strictly in the JSON format defined by the schema.
`,
  });

  const { output } = await prompt(input);
  if (!output) {
      throw new AIError("AI failed to evaluate the daily challenge answer.");
  }
  return output;
}
