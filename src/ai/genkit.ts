
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

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
  const pluginParams: { apiKey?: string } = {};
  if (apiKey) {
    pluginParams.apiKey = apiKey;
  }
  return googleAI(pluginParams);
}
