'use server';
/**
 * @fileOverview Generates overall feedback for a mock interview session based on a series of evaluated answers.
 *
 * - generateOverallInterviewFeedback - A function that handles overall feedback generation.
 * - GenerateOverallInterviewFeedbackInput - The input type.
 * - GenerateOverallInterviewFeedbackOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GenerateOverallInterviewFeedbackInput, GenerateOverallInterviewFeedbackOutput } from '@/types';

const EvaluatedAnswerSchema = z.object({
    questionText: z.string(),
    userAnswer: z.string(),
    feedback: z.string(),
    score: z.number().min(0).max(100),
});

const GenerateOverallInterviewFeedbackInputSchema = z.object({
  topic: z.string().describe("The main topic or role of the interview session."),
  jobDescription: z.string().optional().describe('The job description used for the interview, if any.'),
  evaluatedAnswers: z.array(EvaluatedAnswerSchema).describe("An array of questions, user answers, AI feedback, and scores for each question in the session."),
});

const GenerateOverallInterviewFeedbackOutputSchema = z.object({
  overallSummary: z.string().describe("A concise summary of the user's overall performance in the mock interview."),
  keyStrengths: z.array(z.string()).describe("Common themes or significant strengths observed across multiple answers."),
  keyAreasForImprovement: z.array(z.string()).describe("Recurring weaknesses or key areas the user should focus on improving."),
  finalTips: z.array(z.string()).describe("Actionable tips for the user to improve their interviewing skills based on this session."),
  overallScore: z.number().min(0).max(100).describe("An overall numerical score (0-100) for the entire interview session, typically an average or weighted average of individual question scores, adjusted for overall impression."),
});

export async function generateOverallInterviewFeedback(
  input: GenerateOverallInterviewFeedbackInput
): Promise<GenerateOverallInterviewFeedbackOutput> {
  return generateOverallInterviewFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOverallInterviewFeedbackPrompt',
  input: {schema: GenerateOverallInterviewFeedbackInputSchema},
  output: {schema: GenerateOverallInterviewFeedbackOutputSchema},
  prompt: `You are an expert Interview Coach AI. Your task is to provide comprehensive overall feedback for a mock interview session based on the user's performance on individual questions.

Interview Topic/Role: {{{topic}}}
{{#if jobDescription}}
Job Description Context:
{{{jobDescription}}}
{{/if}}

User's Performance on Individual Questions:
{{#each evaluatedAnswers}}
---
Question: {{{questionText}}}
User's Answer: {{{userAnswer}}}
AI Feedback: {{{feedback}}}
Score: {{{score}}}/100
---
{{/each}}

Based on the collective performance, please provide:
1.  'overallSummary': A concise summary (2-3 sentences) of the user's performance.
2.  'keyStrengths': Identify 2-3 prominent strengths demonstrated throughout the interview.
3.  'keyAreasForImprovement': Identify 2-3 main areas that need improvement across the answers.
4.  'finalTips': Offer 2-3 actionable tips for future interviews.
5.  'overallScore': Calculate an overall score (0-100) for the session. This should generally reflect the average of individual scores but can be adjusted based on overall coherence, consistency, or major flaws/strengths.

Focus on constructive, holistic feedback. Output strictly in the JSON format defined by the schema.
`,
});

const generateOverallInterviewFeedbackFlow = ai.defineFlow(
  {
    name: 'generateOverallInterviewFeedbackFlow',
    inputSchema: GenerateOverallInterviewFeedbackInputSchema,
    outputSchema: GenerateOverallInterviewFeedbackOutputSchema,
  },
  async input => {
    if (input.evaluatedAnswers.length === 0) {
        // Handle case with no answers, though ideally UI prevents this.
        return {
            overallSummary: "No answers were provided for this session.",
            keyStrengths: [],
            keyAreasForImprovement: ["Provide answers to questions to get feedback."],
            finalTips: ["Complete a full mock interview session."],
            overallScore: 0,
        };
    }
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate overall interview feedback.");
    }
    return output;
  }
);