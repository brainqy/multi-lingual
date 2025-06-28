
/**
 * @fileOverview Analyzes a resume and job description to identify matching skills, experience, and provide detailed feedback across various categories.
 *
 * - analyzeResumeAndJobDescription - A function that handles the analysis process.
 * - AnalyzeResumeAndJobDescriptionInput - The input type for the analyzeResumeAndJobDescription function.
 * - AnalyzeResumeAndJobDescriptionOutput - The return type for the analyzeResumeAndJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeResumeAndJobDescriptionInputSchema, type AnalyzeResumeAndJobDescriptionOutput } from '@/types';

const SearchabilityDetailsSchema = z.object({
  hasPhoneNumber: z.boolean().optional().describe("Resume contains a phone number."),
  hasEmail: z.boolean().optional().describe("Resume contains an email address."),
  hasAddress: z.boolean().optional().describe("Resume contains a physical address (city, state is sufficient)."),
  jobTitleMatchesJD: z.boolean().optional().describe("Job title in resume aligns with or is found in the job description."),
  hasWorkExperienceSection: z.boolean().optional().describe("A distinct work experience section was identified."),
  hasEducationSection: z.boolean().optional().describe("A distinct education section was identified."),
  hasProfessionalSummary: z.boolean().optional().describe("Resume contains a professional summary or objective statement."),
  keywordDensityFeedback: z.string().optional().describe("Feedback on keyword density and relevance to the job description."),
});

const RecruiterTipItemSchema = z.object({
    category: z.string().describe("Category of the tip (e.g., Word Count, Action Verbs, Measurable Results)."),
    finding: z.string().describe("The specific finding or observation related to this tip."),
    status: z.enum(['positive', 'neutral', 'negative']).describe("Assessment of the finding (positive, neutral, negative)."),
    suggestion: z.string().optional().describe("A brief suggestion for improvement if status is neutral or negative."),
});

const AtsFormattingIssueSchema = z.object({
    issue: z.string().describe("The specific formatting issue identified."),
    recommendation: z.string().describe("A recommendation to address the issue."),
});

const AtsParsingConfidenceSchema = z.object({
    overall: z.number().min(0).max(100).optional().describe("Overall confidence score (0-100) for ATS parsing."),
    warnings: z.array(z.string()).optional().describe("Specific warnings or potential issues for ATS parsing."),
});

const QuantifiableAchievementDetailsSchema = z.object({
    score: z.number().min(0).max(100).optional().describe("Score for the use of quantifiable achievements."),
    examplesFound: z.array(z.string()).optional().describe("Examples of strong quantifiable statements found."),
    areasLackingQuantification: z.array(z.string()).optional().describe("Sections or bullet points where quantification could be added."),
});

const ActionVerbDetailsSchema = z.object({
    score: z.number().min(0).max(100).optional().describe("Score for the quality, variety, and impact of action verbs."),
    strongVerbsUsed: z.array(z.string()).optional().describe("Examples of strong action verbs found."),
    weakVerbsUsed: z.array(z.string()).optional().describe("Examples of weak or passive verbs found."),
    overusedVerbs: z.array(z.string()).optional().describe("Action verbs that might be overused."),
    suggestedStrongerVerbs: z.array(z.object({ original: z.string(), suggestion: z.string() })).optional().describe("Suggestions for stronger verb alternatives."),
});

const ImpactStatementDetailsSchema = z.object({
    clarityScore: z.number().min(0).max(100).optional().describe("Score for the clarity and impact of experience/achievement statements."),
    unclearImpactStatements: z.array(z.string()).optional().describe("Examples of statements that could be clearer or lack demonstrated impact."),
    exampleWellWrittenImpactStatements: z.array(z.string()).optional().describe("Examples of well-written impact statements found."),
});

const ReadabilityDetailsSchema = z.object({
    fleschKincaidGradeLevel: z.number().optional().describe("Estimated Flesch-Kincaid Grade Level."),
    fleschReadingEase: z.number().optional().describe("Estimated Flesch Reading Ease score."),
    readabilityFeedback: z.string().optional().describe("General feedback on the resume's readability, e.g., sentence structure, conciseness."),
});


const AnalyzeResumeAndJobDescriptionOutputSchema = z.object({
  hardSkillsScore: z.number().min(0).max(100).optional().describe("Score for hard skill alignment with the job description (0-100)."),
  matchingSkills: z.array(z.string()).optional().describe('Skills that appear in both the resume and the job description. These contribute to Hard Skills Score.'),
  missingSkills: z.array(z.string()).optional().describe('Skills crucial for the job description that are missing from the resume. These impact Hard Skills Score negatively.'),
  resumeKeyStrengths: z.string().optional().describe('Key strengths and experiences highlighted from the resume that align with the job. This feeds into Highlights Score.'),
  jobDescriptionKeyRequirements: z.string().optional().describe('Key requirements and critical expectations extracted from the job description for comparison.'),
  overallQualityScore: z.number().min(0).max(100).optional().describe('An overall quality score (0-100) for the resume against the job description, considering content, structure, and alignment beyond just keywords.'),
  recruiterTips: z.array(RecruiterTipItemSchema).optional().describe("Detailed breakdown of recruiter tips and assessments."),
  overallFeedback: z.string().optional().describe("General overall feedback and summary of the resume's effectiveness for this job."),

  searchabilityScore: z.number().min(0).max(100).optional().describe("Overall searchability score (0-100). Based on presence of contact info, section headings, and job title match."),
  recruiterTipsScore: z.number().min(0).max(100).optional().describe("Overall score based on recruiter tips (0-100), such as word count, action verbs, and measurable results."),
  highlightsScore: z.number().min(0).max(100).optional().describe("Score for the quality and relevance of resume highlights (0-100) against the job description."),
  softSkillsScore: z.number().min(0).max(100).optional().describe("Score for identified soft skills relevant to the job (0-100)."),
  identifiedSoftSkills: z.array(z.string()).optional().describe('Soft skills identified in the resume that are relevant to the job description. These contribute to Soft Skills Score.'),
  
  searchabilityDetails: SearchabilityDetailsSchema.optional().describe("Detailed breakdown of searchability aspects."),
  formattingDetails: z.array(AtsFormattingIssueSchema).optional().describe("Detailed breakdown of formatting aspects and feedback."),
  
  atsParsingConfidence: AtsParsingConfidenceSchema.optional().describe("Confidence scores for ATS parsing."),
  atsStandardFormattingComplianceScore: z.number().min(0).max(100).optional().describe("Score for compliance with standard ATS-friendly formatting, considering clarity, consistency, and length."),
  standardFormattingIssues: z.array(AtsFormattingIssueSchema).optional().describe("Specific standard formatting issues identified."),
  undefinedAcronyms: z.array(z.string()).optional().describe("Acronyms used without prior definition."),

  quantifiableAchievementDetails: QuantifiableAchievementDetailsSchema.optional().describe("Details on quantifiable achievements."),
  actionVerbDetails: ActionVerbDetailsSchema.optional().describe("Details on action verb usage."),
  impactStatementDetails: ImpactStatementDetailsSchema.optional().describe("Analysis of impact statement clarity and effectiveness."),
  readabilityDetails: ReadabilityDetailsSchema.optional().describe("Assessment of the resume's readability."),
});

export async function analyzeResumeAndJobDescription(
  input: z.infer<typeof AnalyzeResumeAndJobDescriptionInputSchema>
): Promise<AnalyzeResumeAndJobDescriptionOutput> {
  if (!input.resumeText?.trim() || !input.jobDescriptionText?.trim()) {
    throw new Error("Resume text or Job Description text cannot be empty.");
  }
  
  const { output } = await analyzeResumeAndJobDescriptionPrompt(input);
  if (!output) {
      throw new Error("AI analysis did not return any parsable output.");
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
