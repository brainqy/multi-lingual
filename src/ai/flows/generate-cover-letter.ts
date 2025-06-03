
'use server';
/**
 * @fileOverview Generates a personalized cover letter based on user profile and job description.
 *
 * - generateCoverLetter - A function that handles cover letter generation.
 * - GenerateCoverLetterInput - The input type for the generateCoverLetter function.
 * - GenerateCoverLetterOutput - The return type for the generateCoverLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverLetterInputSchema = z.object({
  userProfileText: z.string().describe('A summary of the user\'s profile, including key skills, experience, and bio.'),
  jobDescriptionText: z.string().describe('The full text of the job description the user is applying for.'),
  companyName: z.string().describe('The name of the company to address the cover letter to.'),
  jobTitle: z.string().describe('The specific job title being applied for.'),
  userName: z.string().describe('The name of the user applying.'),
  additionalNotes: z.string().optional().describe('Any specific points the user wants to include or emphasize in the cover letter.'),
});
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  generatedCoverLetterText: z.string().describe('The generated cover letter text.'),
});
export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

export async function generateCoverLetter(
  input: GenerateCoverLetterInput
): Promise<GenerateCoverLetterOutput> {
  return generateCoverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  input: {schema: GenerateCoverLetterInputSchema},
  output: {schema: GenerateCoverLetterOutputSchema},
  prompt: `You are an expert career coach specializing in writing compelling cover letters.
Your task is to generate a personalized cover letter for {{{userName}}} who is applying for the role of {{{jobTitle}}} at {{{companyName}}}.

User Profile Information:
{{{userProfileText}}}

Job Description:
{{{jobDescriptionText}}}

{{#if additionalNotes}}
Specific points to include or emphasize:
{{{additionalNotes}}}{{#endif}}

Please write a professional and engaging cover letter.
The letter should:
1.  Clearly state the position being applied for ({{{jobTitle}}}).
2.  Highlight relevant skills and experiences from the user's profile that match the job description.
3.  Express genuine interest in the company ({{{companyName}}}) and the specific role.
4.  Maintain a professional tone.
5.  Be concise and to the point, typically 3-4 paragraphs.
6.  Conclude with a call to action (e.g., expressing eagerness for an interview).
7.  The cover letter should be ready to be copy-pasted. Ensure proper formatting, including salutation and closing.

Address the letter appropriately if a hiring manager name is available, otherwise use a general salutation.
End the letter with {{{userName}}}'s name.
`,
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (!output) {
        throw new Error("AI failed to generate a cover letter.");
    }
    return output;
  }
);
