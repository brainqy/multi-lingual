'use server';
/**
 * @fileOverview Generates a blog post based on a given topic using AI.
 *
 * - generateAiBlogPost - A function that handles the blog post generation.
 * - GenerateAiBlogPostInput - The input type for the generateAiBlogPost function.
 * - GenerateAiBlogPostOutput - The return type for the generateAiBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiBlogPostInputSchema = z.object({
  topic: z.string().describe('The main topic or theme for the blog post.'),
  style: z.enum(['informative', 'casual', 'formal', 'technical', 'storytelling']).optional().default('informative').describe('The desired writing style for the blog post.'),
  targetAudience: z.string().optional().describe('The intended audience for the blog post (e.g., students, professionals, beginners).'),
  keywords: z.array(z.string()).optional().describe('A list of keywords to try and include in the blog post for SEO or focus.'),
});
export type GenerateAiBlogPostInput = z.infer<typeof GenerateAiBlogPostInputSchema>;

const GenerateAiBlogPostOutputSchema = z.object({
  title: z.string().describe('The generated title for the blog post.'),
  content: z.string().describe('The main content of the blog post (Markdown or plain text).'),
  excerpt: z.string().describe('A short summary or excerpt of the blog post (around 150-200 characters).'),
  suggestedTags: z.array(z.string()).describe('A list of suggested tags or categories for the blog post.'),
});
export type GenerateAiBlogPostOutput = z.infer<typeof GenerateAiBlogPostOutputSchema>;

export async function generateAiBlogPost(
  input: GenerateAiBlogPostInput
): Promise<GenerateAiBlogPostOutput> {
  return generateAiBlogPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiBlogPostPrompt',
  input: {schema: GenerateAiBlogPostInputSchema},
  output: {schema: GenerateAiBlogPostOutputSchema},
  prompt: `You are an expert blog post writer for an Alumni Engagement Platform called "ResumeMatch AI".
Your task is to write an engaging and informative blog post on the topic: {{{topic}}}.

Writing Style: {{{style}}}
{{#if targetAudience}}Target Audience: {{{targetAudience}}}{{#endif}}
{{#if keywords}}
Focus Keywords to include if relevant:
{{#each keywords}}
- {{{this}}}
{{/each}}
{{/if}}

Please generate the following for the blog post:
1.  A compelling 'title'.
2.  The main 'content' of the blog post. Aim for approximately 300-500 words. Structure it with clear paragraphs, and use Markdown for formatting like headings (## for H2, ### for H3), bold text, and bullet points if appropriate. Ensure the content is relevant to career development, job searching, networking, or topics beneficial to alumni and students.
3.  A concise 'excerpt' (around 150-200 characters) summarizing the post.
4.  A list of 3-5 relevant 'suggestedTags' (lowercase, single words or short phrases).

Ensure the content is original, well-written, and provides value to the reader.
The platform helps users with resume analysis, job tracking, alumni connections, and career development. You can subtly weave in how ResumeMatch AI might help with the topic if it feels natural, but the primary focus should be the topic itself.
`,
});

const generateAiBlogPostFlow = ai.defineFlow(
  {
    name: 'generateAiBlogPostFlow',
    inputSchema: GenerateAiBlogPostInputSchema,
    outputSchema: GenerateAiBlogPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a blog post.");
    }
    // Ensure excerpt is within typical limits, if AI generates too long.
    if (output.excerpt.length > 220) {
        output.excerpt = output.excerpt.substring(0, 217) + "...";
    }
    return output;
  }
);