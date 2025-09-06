
import type { Locale } from '@/locales';
import { z } from 'zod';
import { type UserRole as PrismaUserRole } from '@prisma/client';

export type { Locale };
export type Translations = Record<string, string | NestedTranslations>;
export type NestedTranslations = { [key: string]: string | NestedTranslations };

export type UserRole = PrismaUserRole;

export interface RecentPageItem {
  path: string;
  label: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'system' | 'mention' | 'event';
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: string; 
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'PENDING_DELETION';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePictureUrl?: string;
  tenantId: string;
  sessionId?: string;
  lastLogin?: string;
  createdAt?: string;
  status?: UserStatus;
  
  // Gamification
  dailyStreak?: number;
  longestStreak?: number;
  lastStreakCheck?: string;
  xpPoints?: number;
  earnedBadges?: string[];
  challengeTopics?: InterviewQuestionCategory[];
  challengeProgress?: Record<string, { current: number; target: number }>;
  completedChallengeIds?: string[];
  currentFlipChallenge?: DailyChallenge | null;
  flipChallengeAssignedAt?: string | null;
  flipChallengeProgressStart?: Record<string, number>;
  
  // Professional Details
  dateOfBirth?: string;
  gender?: Gender;
  mobileNumber?: string;
  currentAddress?: string;
  graduationYear?: string;
  degreeProgram?: DegreeProgram;
  department?: string;
  currentJobTitle?: string;
  currentOrganization?: string;
  industry?: Industry;
  workLocation?: string;
  linkedInProfile?: string;
  yearsOfExperience?: string;
  skills?: string[];
  
  // Engagement
  areasOfSupport?: SupportArea[];
  timeCommitment?: TimeCommitment;
  preferredEngagementMode?: EngagementMode;
  otherComments?: string;
  
  // Support Seeking
  lookingForSupportType?: SupportTypeSought;
  helpNeededDescription?: string;
  
  // Consents
  shareProfileConsent?: boolean;
  featureInSpotlightConsent?: boolean;
  
  // Additional Info
  resumeText?: string;
  careerInterests?: string;
  bio?: string;
  userApiKey?: string;
  interests?: string[];
  isDistinguished?: boolean;
  appointmentCoinCost?: number;
  referralCode?: string;
  streakFreezes?: number;
  
  // Settings
  emailNotificationsEnabled?: boolean;
  appNotificationsEnabled?: boolean;
  gamificationNotificationsEnabled?: boolean;
  referralNotificationsEnabled?: boolean;
  dashboardWidgets?: {
    user?: UserDashboardWidgetId[];
    manager?: any[];
    admin?: any[];
  };
}

// Enums and Constants
export const Genders = ["Male", "Female", "Other", "Prefer not to say"] as const;
export type Gender = (typeof Genders)[number];

export const DegreePrograms = ["B.Tech", "M.Tech", "B.Sc", "M.Sc", "B.A.", "M.A.", "Ph.D."] as const;
export type DegreeProgram = (typeof DegreePrograms)[number];

export const Industries = ["IT", "Healthcare", "Finance", "Education", "Manufacturing", "Other"] as const;
export type Industry = (typeof Industries)[number];

export const AreasOfSupport = ["Mentorship", "Career Advice", "Mock Interviews", "Resume Review", "Networking", "Project Collaboration"] as const;
export type SupportArea = (typeof AreasOfSupport)[number];

export const TimeCommitments = ["1-2 hours/month", "3-5 hours/month", "5+ hours/month", "Flexible"] as const;
export type TimeCommitment = (typeof TimeCommitments)[number];

export const EngagementModes = ["Online", "Offline", "Both"] as const;
export type EngagementMode = (typeof EngagementModes)[number];

export const SupportTypesSought = ["Mentorship", "Job Opportunities", "Internship", "Project Collaboration", "General Networking"] as const;
export type SupportTypeSought = (typeof SupportTypesSought)[number];


export interface PromotionalContent {
  id: string;
  isActive: boolean;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  imageHint?: string;
  buttonText: string;
  buttonLink: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  tenantId?: string | null;
  audience?: string | null;
}

export interface CommunityPost {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string | null;
  type: 'text' | 'poll' | 'event' | 'request';
  imageUrl?: string;
  tags?: string[];
  moderationStatus: 'visible' | 'flagged' | 'removed';
  flagCount?: number;
  flagReasons?: string[];
  flaggedBy?: string[];
  likes?: number;
  likedBy?: string[];
  isPinned?: boolean;
  timestamp: string;
  comments?: CommunityComment[];
  pollOptions?: { option: string; votes: number }[];
  votedBy?: string[];
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  attendees?: number;
  capacity?: number;
  registeredBy?: string[];
  assignedTo?: string;
  status?: 'open' | 'in progress' | 'completed';
}

export interface CommunityComment {
    id: string;
    postId?: string;
    blogPostId?: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    comment: string;
    timestamp: string;
    parentId?: string;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  linkTo?: string;
  isRead?: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward?: number;
  type: 'standard' | 'flip';
  solution?: string; // For standard questions
  tasks?: { // For flip challenges
    description: string;
    action: 'analyze_resume' | 'add_job_application' | 'community_post' | 'community_comment' | 'refer' | 'book_appointment';
    target: number;
  }[];
  createdAt?: string;
}
export const EvaluateDailyChallengeAnswerInputSchema = z.object({
  question: z.string(),
  answer: z.string(),
  solution: z.string().optional(),
});
export type EvaluateDailyChallengeAnswerInput = z.infer<typeof EvaluateDailyChallengeAnswerInputSchema>;

export const EvaluateDailyChallengeAnswerOutputSchema = z.object({
  feedback: z.string(),
  score: z.number().min(0).max(100),
  isCorrect: z.boolean(),
});
export type EvaluateDailyChallengeAnswerOutput = z.infer<typeof EvaluateDailyChallengeAnswerOutputSchema>;


export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward?: number;
  triggerCondition?: string;
  streakFreezeReward?: number;
}

export interface GamificationRule {
  actionId: string;
  description: string;
  xpPoints: number;
}

// Resume Analyzer Schemas
export const AnalyzeResumeAndJobDescriptionInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the resume.'),
  jobDescriptionText: z.string().describe('The full text of the job description.'),
  jobTitle: z.string().optional().describe('The target job title, if known.'),
  companyName: z.string().optional().describe('The target company name, if known.'),
});

const RecruiterTipSchema = z.object({
  category: z.string().describe("E.g., Word Count, Job Title Match."),
  finding: z.string().describe("A one-sentence summary of the finding."),
  status: z.enum(['positive', 'neutral', 'negative']).describe("Whether the finding is good, neutral, or needs improvement."),
});

const SearchabilityDetailsSchema = z.object({
  hasPhoneNumber: z.boolean().describe("Whether a phone number was found."),
  hasEmail: z.boolean().describe("Whether an email address was found."),
  hasAddress: z.boolean().describe("Whether a physical address (city/state) was found."),
  jobTitleMatchesJD: z.boolean().describe("Whether the resume's job title aligns with the job description title."),
  hasWorkExperienceSection: z.boolean().describe("Whether a work experience section was identified."),
  hasEducationSection: z.boolean().describe("Whether an education section was identified."),
  hasProfessionalSummary: z.boolean().describe("Whether a professional summary or objective section was found."),
  keywordDensityFeedback: z.string().optional().describe("Brief feedback on the density of important keywords from the job description."),
});

const QuantifiableAchievementSchema = z.object({
    score: z.number().min(0).max(100).describe("Score based on the presence and quality of quantifiable achievements."),
    examplesFound: z.array(z.string()).optional().describe("Examples of well-written, quantifiable achievements found in the resume."),
    areasLackingQuantification: z.array(z.string()).optional().describe("Specific points in the resume that could be improved by adding metrics or numbers."),
});

const ActionVerbSchema = z.object({
    score: z.number().min(0).max(100).describe("Score based on the usage of strong action verbs."),
    strongVerbsUsed: z.array(z.string()).optional().describe("A list of strong, impactful action verbs found."),
    weakVerbsUsed: z.array(z.string()).optional().describe("Examples of weak or passive verbs found (e.g., 'Responsible for')."),
    suggestedStrongerVerbs: z.array(z.object({ original: z.string(), suggestion: z.string() })).optional().describe("Suggestions for replacing weak verbs with stronger alternatives."),
});

const ImpactStatementSchema = z.object({
    clarityScore: z.number().min(0).max(100).describe("A score on how clearly the resume's bullet points communicate impact and results."),
    exampleWellWrittenImpactStatements: z.array(z.string()).optional().describe("Examples of well-written impact statements from the resume."),
});

const ReadabilitySchema = z.object({
    fleschKincaidGradeLevel: z.number().optional().describe("Flesch-Kincaid Grade Level score."),
    fleschReadingEase: z.number().optional().describe("Flesch Reading Ease score."),
    readabilityFeedback: z.string().describe("General feedback on the resume's readability and language complexity."),
});

const AtsParsingConfidenceSchema = z.object({
    overall: z.number().min(0).max(100).describe("Overall confidence score (0-100) that an ATS can parse this resume correctly."),
});
export const AtsFormattingIssueSchema = z.object({
    issue: z.string().describe("Description of the formatting issue found."),
    recommendation: z.string().describe("Suggestion on how to fix the issue."),
});
export type AtsFormattingIssue = z.infer<typeof AtsFormattingIssueSchema>;

export const AnalyzeResumeAndJobDescriptionOutputSchema = z.object({
  hardSkillsScore: z.number().min(0).max(100).describe("Score (0-100) based on hard skills match."),
  softSkillsScore: z.number().min(0).max(100).describe("Score (0-100) based on soft skills match."),
  highlightsScore: z.number().min(0).max(100).describe("Score (0-100) based on experience and education highlights."),
  overallQualityScore: z.number().min(0).max(100).describe("A holistic quality score (0-100) for the resume as a whole against the job description."),
  matchingSkills: z.array(z.string()).describe("List of skills present in both the resume and job description."),
  missingSkills: z.array(z.string()).describe("List of crucial skills from the job description missing from the resume."),
  resumeKeyStrengths: z.string().describe("A summary of the resume's key strengths for this specific job."),
  jobDescriptionKeyRequirements: z.string().describe("A summary of the most critical requirements from the job description."),
  overallFeedback: z.string().describe("Overall feedback and actionable advice for the user."),
  recruiterTips: z.array(RecruiterTipSchema).optional().describe("A list of quick tips from a recruiter's perspective."),
  searchabilityScore: z.number().min(0).max(100).optional().describe("Score (0-100) for ATS and recruiter searchability."),
  searchabilityDetails: SearchabilityDetailsSchema.optional(),
  quantifiableAchievementDetails: QuantifiableAchievementSchema.optional(),
  actionVerbDetails: ActionVerbSchema.optional(),
  impactStatementDetails: ImpactStatementSchema.optional(),
  readabilityDetails: ReadabilitySchema.optional(),
  atsParsingConfidence: AtsParsingConfidenceSchema.optional(),
  atsStandardFormattingComplianceScore: z.number().min(0).max(100).optional().describe("Score (0-100) for compliance with standard ATS formatting rules."),
  standardFormattingIssues: z.array(AtsFormattingIssueSchema).optional().describe("Specific formatting issues that might hinder ATS parsing."),
  undefinedAcronyms: z.array(z.string()).optional().describe("A list of acronyms used in the resume that are not defined."),
});
export type AnalyzeResumeAndJobDescriptionOutput = z.infer<typeof AnalyzeResumeAndJobDescriptionOutputSchema>;


// Resume Rewrite Schemas
export const UserInputIssueSchema = z.object({
  type: z.enum(['missingQuantification', 'unclearExperience', 'missingSkill', 'missingContactInfo', 'missingSection', 'other']),
  detail: z.string().describe("The specific question or prompt for the user."),
  suggestion: z.string().optional().describe("An optional AI suggestion, like the name of a missing skill."),
});

export const IdentifyResumeIssuesInputSchema = z.object({
  resumeText: z.string(),
  jobDescriptionText: z.string(),
});
export type IdentifyResumeIssuesInput = z.infer<typeof IdentifyResumeIssuesInputSchema>;

export const IdentifyResumeIssuesOutputSchema = z.object({
  fixableByAi: z.array(z.string()).describe("A list of issues the AI can fix without user input."),
  requiresUserInput: z.array(UserInputIssueSchema).describe("A list of issues that require more information from the user."),
});
export type IdentifyResumeIssuesOutput = z.infer<typeof IdentifyResumeIssuesOutputSchema>;

export const RewriteResumeInputSchema = z.object({
  resumeText: z.string(),
  jobDescriptionText: z.string(),
  fixableByAi: z.array(z.string()),
  userInstructions: z.string().optional(),
});
export type RewriteResumeInput = z.infer<typeof RewriteResumeInputSchema>;

export const RewriteResumeOutputSchema = z.object({
  rewrittenResume: z.string().describe("The full text of the rewritten and improved resume."),
  fixesApplied: z.array(z.string()).describe("A summary of the most important changes the AI made."),
});
export type RewriteResumeOutput = z.infer<typeof RewriteResumeOutputSchema>;


export interface ResumeProfile {
    id: string;
    userId: string;
    tenantId: string;
    name: string;
    resumeText: string | null;
    createdAt: string;
    updatedAt: string;
    lastAnalyzed?: string | null;
}

export interface ResumeScanHistoryItem {
    id: string;
    tenantId: string;
    userId: string;
    resumeId: string;
    resumeName: string;
    jobTitle: string;
    companyName: string;
    scanDate: string;
    matchScore: number | null;
    resumeTextSnapshot: string;
    jobDescriptionText: string;
    bookmarked?: boolean;
}

// Job Applications
export const JOB_APPLICATION_STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'] as const;
export type JobApplicationStatus = (typeof JOB_APPLICATION_STATUSES)[number];
export type KanbanColumnId = 'Saved' | 'Applied' | 'Interviewing' | 'Offer';

export interface Interview {
  id: string;
  jobApplicationId: string;
  date: string;
  type: 'Phone Screen' | 'Technical' | 'Behavioral' | 'On-site' | 'Final Round';
  interviewer: string;
  notes?: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  tenantId: string;
  companyName: string;
  jobTitle: string;
  status: JobApplicationStatus;
  dateApplied: string;
  notes?: string[];
  jobDescription?: string;
  location?: string;
  applicationUrl?: string;
  salary?: string;
  resumeIdUsed?: string;
  coverLetterText?: string;
  reminderDate?: string;
  sourceJobOpeningId?: string;
  interviews?: Interview[];
}

// Tenant Management
export interface Tenant {
  id: string;
  name: string;
  domain?: string | null;
  createdAt: string;
  settings?: TenantSettings;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  allowPublicSignup: boolean;
  customLogoUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  features?: {
    communityFeedEnabled?: boolean;
    jobBoardEnabled?: boolean;
    gamificationEnabled?: boolean;
    walletEnabled?: boolean;
    eventRegistrationEnabled?: boolean;
  };
}

export interface PlatformSettings {
  id: string;
  platformName: string;
  maintenanceMode: boolean;
  // Community
  communityFeedEnabled: boolean;
  autoModeratePosts: boolean;
  // Career
  jobBoardEnabled: boolean;
  maxJobPostingDays: number;
  // AI Tools
  resumeAnalyzerEnabled: boolean;
  aiResumeWriterEnabled: boolean;
  coverLetterGeneratorEnabled: boolean;
  mockInterviewEnabled: boolean;
  aiMockInterviewCost: number;
  // Engagement
  gamificationEnabled: boolean;
  xpForLogin: number;
  xpForNewPost: number;
  referralsEnabled: boolean;
  affiliateProgramEnabled: boolean;
  alumniConnectEnabled: boolean;
  defaultAppointmentCost: number;
  featureRequestsEnabled: boolean;
  // Customization & Admin
  allowTenantCustomBranding: boolean;
  allowTenantEmailCustomization: boolean;
  allowUserApiKey: boolean;
  defaultProfileVisibility: ProfileVisibility;
  maxResumeUploadsPerUser: number;
  defaultTheme: 'light' | 'dark';
  enablePublicProfilePages: boolean;
  sessionTimeoutMinutes: number;
  maxEventRegistrationsPerUser?: number;
  globalAnnouncement?: string;
  pointsForAffiliateSignup?: number;
  walletEnabled: boolean;
}
export type ProfileVisibility = 'public' | 'alumni_only' | 'private';

export interface AlumniProfile extends UserProfile {
  // Can add specific alumni-related fields if needed in the future
}

export interface JobOpening {
  id: string;
  tenantId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  datePosted: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Mentorship';
  applicationLink?: string;
  postedByAlumniId?: string;
  alumniName?: string;
}

// Appointments
export const AppointmentStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'] as const;
export type AppointmentStatus = (typeof AppointmentStatuses)[number];

export const PreferredTimeSlots = ["9:30 AM", "10:30 AM", "11:30 AM", "1:30 PM", "2:30 PM", "3:30 PM", "4:30 PM", "5:30 PM"] as const;
export type PreferredTimeSlot = (typeof PreferredTimeSlots)[number];

export interface Appointment {
  id: string;
  tenantId: string;
  requesterUserId: string;
  alumniUserId: string;
  title: string;
  dateTime: string;
  status: AppointmentStatus;
  notes?: string;
  withUser: string;
  costInCoins: number;
  reminderDate?: string;
  isAssignedByAdmin?: boolean;
}

export interface TourStep {
  title: string;
  description: string;
  targetId?: string;
}

export const MOCK_INTERVIEW_STEPS = [
  { id: 'setup', title: 'Setup', description: 'Configure your mock interview session.' },
  { id: 'interview', title: 'Interview', description: 'Answer questions from our AI coach.' },
  { id: 'feedback', title: 'Feedback', description: 'Review your performance and get detailed feedback.' },
] as const;
export type MockInterviewStepId = (typeof MOCK_INTERVIEW_STEPS)[number]['id'];

export const ALL_CATEGORIES = ['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR', 'Situational', 'Problem-Solving'] as const;
export type InterviewQuestionCategory = (typeof ALL_CATEGORIES)[number];
export const PREDEFINED_INTERVIEW_TOPICS = ["Java Backend", "React Frontend", "Python Data Science", "General Behavioral", "Product Management", "System Design"];
export type InterviewQuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface MockInterviewQuestion {
  id: string;
  questionText: string;
  category: InterviewQuestionCategory;
  difficulty?: InterviewQuestionDifficulty;
  baseScore?: number;
}
export interface MockInterviewAnswer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  aiFeedback?: string;
  aiScore?: number;
  strengths?: string[];
  areasForImprovement?: string[];
  suggestedImprovements?: string[];
}

export interface GenerateOverallInterviewFeedbackOutput {
    overallSummary: string;
    keyStrengths: string[];
    keyAreasForImprovement: string[];
    finalTips: string[];
    overallScore: number;
}

export interface MockInterviewSession {
  id: string;
  userId: string;
  tenantId?: string;
  topic: string;
  description?: string;
  jobDescription?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  questions: MockInterviewQuestion[];
  answers: MockInterviewAnswer[];
  overallFeedback?: GenerateOverallInterviewFeedbackOutput;
  overallScore?: number;
  timerPerQuestion?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  questionCategories?: InterviewQuestionCategory[];
  recordingReferences?: RecordingReference[];
  interviewerScores?: InterviewerScore[];
  finalScore?: {
    achievedScore: number;
    totalPossibleScore: number;
    percentage: number;
    reportNotes: string;
  };
}


export interface DialogStepConfig {
    id: DialogStep;
    title: string;
    description: string;
}

export type DialogStep = 'selectType' | 'selectTopics' | 'selectInterviewCategory' | 'selectTimeSlot' | 'aiSetupBasic' | 'aiSetupAdvanced' | 'aiSetupCategories';

export interface PracticeSessionConfig {
    type: 'ai' | 'experts' | 'friends' | null;
    // For experts & friends
    interviewCategory?: InterviewQuestionCategory;
    topics: string[];
    dateTime: Date | null;
    friendEmail?: string;
    // For AI
    aiTopicOrRole?: string;
    aiJobDescription?: string;
    aiNumQuestions?: number;
    aiDifficulty?: 'easy' | 'medium' | 'hard';
    aiTimerPerQuestion?: number;
    aiQuestionCategories?: InterviewQuestionCategory[];
}

export interface PracticeSession {
  id: string;
  userId: string;
  date: string;
  category: 'Practice with AI' | 'Practice with Experts' | 'Practice with Friends';
  type: string; 
  language: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  topic: string;
  createdAt: string;
  aiTopicOrRole?: string;
  aiJobDescription?: string;
  aiNumQuestions?: number;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  aiTimerPerQuestion?: number;
  aiQuestionCategories?: InterviewQuestionCategory[];
}

export interface InterviewQuestion {
  id: string;
  questionText: string;
  category: InterviewQuestionCategory;
  difficulty?: InterviewQuestionDifficulty;
  isMCQ?: boolean;
  mcqOptions?: string[];
  correctAnswer?: string;
  answerOrTip: string;
  tags?: string[];
  approved?: boolean;
  createdBy?: string;
  createdAt?: string;
  rating?: number;
  ratingsCount?: number;
  userComments?: {
      id: string;
      userId: string;
      userName: string;
      useravatar: string;
      comment: string;
      timestamp: string;
  }[];
  bookmarkedBy?: string[];
  baseScore?: number;
}
export type BankQuestionSortOrder = 'default' | 'highestRated' | 'mostRecent';
export type BankQuestionFilterView = 'all' | 'myBookmarks' | 'needsApproval';

export interface GalleryEvent {
  id: string;
  tenantId: string;
  title: string;
  date: string;
  imageUrls: string[];
  description?: string;
  dataAiHint?: string;
  createdByUserId: string;
  attendeeUserIds?: string[];
  approved?: boolean;
  isPlatformGlobal?: boolean;
}

export interface LiveInterviewParticipant {
  userId: string;
  name: string;
  role: 'interviewer' | 'candidate';
  profilePictureUrl?: string;
}

export interface InterviewerScore {
    questionId: string;
    correctnessPercentage: 0 | 25 | 50 | 75 | 100;
    notes?: string;
}

export interface LiveInterviewSession {
  id: string;
  tenantId: string;
  title: string;
  participants: LiveInterviewParticipant[];
  scheduledTime: string;
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled';
  preSelectedQuestions?: MockInterviewQuestion[];
  recordingReferences?: RecordingReference[];
  interviewerScores?: InterviewerScore[];
  finalScore?: {
    achievedScore: number;
    totalPossibleScore: number;
    percentage: number;
    reportNotes: string;
  };
}

export interface RecordingReference {
    id: string;
    sessionId: string;
    startTime: string;
    durationSeconds: number;
    localStorageKey?: string; 
    cloudStorageUrl?: string; 
    type: 'audio' | 'video';
    blobUrl?: string;
    fileName?: string;
}

export interface Wallet {
    id: string;
    userId: string;
    coins: number;
    flashCoins?: {
        id: string;
        amount: number;
        expiresAt: string;
        source: string;
    }[];
    transactions: WalletTransaction[];
}

export interface WalletTransaction {
    id: string;
    walletId: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    currency: 'coins' | 'xp';
    date: string;
}

export interface PromoCode {
  id: string;
  tenantId: string;
  code: string;
  description: string;
  rewardType: 'coins' | 'xp' | 'premium_days' | 'flash_coins' | 'streak_freeze';
  rewardValue: number;
  expiresAt?: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
}

export interface ReferralHistoryItem {
  id: string;
  referrerUserId: string;
  referredEmailOrName: string;
  status: ReferralStatus;
  rewardAmount?: number;
  referralDate: string;
}

export type ReferralStatus = 'Pending' | 'Signed Up' | 'Reward Earned' | 'Expired';

export interface Affiliate {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: AffiliateStatus;
  affiliateCode: string;
  commissionRate: number;
  totalEarned: number;
  createdAt: string;
  updatedAt: string;
  commissionTierId: string;
  commissionTier?: CommissionTier;
}

export type AffiliateStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  timestamp: string;
  convertedToSignup: boolean;
}

export interface AffiliateSignup {
  id: string;
  affiliateId: string;
  newUserId: string;
  signupDate: string;
  commissionEarned?: number;
}
export interface CommissionTier {
    id: string;
    name: string;
    milestoneRequirement: number; // e.g., number of signups to reach this tier
    commissionRate: number; // e.g., 0.15 for 15%
}

export interface Award {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category: AwardCategory;
  nominationStartDate: string;
  nominationEndDate: string;
  votingStartDate: string;
  votingEndDate: string;
  status: 'Draft' | 'Nominating' | 'Voting' | 'Completed';
  winnerId?: string;
  winner?: UserProfile;
  nominations?: Nomination[];
}
export interface AwardCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Nomination {
  id: string;
  awardId: string;
  award: Award;
  nomineeId: string;
  nominee: UserProfile;
  nominatorId: string;
  nominator: UserProfile;
  justification: string;
  createdAt: string;
  votes?: Vote[];
}
export interface Vote {
  id: string;
  nominationId: string;
  voterId: string;
}

export interface Survey {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  createdAt: string;
  steps: SurveyStep[];
}

export interface SurveyStep {
  id: string;
  type: 'botMessage' | 'userInput' | 'userOptions' | 'userDropdown';
  text: string;
  variableName?: string;
  nextStepId?: string;
  isLastStep?: boolean;
  // For userInput
  placeholder?: string;
  inputType?: 'text' | 'email' | 'number' | 'textarea';
  // For userOptions
  options?: SurveyOption[];
  // For userDropdown
  dropdownOptions?: { label: string; value: string }[];
}

export interface SurveyOption {
  text: string;
  value: string;
  nextStepId: string;
}
export interface SurveyResponse {
  id: string;
  userId: string;
  userName: string;
  surveyId: string;
  surveyName: string;
  responseDate: string;
  data: Record<string, any>;
}

export interface SoftDeletedItem {
  id: string;
  name: string;
  type: 'User' | 'PromoCode' | 'Announcement' | 'GalleryEvent' | 'ResumeTemplate';
  deletedAt: Date;
}
export type UserDashboardWidgetId =
  | 'promotionCard'
  | 'jobApplicationStatusChart'
  | 'matchScoreOverTimeChart'
  | 'jobAppReminders'
  | 'upcomingAppointments'
  | 'recentActivities'
  | 'userBadges'
  | 'leaderboard'
  | 'aiMentorSuggestions';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  category: string;
  dataAiHint?: string;
  content: string; // JSON string of template structure or Handlebars template
  headerColor?: string;
  bodyColor?: string;
  headerFontSize?: string;
  textAlign?: 'left' | 'center' | 'right';
}
export interface ResumeHeaderData {
    fullName: string;
    phone: string;
    email: string;
    linkedin: string;
    portfolio: string;
    address: string;
}
export interface ResumeExperienceEntry {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    responsibilities: string;
}

export interface ResumeEducationEntry {
    id: string;
    degree: string;
    major?: string;
    university: string;
    location: string;
    graduationYear: string;
    details?: string;
}

export interface ResumeBuilderData {
    header: ResumeHeaderData;
    summary: string;
    experience: ResumeExperienceEntry[];
    education: ResumeEducationEntry[];
    skills: string[];
    additionalDetails?: {
      awards?: string;
      certifications?: string;
      languages?: string;
      interests?: string;
    };
    templateId: string;
}

export const RESUME_BUILDER_STEPS = [
  { id: 'header', title: 'Header', description: 'Contact Information', mainHeading: 'Let\'s start with your contact information' },
  { id: 'summary', title: 'Summary', description: 'Professional Overview', mainHeading: 'Craft Your Professional Summary'},
  { id: 'experience', title: 'Experience', description: 'Work History', mainHeading: 'Detail Your Work Experience' },
  { id: 'education', title: 'Education', description: 'Academic Background', mainHeading: 'Add Your Education' },
  { id: 'skills', title: 'Skills', description: 'Your Abilities', mainHeading: 'Showcase Your Skills' },
  { id: 'additional-details', title: 'Additional Details', description: 'Awards, Certifications, etc.', mainHeading: 'Include Additional Sections' },
  { id: 'finalize', title: 'Finalize', description: 'Review & Download', mainHeading: 'Finalize and Download Your Resume' },
] as const;
export type ResumeBuilderStep = (typeof RESUME_BUILDER_STEPS)[number]['id'];

export interface BlogPost {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  slug: string;
  author: string;
  date: string;
  imageUrl: string;
  content: string;
  excerpt: string;
  tags?: string[];
  comments?: CommunityComment[];
  bookmarkedBy?: string[];
}

export interface BlogGenerationSettings {
  id: string;
  generationIntervalHours: number;
  topics: string[];
  style?: 'informative' | 'casual' | 'formal' | 'technical' | 'storytelling';
  lastGenerated?: string;
}
