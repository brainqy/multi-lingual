import { genkit, GenerationConfig } from 'genkit';
import { googleAI, GoogleAIBasicSafetySettings, GoogleAIPluginParams } from '@genkit-ai/googleai';

// Keep the global instance for flows that don't need user-specific keys
// or as a fallback.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

/**
 * Creates a Google AI plugin instance, optionally configured with a user's API key.
 * If no key is provided, it falls back to the server's default credentials.
 *
 * @param apiKey - The user-provided Gemini API key.
 * @returns A configured GoogleAI plugin instance.
 */
export function getGoogleAIPlugin(apiKey?: string) {
  const pluginParams: GoogleAIPluginParams = {};
  if (apiKey) {
    pluginParams.apiKey = apiKey;
  }
  return googleAI(pluginParams);
}

/**
 * Standard safety settings for all AI prompts to block harmful content.
 */
export const STANDARD_SAFETY_SETTINGS: GoogleAIBasicSafetySettings[] = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
];

/**
 * Common configuration for AI generation calls, including safety settings.
 */
export const AI_PROMPT_CONFIG: GenerationConfig = {
    safetySettings: STANDARD_SAFETY_SETTINGS,
};
