
'use server';
/**
 * @fileOverview Generates a new resume variant based on existing resume text and user preferences.
 *
 * - generateResumeVariant - A function that handles the resume variant generation.
 * - GenerateResumeVariantInput - The input type for the generateResumeVariant function.
 * - GenerateResumeVariantOutput - The return type for the generateResumeVariant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeVariantInputSchema = z.object({
  baseResumeText: z.string().describe('The original resume text to be adapted.'),
  targetRole: z.string().describe('The desired job title or role for the new resume variant.'),
  targetIndustry: z.string().optional().describe('The target industry for the new resume variant.'),
  skillsToHighlight: z.array(z.string()).optional().describe('Specific skills to emphasize in the new resume variant.'),
  tone: z.enum(['professional', 'creative', 'concise', 'technical']).default('professional').describe('The desired tone for the new resume variant.'),
  additionalInstructions: z.string().optional().describe('Any other specific instructions for the AI.'),
});
export type GenerateResumeVariantInput = z.infer<typeof GenerateResumeVariantInputSchema>;

const GenerateResumeVariantOutputSchema = z.object({
  generatedResumeText: z.string().describe('The newly generated resume text.'),
  // Optional: Could add a brief summary of changes made by the AI
  // summaryOfChanges: z.string().optional().describe('A brief summary of how the resume was adapted.'),
});
export type GenerateResumeVariantOutput = z.infer<typeof GenerateResumeVariantOutputSchema>;

export async function generateResumeVariant(
  input: GenerateResumeVariantInput
): Promise<GenerateResumeVariantOutput> {
  return generateResumeVariantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeVariantPrompt',
  input: {schema: GenerateResumeVariantInputSchema},
  output: {schema: GenerateResumeVariantOutputSchema},
  prompt: `You are an expert resume writer. Your task is to adapt the provided base resume text to create a new variant tailored for a specific job role and industry.

Base Resume Text:
{{{baseResumeText}}}

Target Role: {{{targetRole}}}
{{#if targetIndustry}}Target Industry: {{{targetIndustry}}}{{#endif}}
Desired Tone: {{{tone}}}

{{#if skillsToHighlight}}
Skills to specifically highlight and emphasize (ensure these are naturally woven into the experience or skills sections):
{{#each skillsToHighlight}}
- {{{this}}}
{{#each}}{{#endif}}

{{#if additionalInstructions}}
Additional Instructions: {{{additionalInstructions}}}{{#endif}}

Please generate a new, complete resume text based on these requirements. Ensure the output is well-formatted and reads naturally.
Focus on rephrasing, reordering, and highlighting existing information from the base resume to best fit the target role and industry.
Do not invent new experiences or qualifications not present in the base resume.
The generated resume should be ready to be copy-pasted.
`,
});

const generateResumeVariantFlow = ai.defineFlow(
  {
    name: 'generateResumeVariantFlow',
    inputSchema: GenerateResumeVariantInputSchema,
    outputSchema: GenerateResumeVariantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a resume variant.");
    }
    return output;
  }
);
