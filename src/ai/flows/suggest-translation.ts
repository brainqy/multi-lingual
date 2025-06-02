// src/ai/flows/suggest-translation.ts
'use server';
/**
 * @fileOverview A translation suggestion AI agent.
 *
 * - suggestTranslation - A function that handles the translation suggestion process.
 * - SuggestTranslationInput - The input type for the suggestTranslation function.
 * - SuggestTranslationOutput - The return type for the suggestTranslation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTranslationInputSchema = z.object({
  text: z.string().describe('The word or sentence to translate.'),
});
export type SuggestTranslationInput = z.infer<typeof SuggestTranslationInputSchema>;

const SuggestTranslationOutputSchema = z.object({
  marathi: z.string().describe('The suggested translation in Marathi.'),
  hindi: z.string().describe('The suggested translation in Hindi.'),
  english: z.string().describe('The suggested translation in English.'),
});
export type SuggestTranslationOutput = z.infer<typeof SuggestTranslationOutputSchema>;

export async function suggestTranslation(input: SuggestTranslationInput): Promise<SuggestTranslationOutput> {
  return suggestTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTranslationPrompt',
  input: {schema: SuggestTranslationInputSchema},
  output: {schema: SuggestTranslationOutputSchema},
  prompt: `You are a multilingual translation expert. Provide translations of the given text in Marathi, Hindi, and English.

Text to translate: {{{text}}}

Translations:
Marathi: {{marathi}}
Hindi: {{hindi}}
English: {{english}}`,
});

const suggestTranslationFlow = ai.defineFlow(
  {
    name: 'suggestTranslationFlow',
    inputSchema: SuggestTranslationInputSchema,
    outputSchema: SuggestTranslationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
