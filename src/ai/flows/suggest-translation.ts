
'use server';
// src/ai/flows/suggest-translation.ts
/**
 * @fileOverview A translation suggestion AI agent.
 *
 * - suggestTranslation - A function that handles the translation suggestion process.
 * - SuggestTranslationInput - The input type for the suggestTranslation function.
 * - SuggestTranslationOutput - The return type for the suggestTranslation function.
 */

import { genkit } from 'genkit';
import { z } from 'genkit';
import { getGoogleAIPlugin } from '@/ai/genkit';

const BaseInputSchema = z.object({
  text: z.string().describe('The word or sentence to translate.'),
});
const SuggestTranslationInputSchema = BaseInputSchema.extend({
  apiKey: z.string().optional(),
});
export type SuggestTranslationInput = z.infer<typeof SuggestTranslationInputSchema>;

const SuggestTranslationOutputSchema = z.object({
  marathi: z.string().describe('The suggested translation in Marathi.'),
  hindi: z.string().describe('The suggested translation in Hindi.'),
  english: z.string().describe('The suggested translation in English.'),
});
export type SuggestTranslationOutput = z.infer<typeof SuggestTranslationOutputSchema>;

export async function suggestTranslation(input: SuggestTranslationInput): Promise<SuggestTranslationOutput> {
  const customAI = genkit({
    plugins: [getGoogleAIPlugin(input.apiKey)],
    model: 'googleai/gemini-2.0-flash',
  });

  const prompt = customAI.definePrompt({
    name: 'suggestTranslationPrompt',
    input: { schema: BaseInputSchema },
    output: { schema: SuggestTranslationOutputSchema },
    prompt: `You are a multilingual translation expert. Provide translations of the given text in Marathi, Hindi, and English.

Text to translate: {{{text}}}

Translations:
Marathi: {{marathi}}
Hindi: {{hindi}}
English: {{english}}`,
  });

  const { output } = await prompt(input);
  return output!;
}
