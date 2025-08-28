
'use server';
/**
 * @fileOverview Generates mock interview questions for a given topic or job description.
 *
 * - generateMockInterviewQuestions - A function that handles question generation.
 * - GenerateMockInterviewQuestionsInput - The input type.
 * - GenerateMockInterviewQuestionsOutput - The return type.
 */

import { genkit } from 'genkit';
import { z } from 'genkit';
import { getGoogleAIPlugin, AI_PROMPT_CONFIG } from '@/ai/genkit';
import type { MockInterviewQuestion, InterviewQuestionCategory, InterviewQuestionDifficulty } from '@/types';

const logger = { // Simple logger for server-side visibility
  info: (message: string, ...args: any[]) => console.log(`[AI FLOW INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[AI FLOW WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[AI FLOW ERROR] ${message}`, ...args),
};

const ALL_CATEGORIES_ZOD = z.enum(['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR', 'Situational', 'Problem-Solving']);

const MockInterviewQuestionSchema = z.object({
  id: z.string().describe("Unique identifier for the question."),
  questionText: z.string().describe("The text of the interview question."),
  category: ALL_CATEGORIES_ZOD.optional().describe("Category of the question (e.g., Behavioral, Technical, Situational, Analytical, HR)."),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'] as [InterviewQuestionDifficulty, ...InterviewQuestionDifficulty[]]).optional().describe("Difficulty level of the question."),
});

const BaseInputSchema = z.object({
  topic: z.string().describe('The main topic, role, or area for the interview (e.g., "Software Engineering", "Product Management", "Java Backend Developer").'),
  jobDescriptionText: z.string().optional().describe('The full job description text to tailor questions to. If provided, questions will be more specific to the role.'),
  numQuestions: z.number().min(1).max(50).default(5).optional().describe('The desired number of questions to generate (default 5, max 50).'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium').optional().describe('The desired difficulty level of the questions (default medium). This will guide the AI in selecting appropriate questions.'),
  timerPerQuestion: z.number().min(0).max(300).optional().describe('Optional: Suggested time in seconds for answering each question. 0 or undefined means no timer.'),
  questionCategories: z.array(z.string()).optional().describe('Optional: Specific categories of questions to focus on (e.g., ["Technical", "Behavioral"]).'),
});
const GenerateMockInterviewQuestionsInputSchema = BaseInputSchema.extend({
  apiKey: z.string().optional(),
});
export type GenerateMockInterviewQuestionsInput = z.infer<typeof GenerateMockInterviewQuestionsInputSchema>;

const GenerateMockInterviewQuestionsOutputSchema = z.object({
  questions: z.array(MockInterviewQuestionSchema).describe("A list of generated mock interview questions."),
});
export type GenerateMockInterviewQuestionsOutput = z.infer<typeof GenerateMockInterviewQuestionsOutputSchema>;


export async function generateMockInterviewQuestions(
  input: GenerateMockInterviewQuestionsInput
): Promise<GenerateMockInterviewQuestionsOutput> {
  logger.info("Calling generateMockInterviewQuestions with input:", input);
  
  const customAI = genkit({
    plugins: [getGoogleAIPlugin(input.apiKey)],
    model: 'googleai/gemini-2.0-flash',
  });

  const prompt = customAI.definePrompt({
    name: 'generateMockInterviewQuestionsPrompt',
    input: { schema: BaseInputSchema },
    output: { schema: GenerateMockInterviewQuestionsOutputSchema },
    config: AI_PROMPT_CONFIG,
    prompt: `You are an expert Interview Question Generator. Your task is to create a set of diverse and relevant mock interview questions based on the provided criteria.

Topic/Role: {{{topic}}}
{{#if jobDescriptionText}}}
Job Description:
{{{jobDescriptionText}}}
{{else}}
No specific job description provided. Generate general questions for the topic/role.
{{/if}}
Number of Questions to Generate: {{{numQuestions}}}
Desired Difficulty Level: {{{difficulty}}} (The AI should aim to generate questions of this difficulty, e.g., 'Easy', 'Medium', 'Hard')

{{#if questionCategories.length}}
Focus on generating questions from the following categories:
{{#each questionCategories}}
- {{{this}}}
{{/each}}
If not possible to generate all questions from these categories, supplement with other relevant types.
{{else}}
Include a mix of question types (e.g., Behavioral, Technical, Situational, Analytical, HR) if appropriate for the topic.
{{/if}}

Instructions:
1.  Generate exactly {{{numQuestions}}} questions. If you cannot generate that many relevant questions based on the input, generate as many as you can up to that number.
2.  For each question, assign a 'difficulty' level ('Easy', 'Medium', or 'Hard') that matches the overall desired difficulty ({{{difficulty}}}) as closely as possible. If a specific difficulty isn't obvious, default to 'Medium'.
3.  If a job description is provided, tailor questions to the skills, responsibilities, and technologies mentioned in it.
4.  If no job description, create general questions relevant to the {{{topic}}}.
5.  Assign a 'category' to each question (e.g., Behavioral, Technical, Analytical, HR, Common, Role-Specific, Situational, Problem-Solving). If unsure, use "Common".
6.  Each question should have a unique 'id' (e.g., "q1", "q2", or a more descriptive unique ID like "tech_java_001").
7.  Ensure 'questionText' is clear and concise.
8.  If you cannot generate any relevant questions, return an empty "questions" array in the JSON.

Output strictly in the JSON format defined by the schema. Ensure each question has an 'id', 'questionText', a relevant 'category', and a 'difficulty' field.
Example for empty: { "questions": [] }
`,
  });
  
  try {
    const aiResponse = await prompt(input);
    const output = aiResponse.output;

    if (!output || !output.questions) {
        logger.warn("generateMockInterviewQuestions returned null or no questions. Returning empty questions array.");
        return { questions: [] };
    }

    // Ensure IDs are unique and difficulty/category have defaults if AI misses them
    const processedQuestions = output.questions.map((q, index) => {
      const defaultDifficulty = (input.difficulty?.charAt(0).toUpperCase() + input.difficulty!.slice(1)) as InterviewQuestionDifficulty || 'Medium';
      return {
          ...q,
          id: q.id || `gen_q_${Date.now()}_${index + 1}`, // More unique ID
          category: q.category || "Common",
          difficulty: (q.difficulty ? (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)) : defaultDifficulty) as InterviewQuestionDifficulty,
      };
    });
    logger.info(`generateMockInterviewQuestions processed ${processedQuestions.length} questions.`);
    return { questions: processedQuestions as MockInterviewQuestion[] };

  } catch (flowError: any) {
    logger.error("Error in generateMockInterviewQuestions execution:", flowError);
    return { questions: [] }; // Return empty questions on error
  }
}
