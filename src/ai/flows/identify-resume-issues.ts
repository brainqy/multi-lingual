

'use server';
/**
 * @fileOverview Identifies actionable issues in a resume compared to a job description.
 * This flow categorizes issues into those the AI can fix and those requiring user input.
 *
 * - identifyResumeIssues - A function that handles the issue identification process.
 * - IdentifyResumeIssuesInput - The input type for the function.
 * - IdentifyResumeIssuesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  IdentifyResumeIssuesInputSchema,
  IdentifyResumeIssuesOutputSchema,
  type IdentifyResumeIssuesInput, 
  type IdentifyResumeIssuesOutput,
} from '@/types';

export async function identifyResumeIssues(input: IdentifyResumeIssuesInput): Promise<IdentifyResumeIssuesOutput> {
  const result = await identifyIssuesFlow(input);
  // Ensure we always return a valid structure, even if the AI fails
  return {
    fixableByAi: result?.fixableByAi || ["Review for grammar and tone improvements."],
    requiresUserInput: result?.requiresUserInput || [{type: 'other', detail: "Review your resume to ensure all achievements are quantified with numbers where possible."}]
  };
}

const prompt = ai.definePrompt({
  name: 'identifyResumeIssuesPrompt',
  input: {schema: IdentifyResumeIssuesInputSchema},
  output: {schema: IdentifyResumeIssuesOutputSchema},
  prompt: `You are an expert resume analyst. Your task is to identify actionable issues in a resume when compared against a job description. Categorize these issues into two types:

1.  **fixableByAi**: General improvements the AI can make without more user information. Examples include:
    - "Correct spelling and grammar."
    - "Improve sentence structure for better flow."
    - "Rewrite passive voice sentences into active voice."
    - "Enhance action verbs to be more impactful."

2.  **requiresUserInput**: Issues where the AI needs specific information from the user to make a meaningful improvement. For each of these, provide a clear, user-facing prompt ('detail') for the user and classify its 'type'.
    - **missingContactInfo**: The resume is missing key contact information like a phone number, email, or physical address. Prompt: "Your resume appears to be missing a [phone number/email/address]. Would you like to add one?" The 'suggestion' field is not typically needed for this type.
    - **missingQuantification**: The user mentioned an achievement but did not include numbers. Prompt: "In your role at [Company], you mentioned 'increased efficiency'. By how much? (e.g., 15%, 2 hours/week)"
    - **unclearExperience**: A role or project is vague. Prompt: "Your 'Special Project' at [Company] is mentioned. Can you provide more details on what the project was and what your specific responsibilities were?"
    - **missingSkill**: A key skill from the job description is missing from the resume. Prompt: "The job description emphasizes 'TypeScript'. Do you have experience with this? If so, where in your resume can it be added?" Include the missing skill in the 'suggestion' field.
    - **missingSection**: A key section like a Professional Summary is missing. The prompt ('detail') should state this clearly. E.g., "The resume is missing a Professional Summary section." The 'suggestion' field should contain the name of the missing section, like "Summary".
    - **other**: Any other prompt that requires user input.

Analyze the following resume and job description. **Pay close attention to missing contact information (phone, email, address)** and other missing sections. Provide a concise list for both categories.

**Resume Text:**
{{{resumeText}}}

**Job Description:**
{{{jobDescription}}}
`,
});

const identifyIssuesFlow = ai.defineFlow(
  {
    name: 'identifyIssuesFlow',
    inputSchema: IdentifyResumeIssuesInputSchema,
    outputSchema: IdentifyResumeIssuesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
