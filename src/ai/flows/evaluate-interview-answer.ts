'use server';
/**
 * @fileOverview Evaluates a user's answer to a mock interview question.
 *
 * - evaluateInterviewAnswer - A function that handles answer evaluation.
 * - EvaluateInterviewAnswerInput - The input type.
 * - EvaluateInterviewAnswerOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { EvaluateInterviewAnswerInput, EvaluateInterviewAnswerOutput } from '@/types';

const EvaluateInterviewAnswerInputSchema = z.object({
  questionText: z.string().describe("The interview question that was asked."),
  userAnswer: z.string().describe("The user's answer to the question."),
  topic: z.string().optional().describe("The general topic or role of the interview for context (e.g., 'Java Developer', 'Behavioral Interview')."),
  jobDescription: z.string().optional().describe('The job description, if available, for context in evaluating the answer.'),
});

const EvaluateInterviewAnswerOutputSchema = z.object({
  feedback: z.string().describe("Overall constructive feedback on the user's answer. Should be polite and helpful."),
  strengths: z.array(z.string()).optional().describe("Specific strengths identified in the answer."),
  areasForImprovement: z.array(z.string()).optional().describe("Specific areas where the answer could be improved."),
  score: z.number().min(0).max(100).describe("A numerical score (0-100) evaluating the quality of the answer based on relevance, clarity, completeness, and correctness (if applicable)."),
  suggestedImprovements: z.array(z.string()).optional().describe("Concrete suggestions for how the user could rephrase or add to their answer to make it stronger."),
});

export async function evaluateInterviewAnswer(
  input: EvaluateInterviewAnswerInput
): Promise<EvaluateInterviewAnswerOutput> {
  return evaluateInterviewAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateInterviewAnswerPrompt',
  input: {schema: EvaluateInterviewAnswerInputSchema},
  output: {schema: EvaluateInterviewAnswerOutputSchema},
  prompt: `You are an expert Interview Coach AI. Your task is to evaluate a user's answer to a mock interview question and provide constructive feedback.

Context:
{{#if topic}}Interview Topic/Role: {{{topic}}}{{/if}}
{{#if jobDescription}}
Relevant Job Description:
{{{jobDescription}}}
{{/if}}

Question Asked:
{{{questionText}}}

User's Answer:
{{{userAnswer}}}

Evaluation Criteria:
1.  **Relevance:** Does the answer directly address the question?
2.  **Clarity:** Is the answer clear, concise, and easy to understand?
3.  **Completeness:** Does the answer cover the key aspects expected for such a question?
4.  **Structure:** Is the answer well-structured (e.g., using STAR method for behavioral questions if applicable)?
5.  **Positivity & Professionalism:** Is the tone appropriate?
6.  **Specifics & Examples:** Does the user provide concrete examples or details where appropriate?
7.  **(If applicable) Correctness:** For technical questions, is the information accurate?

Provide the following:
-   'feedback': Overall constructive feedback.
-   'strengths': (Optional) 2-3 specific positive points about the answer.
-   'areasForImprovement': (Optional) 2-3 specific areas that could be better.
-   'score': A numerical score from 0 to 100.
-   'suggestedImprovements': (Optional) 1-2 concrete suggestions for rephrasing or adding content.

Be encouraging and aim to help the user improve. Output strictly in the JSON format defined by the schema.
`,
});

const evaluateInterviewAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateInterviewAnswerFlow',
    inputSchema: EvaluateInterviewAnswerInputSchema,
    outputSchema: EvaluateInterviewAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to evaluate the interview answer.");
    }
    return output;
  }
);