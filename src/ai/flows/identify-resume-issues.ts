
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

export const IdentifyResumeIssuesInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The text content of the job description.'),
});
export type IdentifyResumeIssuesInput = z.infer<typeof IdentifyResumeIssuesInputSchema>;

const UserInputActionSchema = z.object({
    type: z.enum(['missingQuantification', 'missingSkill', 'unclearExperience', 'other']),
    detail: z.string().describe("A clear, user-facing prompt explaining what information is needed. E.g., 'Your experience leading a team at XYZ is mentioned, but lacks specifics. How large was the team?'"),
    suggestion: z.string().optional().describe("A specific skill or keyword the user might want to add. E.g., 'TypeScript'"),
});

export const IdentifyResumeIssuesOutputSchema = z.object({
  fixableByAi: z.array(z.string()).describe("A list of issues the AI can likely fix automatically. E.g., 'Rephrase passive voice to active voice', 'Correct grammatical errors', 'Improve conciseness in the summary section'"),
  requiresUserInput: z.array(UserInputActionSchema).describe("A list of issues that require the user to provide more information before the AI can effectively rewrite the resume."),
});
export type IdentifyResumeIssuesOutput = z.infer<typeof IdentifyResumeIssuesOutputSchema>;

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

2.  **requiresUserInput**: Issues where the AI needs specific information from the user to make a meaningful improvement. For each of these, provide a clear prompt ('detail') for the user and classify its 'type'.
    - **missingQuantification**: The user mentioned an achievement but did not include numbers. Prompt: "In your role at [Company], you mentioned 'increased efficiency'. By how much? (e.g., 15%, 2 hours/week)"
    - **unclearExperience**: A role or project is vague. Prompt: "Your 'Special Project' at [Company] is mentioned. Can you provide more details on what the project was and what your specific responsibilities were?"
    - **missingSkill**: A key skill from the job description is missing from the resume. Prompt: "The job description emphasizes 'TypeScript'. Do you have experience with this? If so, where in your resume can it be added?" Include the missing skill in the 'suggestion' field.
    - **other**: Any other prompt that requires user input.

Analyze the following resume and job description. Provide a concise list for both categories.

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
