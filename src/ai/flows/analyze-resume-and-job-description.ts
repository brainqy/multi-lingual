
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

const AnalyzeResumeAndJobDescriptionInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),
});
export type AnalyzeResumeAndJobDescriptionInput = z.infer<typeof AnalyzeResumeAndJobDescriptionInputSchema>;

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
    // sections field was removed due to API schema error with z.record for properties
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
  formattingScore: z.number().min(0).max(100).optional().describe("Overall formatting score (0-100), considering clarity, consistency, and length."),
  highlightsScore: z.number().min(0).max(100).optional().describe("Score for the quality and relevance of resume highlights (0-100) against the job description."),
  softSkillsScore: z.number().min(0).max(100).optional().describe("Score for identified soft skills relevant to the job (0-100)."),
  identifiedSoftSkills: z.array(z.string()).optional().describe('Soft skills identified in the resume that are relevant to the job description. These contribute to Soft Skills Score.'),
  
  searchabilityDetails: SearchabilityDetailsSchema.optional().describe("Detailed breakdown of searchability aspects."),
  formattingDetails: z.array(AtsFormattingIssueSchema).optional().describe("Detailed breakdown of formatting aspects and feedback."),
  
  atsParsingConfidence: AtsParsingConfidenceSchema.optional().describe("Confidence scores for ATS parsing."),
  atsStandardFormattingComplianceScore: z.number().min(0).max(100).optional().describe("Score for compliance with standard ATS-friendly formatting."),
  standardFormattingIssues: z.array(AtsFormattingIssueSchema).optional().describe("Specific standard formatting issues identified."),
  undefinedAcronyms: z.array(z.string()).optional().describe("Acronyms used without prior definition."),

  quantifiableAchievementDetails: QuantifiableAchievementDetailsSchema.optional().describe("Details on quantifiable achievements."),
  actionVerbDetails: ActionVerbDetailsSchema.optional().describe("Details on action verb usage."),
  impactStatementDetails: ImpactStatementDetailsSchema.optional().describe("Analysis of impact statement clarity and effectiveness."),
  readabilityDetails: ReadabilityDetailsSchema.optional().describe("Assessment of the resume's readability."),
});

export type AnalyzeResumeAndJobDescriptionOutput = z.infer<typeof AnalyzeResumeAndJobDescriptionOutputSchema>;

function getDefaultOutput(errorMessage?: string): AnalyzeResumeAndJobDescriptionOutput {
  const errorMsg = errorMessage || "AI analysis could not be completed or some parts are missing.";
  logger.warn(`[AI FLOW] getDefaultOutput called. Error message: "${errorMsg}"`);
  return {
    hardSkillsScore: 0,
    matchingSkills: [],
    missingSkills: [],
    resumeKeyStrengths: "N/A",
    jobDescriptionKeyRequirements: "N/A",
    overallQualityScore: 0,
    recruiterTips: [{ category: "General", finding: errorMsg, status: 'negative', suggestion: "Please ensure resume and job description are sufficiently detailed, or try again." }],
    overallFeedback: errorMsg,
    searchabilityScore: 0,
    recruiterTipsScore: 0,
    formattingScore: 0,
    highlightsScore: 0,
    softSkillsScore: 0,
    identifiedSoftSkills: [],
    searchabilityDetails: {
      hasPhoneNumber: false,
      hasEmail: false,
      hasAddress: false,
      jobTitleMatchesJD: false,
      hasWorkExperienceSection: false,
      hasEducationSection: false,
      hasProfessionalSummary: false,
      keywordDensityFeedback: "N/A",
    },
    formattingDetails: [{issue: "General Formatting", recommendation: "Could not assess due to an error or missing data."}],
    atsParsingConfidence: { overall: 0, warnings: ["Could not assess ATS parsing confidence."] },
    atsStandardFormattingComplianceScore: 0,
    standardFormattingIssues: [{ issue: "Standard Formatting", recommendation: "Could not assess standard formatting compliance." }],
    undefinedAcronyms: [],
    quantifiableAchievementDetails: {
      score: 0,
      examplesFound: [],
      areasLackingQuantification: ["Could not assess quantifiable achievements."]
    },
    actionVerbDetails: {
      score: 0,
      strongVerbsUsed: [],
      weakVerbsUsed: ["Could not assess action verbs."],
      overusedVerbs: [],
      suggestedStrongerVerbs: []
    },
    impactStatementDetails: {
      clarityScore: 0,
      unclearImpactStatements: ["Could not assess impact statements."],
      exampleWellWrittenImpactStatements: []
    },
    readabilityDetails: {
      readabilityFeedback: "Could not assess readability."
    }
  };
}


const logger = { // Simple logger for server-side visibility
  info: (message: string, ...args: any[]) => console.log(`[AI FLOW INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[AI FLOW WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[AI FLOW ERROR] ${message}`, ...args),
};


export async function analyzeResumeAndJobDescription(
  input: AnalyzeResumeAndJobDescriptionInput
): Promise<AnalyzeResumeAndJobDescriptionOutput> {
  logger.info("Starting analyzeResumeAndJobDescription with input lengths:", { resume: input.resumeText?.length, jd: input.jobDescriptionText?.length });
  
  if (!input.resumeText?.trim() || !input.jobDescriptionText?.trim()) {
    logger.error("Error: Resume text or Job Description text is empty or whitespace only.");
    return getDefaultOutput("Resume text or Job Description text cannot be empty.");
  }
  
  let aiResponse;
  try {
    logger.info("Calling analyzeResumeAndJobDescriptionPrompt...");
    aiResponse = await analyzeResumeAndJobDescriptionPrompt(input);
    logger.info("AI prompt call completed.");
  } catch (error: any) {
    logger.error("CRITICAL ERROR during AI prompt execution:", error);
    // Log the full error object, which might contain more details from Google AI
    console.error("[AI FLOW CRITICAL ERROR STACK] ", error.stack);
    if (error.details) console.error("[AI FLOW CRITICAL ERROR DETAILS] ", error.details);
    return getDefaultOutput(`An error occurred during AI analysis: ${error.message || String(error)}`);
  }

  logger.info("Raw AI model output object:", aiResponse); // Log the entire response object
  // Using JSON.stringify for potentially large objects if the above doesn't show well in logs.
  // Be cautious with this in production if outputs are huge.
  // console.log("[AI FLOW] Raw AI model output (JSON stringified):", JSON.stringify(aiResponse?.output, null, 2));


  if (!aiResponse?.output) {
    logger.error("AI prompt did not return any parsable output for input lengths:", { resume: input.resumeText.length, jd: input.jobDescriptionText.length });
    return getDefaultOutput("AI analysis did not return any parsable output.");
  }

  const output = aiResponse.output;

  // Enhanced mapping with defaults for all fields, including nested optional objects
  return {
    hardSkillsScore: output.hardSkillsScore ?? 0,
    matchingSkills: output.matchingSkills ?? [],
    missingSkills: output.missingSkills ?? [],
    resumeKeyStrengths: output.resumeKeyStrengths ?? "N/A",
    jobDescriptionKeyRequirements: output.jobDescriptionKeyRequirements ?? "N/A",
    overallQualityScore: output.overallQualityScore ?? 0,
    recruiterTips: output.recruiterTips ?? [{ category: "General", finding: "Recruiter tips not generated.", status: 'neutral' }],
    overallFeedback: output.overallFeedback ?? "Overall feedback not generated.",
    
    searchabilityScore: output.searchabilityScore ?? 0,
    recruiterTipsScore: output.recruiterTipsScore ?? 0,
    formattingScore: output.formattingScore ?? 0,
    highlightsScore: output.highlightsScore ?? 0,
    softSkillsScore: output.softSkillsScore ?? 0,
    identifiedSoftSkills: output.identifiedSoftSkills ?? [],
    
    searchabilityDetails: output.searchabilityDetails ?? getDefaultOutput().searchabilityDetails!,
    formattingDetails: output.formattingDetails ?? getDefaultOutput().formattingDetails!,
    
    atsParsingConfidence: output.atsParsingConfidence ?? getDefaultOutput().atsParsingConfidence!,
    atsStandardFormattingComplianceScore: output.atsStandardFormattingComplianceScore ?? 0,
    standardFormattingIssues: output.standardFormattingIssues ?? getDefaultOutput().standardFormattingIssues!,
    undefinedAcronyms: output.undefinedAcronyms ?? [],

    quantifiableAchievementDetails: output.quantifiableAchievementDetails ?? getDefaultOutput().quantifiableAchievementDetails!,
    actionVerbDetails: output.actionVerbDetails ?? getDefaultOutput().actionVerbDetails!,
    impactStatementDetails: output.impactStatementDetails ?? getDefaultOutput().impactStatementDetails!,
    readabilityDetails: output.readabilityDetails ?? getDefaultOutput().readabilityDetails!,
  };
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
Evaluate the resume based on the following categories and provide detailed feedback and scores as per the output schema. 
If information is insufficient for a specific field or sub-section, you MUST provide default values (e.g., 0 for scores, empty arrays [] for lists, "N/A" or a concise "Could not assess" for strings, or a default empty object structure for optional nested objects like 'searchabilityDetails: {}') to ensure a valid JSON output according to the schema. DO NOT OMIT optional fields; provide their default state if data is insufficient.

Resume Text:
{{{resumeText}}}

Job Description Text:
{{{jobDescriptionText}}}

Analysis Categories and Instructions for JSON Output Fields:

1.  **Core Skill Match & Quality:**
    *   hardSkillsScore: Number (0-100). If not assessable, default to 0.
    *   matchingSkills: Array of strings. Default to [].
    *   missingSkills: Array of strings. Default to [].
    *   resumeKeyStrengths: String. Default to "N/A".
    *   jobDescriptionKeyRequirements: String. Default to "N/A".
    *   overallQualityScore: Number (0-100). Default to 0.
    *   overallFeedback: String. Default to "N/A".

2.  **Category Scores (0-100 for each):**
    *   searchabilityScore: Default to 0.
    *   recruiterTipsScore: Default to 0.
    *   formattingScore: Default to 0.
    *   highlightsScore: Default to 0.
    *   softSkillsScore: Default to 0.
    *   identifiedSoftSkills: Array of strings. Default to [].
    *   atsStandardFormattingComplianceScore: Default to 0.

3.  **Detailed Breakdowns (Ensure valid empty/default structures if AI cannot populate fully):**
    *   searchabilityDetails (SearchabilityDetailsSchema): Object with booleans (default false) and keywordDensityFeedback (default "N/A"). Example if not assessable: { "hasPhoneNumber": false, "hasEmail": false, "hasAddress": false, "jobTitleMatchesJD": false, "hasWorkExperienceSection": false, "hasEducationSection": false, "hasProfessionalSummary": false, "keywordDensityFeedback": "N/A" }.
    *   recruiterTips (Array of RecruiterTipItemSchema): If no specific tips, return an empty array [] or a single generic tip like [{ "category": "General", "finding": "No specific recruiter tips generated.", "status": "neutral" }].
    *   formattingDetails (Array of AtsFormattingIssueSchema): General formatting issues. Default to [].
    *   standardFormattingIssues (Array of AtsFormattingIssueSchema): Specific ATS formatting issues. Default to [].
    *   atsParsingConfidence (AtsParsingConfidenceSchema): Object with optional overall score (default 0) and optional warnings array (default []). Example if not assessable: { "overall": 0, "warnings": ["ATS parsing confidence could not be determined."] }. Do NOT include a 'sections' sub-object.
    *   undefinedAcronyms: Array of strings. Default to [].

4.  **Content Quality Details (Ensure valid empty/default structures if AI cannot populate fully):**
    *   quantifiableAchievementDetails (QuantifiableAchievementDetailsSchema): Object with score (default 0), examplesFound (default []), areasLackingQuantification (default []). Example: { "score": 0, "examplesFound": [], "areasLackingQuantification": ["Could not assess quantifiable achievements."] }.
    *   actionVerbDetails (ActionVerbDetailsSchema): Object with score (default 0), strongVerbsUsed (default []), weakVerbsUsed (default []), overusedVerbs (default []), suggestedStrongerVerbs (default []). Example: { "score": 0, "strongVerbsUsed": [], "weakVerbsUsed": ["Could not assess action verbs."], "overusedVerbs": [], "suggestedStrongerVerbs": [] }.
    *   impactStatementDetails (ImpactStatementDetailsSchema): Object with clarityScore (default 0), unclearImpactStatements (default []), exampleWellWrittenImpactStatements (default []). Example: { "clarityScore": 0, "unclearImpactStatements": ["Could not assess impact statements."], "exampleWellWrittenImpactStatements": [] }.
    *   readabilityDetails (ReadabilityDetailsSchema): Object with optional numbers and readabilityFeedback (default "N/A"). Example: { "readabilityFeedback": "Could not assess readability." }.

**CRITICAL FINAL INSTRUCTION:** Your entire response MUST be a single, valid JSON object that strictly adheres to the AnalyzeResumeAndJobDescriptionOutputSchema. It is IMPERATIVE that all fields expected by the schema, including all nested optional objects and their fields, are present. If you cannot determine a value for a field, YOU MUST use a sensible default (0 for numbers, null for optional numbers if appropriate but 0 is safer here, "N/A" or "Could not assess" for strings, [] for arrays, and fully structured default objects for nested schemas as shown in the examples above). DO NOT OMIT ANY FIELD OR SUB-FIELD from the defined schema.
`,
});

// Note: analyzeResumeAndJobDescriptionFlow is not directly called if the main exported function bypasses it.
// For full Genkit tracing/UI, you'd typically call this flow.
// const analyzeResumeAndJobDescriptionFlow = ai.defineFlow(
//   {
//     name: 'analyzeResumeAndJobDescriptionFlow',
//     inputSchema: AnalyzeResumeAndJobDescriptionInputSchema,
//     outputSchema: AnalyzeResumeAndJobDescriptionOutputSchema,
//   },
//   analyzeResumeAndJobDescription // This creates a recursive definition if not careful
// );
// To use with Genkit UI, the flow function would typically call the prompt directly:
/*
const analyzeResumeAndJobDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeResumeAndJobDescriptionFlow',
    inputSchema: AnalyzeResumeAndJobDescriptionInputSchema,
    outputSchema: AnalyzeResumeAndJobDescriptionOutputSchema,
  },
  async (input) => {
    logger.info("Flow: Starting analyzeResumeAndJobDescription with input lengths:", { resume: input.resumeText?.length, jd: input.jobDescriptionText?.length });
    if (!input.resumeText?.trim() || !input.jobDescriptionText?.trim()) {
      logger.error("Flow Error: Resume text or Job Description text is empty.");
      return getDefaultOutput("Resume text or Job Description text cannot be empty.");
    }
    try {
      const { output } = await analyzeResumeAndJobDescriptionPrompt(input);
      if (!output) {
        logger.error("Flow Error: AI prompt did not return any parsable output.");
        return getDefaultOutput("AI analysis did not return any parsable output.");
      }
      // Here, you might do light massaging of the output if needed, similar to the main function,
      // but the main function's robust defaulting is key.
      return output;
    } catch (error: any) {
      logger.error("Flow CRITICAL ERROR during AI prompt execution:", error);
      console.error("[AI FLOW CRITICAL ERROR STACK] ", error.stack);
      if (error.details) console.error("[AI FLOW CRITICAL ERROR DETAILS] ", error.details);
      return getDefaultOutput(`An error occurred during AI analysis in flow: ${error.message || String(error)}`);
    }
  }
);
*/
// For now, the exported async function `analyzeResumeAndJobDescription` is what Next.js Server Actions will use.
// If you want Genkit Dev UI to trace this, you'd define and export the flow like above,
// and your server action would call `analyzeResumeAndJobDescriptionFlow(input)` instead of `analyzeResumeAndJobDescriptionPrompt(input)`.
// For simplicity and directness, the current setup calls the prompt from the exported function.
