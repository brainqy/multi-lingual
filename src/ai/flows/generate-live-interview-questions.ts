'use server';
/**
 * @fileOverview Generates relevant interview questions on-the-fly for an interviewer during a live session.
 *
 * - generateLiveInterviewQuestions - A function that handles live question generation.
 * - GenerateLiveInterviewQuestionsInput - The input type.
 * - GenerateLiveInterviewQuestionsOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { InterviewQuestionCategory, InterviewQuestionDifficulty } from '@/types';

// Re-importing or ensuring these types are available if they are defined in '@/types'
const ALL_CATEGORIES_ZOD = z.enum(['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR']);
const ALL_DIFFICULTIES_ZOD = z.enum(['Easy', 'Medium', 'Hard']);


const GenerateLiveInterviewQuestionsInputSchema = z.object({
  jobTitle: z.string().optional().describe('The job title the candidate is being interviewed for. Provides context.'),
  interviewTopics: z.array(z.string()).optional().describe('Specific topics or skills to focus on for questions.'),
  companyCulture: z.string().optional().describe('Brief description of company culture to tailor behavioral questions if possible.'),
  previousQuestions: z.array(z.string()).optional().describe('A list of questions already asked in this session to avoid repetition.'),
  candidateSkills: z.array(z.string()).optional().describe("Key skills listed on the candidate's resume or profile."),
  difficulty: ALL_DIFFICULTIES_ZOD.optional().describe('Desired difficulty for the suggested questions.'),
  count: z.number().min(1).max(5).optional().default(3).describe('Number of questions to generate (1-5).'),
});
export type GenerateLiveInterviewQuestionsInput = z.infer<typeof GenerateLiveInterviewQuestionsInputSchema>;

const SuggestedQuestionSchema = z.object({
  questionText: z.string().describe("The generated interview question."),
  category: ALL_CATEGORIES_ZOD.optional().describe("Suggested category for the question."),
  followUpSuggestions: z.array(z.string()).optional().describe("Optional follow-up questions or probing points related to this question."),
});

const GenerateLiveInterviewQuestionsOutputSchema = z.object({
  suggestedQuestions: z.array(SuggestedQuestionSchema).describe("A list of suggested questions for the interviewer."),
});
export type GenerateLiveInterviewQuestionsOutput = z.infer<typeof GenerateLiveInterviewQuestionsOutputSchema>;


export async function generateLiveInterviewQuestions(
  input: GenerateLiveInterviewQuestionsInput
): Promise<GenerateLiveInterviewQuestionsOutput> {
  return generateLiveInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLiveInterviewQuestionsPrompt',
  input: { schema: GenerateLiveInterviewQuestionsInputSchema },
  output: { schema: GenerateLiveInterviewQuestionsOutputSchema },
  prompt: `You are an expert Interview Question Generator assisting an interviewer during a LIVE interview session.
The goal is to provide a few highly relevant and insightful questions based on the current context.
Do NOT repeat questions from the 'previousQuestions' list.

Interview Context:
{{#if jobTitle}}Job Title: {{{jobTitle}}}{{/if}}
{{#if interviewTopics}}Focus Topics/Skills: {{#each interviewTopics}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if companyCulture}}Company Culture Notes: {{{companyCulture}}}{{/if}}
{{#if candidateSkills}}Candidate's Key Skills: {{#each candidateSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if difficulty}}Desired Question Difficulty: {{{difficulty}}}{{/if}}

{{#if previousQuestions.length}}
Questions Already Asked (Do NOT repeat these exact questions):
{{#each previousQuestions}}
- {{{this}}}
{{/each}}
{{/if}}

Please generate {{{count}}} new, distinct questions. For each question:
1.  'questionText': The main question.
2.  'category': (Optional) The most fitting category (e.g., Behavioral, Technical, Role-Specific, Coding, Analytical).
3.  'followUpSuggestions': (Optional) 1-2 brief follow-up questions the interviewer could ask to probe deeper.

Focus on open-ended questions that encourage detailed responses. If technical or coding, ensure they are appropriate for a live discussion rather than an offline assignment.
Prioritize relevance to the job title, focus topics, and candidate skills if provided.
Output strictly in the JSON format defined by the schema.
`,
});

const generateLiveInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateLiveInterviewQuestionsFlow',
    inputSchema: GenerateLiveInterviewQuestionsInputSchema,
    outputSchema: GenerateLiveInterviewQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output || !output.suggestedQuestions) {
      // Consider a more graceful fallback or specific error
      throw new Error("AI failed to generate live interview questions.");
    }
    // Ensure the AI respects the count, sometimes it might generate more/less
    output.suggestedQuestions = output.suggestedQuestions.slice(0, input.count || 3);
    return output;
  }
);
