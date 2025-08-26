
'use server';
/**
 * @fileOverview Analyzes a resume and job description to identify matching skills, experience, and provide detailed feedback across various categories.
 *
 * - analyzeResumeAndJobDescription - A function that handles the analysis process.
 * - AnalyzeResumeAndJobDescriptionInput - The input type for the analyzeResumeAndJobDescription function.
 * - AnalyzeResumeAndJobDescriptionOutput - The return type for the analyzeResumeAndJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeResumeAndJobDescriptionInputSchema, AnalyzeResumeAndJobDescriptionOutputSchema, type AnalyzeResumeAndJobDescriptionOutput } from '@/types';
import { AIError, InvalidInputError } from '@/lib/exceptions';


export async function analyzeResumeAndJobDescription(
  input: z.infer<typeof AnalyzeResumeAndJobDescriptionInputSchema>
): Promise<AnalyzeResumeAndJobDescriptionOutput> {
  if (!input.resumeText?.trim() || !input.jobDescriptionText?.trim()) {
    throw new InvalidInputError("Resume text or Job Description text cannot be empty.");
  }
  
  const { output } = await analyzeResumeAndJobDescriptionPrompt(input);
  if (!output) {
      throw new AIError("AI analysis did not return any parsable output.");
  }
  return output;
}

const analyzeResumeAndJobDescriptionPrompt = ai.definePrompt({
  name: 'analyzeResumeAndJobDescriptionPrompt',
  input: {schema: AnalyzeResumeAndJobDescriptionInputSchema},
  output: {schema: AnalyzeResumeAndJobDescriptionOutputSchema},
  config: {
    safetySettings: [ 
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
  prompt: `You are an expert resume and job description analyst. Your task is to provide a comprehensive analysis of the given resume against the provided job description.

**Analysis Context:**
{{#if jobTitle}}Target Job Title: {{{jobTitle}}}{{/if}}
{{#if companyName}}Target Company: {{{companyName}}}{{/if}}

**Primary Analysis Task:**
Evaluate the resume based on all categories defined in the output schema, providing detailed feedback and scores.

**CRITICAL INSTRUCTION FOR 'searchabilityDetails':**
You MUST perform a specific, mandatory check for the following contact information within the resume text:
1.  **Phone Number**: Look for a phone number. Set \`hasPhoneNumber\` to \`true\` if found, \`false\` otherwise.
2.  **Email Address**: Look for an email address. Set \`hasEmail\` to \`true\` if found, \`false\` otherwise.
3.  **Physical Address**: Look for a physical address. City and State (e.g., "San Francisco, CA") are sufficient. Set \`hasAddress\` to \`true\` if found, \`false\` otherwise.
If any of these three are not found, you MUST set their corresponding boolean field to \`false\`. Do not omit this check.

If information is insufficient for any other field, you MUST provide default values (e.g., 0 for scores, empty arrays [] for lists, "N/A" for strings) to ensure a valid JSON output.

Resume Text:
{{{resumeText}}}

Job Description Text:
{{{jobDescriptionText}}}

**FINAL INSTRUCTION:** Your entire response MUST be a single, valid JSON object that strictly adheres to the AnalyzeResumeAndJobDescriptionOutputSchema. It is IMPERATIVE that all fields expected by the schema, including all nested optional objects and their fields, are present. If you cannot determine a value for a field, YOU MUST use a sensible default.`,
});
