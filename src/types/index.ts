

import * as z from "zod";

export type Translations = {
  [key: string]: string | NestedTranslations;
};

export type NestedTranslations = {
  [key: string]: string | NestedTranslations;
};

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}



export type UserRole = 'admin' | 'manager' | 'user';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'PENDING_DELETION';

export const Genders = ['Male', 'Female', 'Prefer not to say'] as const;
export type Gender = typeof Genders[number];

export const DegreePrograms = [
  "Bachelor of Technology (B.Tech)",
  "Master of Technology (M.Tech)",
  "Bachelor of Science (B.Sc)",
  "Master of Science (M.Sc)",
  "Bachelor of Arts (B.A)",
  "Master of Arts (M.A)",
  "MBA",
  "PhD",
  "Diploma",
  "Other"
] as const;
export type DegreeProgram = typeof DegreePrograms[number];

export const Industries = [
  "IT/Software",
  "Finance/Banking",
  "Consulting",
  "Education",
  "Healthcare",
  "Manufacturing",
  "Government/Public Sector",
  "Retail/E-commerce",
  "Media/Entertainment",
  "Real Estate",
  "Automotive",
  "Other"
] as const;
export type Industry = typeof Industries[number];

export const AreasOfSupport = [
  "Mentoring Students",
  "Providing Internship Opportunities",
  "Sharing Job Referrals",
  "Guest Lecturing",
  "Startup/Business Mentorship",
  "Sponsorship or Donations",
  "Relocation Help",
  "Curriculum Feedback",
  "Organizing Alumni Events",
  "Volunteering for Campus Activities",
] as const;
export type SupportArea = typeof AreasOfSupport[number];

export const TimeCommitments = [
  "1-2 hours",
  "3-5 hours",
  "5+ hours",
  "Occasionally, when needed",
] as const;
export type TimeCommitment = typeof TimeCommitments[number];

export const EngagementModes = [
  "Online",
  "In-person",
  "Telecall",
] as const;
export type EngagementMode = typeof EngagementModes[number];

export const SupportTypesSought = [
  "Career Mentoring",
  "Job Referrals",
  "Higher Education Guidance",
  "Startup Advice",
  "Relocation Help",
  "General Networking",
] as const;
export type SupportTypeSought = typeof SupportTypesSought[number];

export type JobApplicationStatus = 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
export const JOB_APPLICATION_STATUSES: JobApplicationStatus[] = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export interface Interview {
  id: string;
  date: string; 
  type: 'Phone Screen' | 'Technical' | 'Behavioral' | 'On-site' | 'Final Round';
  interviewer: string;
  interviewerMobile?: string;
  interviewerEmail?: string;
  notes?: string;
}

export interface JobApplication {
  id: string;
  tenantId: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  status: JobApplicationStatus;
  dateApplied: string;
  notes?: string;
  jobDescription?: string;
  location?: string;
  salary?: string;
  reminderDate?: string;
  sourceJobOpeningId?: string;
  applicationUrl?: string;
  resumeIdUsed?: string;
  coverLetterText?: string;
  interviews?: Interview[];
}


export interface AlumniProfile {
  id: string;
  tenantId: string;
  name: string;
  profilePictureUrl?: string;
  currentJobTitle: string;
  company: string;
  shortBio: string;
  university: string;
  skills: string[];
  email: string;
  role: UserRole;
  status?: UserStatus;
  lastLogin?: string;
  interests?: string[];
  offersHelpWith?: SupportArea[];
  appointmentCoinCost?: number;
  xpPoints?: number;
  createdAt?: string;
  isDistinguished?: boolean;
}

export interface Activity {
  id: string;
  tenantId: string;
  timestamp: string;
  description: string;
  userId?: string;
}

export type CommunityPostModerationStatus = 'visible' | 'flagged' | 'removed';

export interface CommunityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  text: string;
}

export interface CommunityPost {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  content?: string;
  type: 'text' | 'poll' | 'event' | 'request';
  tags?: string[];
  imageUrl?: string;
  pollOptions?: { option: string, votes: number }[];
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  attendees?: number;
  capacity?: number;
  assignedTo?: string;
  status?: 'open' | 'assigned' | 'completed';
  moderationStatus: CommunityPostModerationStatus;
  flagCount: number;
  comments?: CommunityComment[];
  bookmarkedBy?: string[];
}

export interface FeatureRequest {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  upvotes?: number;
}

export interface GalleryEvent {
  id: string;
  tenantId: string;
  title: string;
  date: string;
  imageUrls: string[];
  description?: string;
  dataAiHint?: string;
  isPlatformGlobal?: boolean;
  location?: string;
  approved?: boolean;
  createdByUserId?: string;
  attendeeUserIds?: string[];
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
  postedByAlumniId: string;
  alumniName: string;
  applicationLink?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  achieved?: boolean;
  xpReward?: number;
  triggerCondition?: string;
}

export interface BlogPost {
  id: string;
  tenantId?: string | 'platform';
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  slug: string;
  author: string;
  date: string;
  imageUrl?: string;
  content: string;
  excerpt: string;
  tags?: string[];
  comments?: CommunityComment[];
  bookmarkedBy?: string[];
}

export const ALL_CATEGORIES = ['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR', 'Situational', 'Problem-Solving'] as const;
export type InterviewQuestionCategory = typeof ALL_CATEGORIES[number];

export interface UserProfile extends AlumniProfile {
  id: string;
  tenantId: string;
  role: UserRole;
  name: string;
  email: string;
  status?: UserStatus;
  lastLogin?: string;

  dateOfBirth?: string;
  gender?: Gender;
  mobileNumber?: string;
  currentAddress?: string;

  graduationYear?: string;
  degreeProgram?: DegreeProgram;
  department?: string;

  currentJobTitle: string;
  company: string;
  currentOrganization?: string;
  industry?: Industry;
  workLocation?: string;
  linkedInProfile?: string;
  yearsOfExperience?: string;

  skills: string[];

  areasOfSupport?: SupportArea[];
  timeCommitment?: TimeCommitment;
  preferredEngagementMode?: EngagementMode;
  otherComments?: string;

  lookingForSupportType?: SupportTypeSought;
  helpNeededDescription?: string;

  shareProfileConsent?: boolean;
  featureInSpotlightConsent?: boolean;

  profilePictureUrl?: string;
  resumeText?: string;
  careerInterests?: string;
  bio: string;
  interests?: string[];
  userApiKey?: string;

  offersHelpWith?: SupportArea[];

  appointmentCoinCost?: number;
  xpPoints?: number;
  dailyStreak?: number;
  longestStreak?: number;
  totalActiveDays?: number;
  weeklyActivity?: boolean[];
  referralCode?: string;
  earnedBadges?: string[];
  affiliateCode?: string;
  pastInterviewSessions?: string[];
  interviewCredits?: number;
  createdAt?: string;
  isDistinguished?: boolean;
  challengeTopics?: InterviewQuestionCategory[];
  sessionId?: string;
}

export interface ResumeProfile {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  resumeText: string;
  lastAnalyzed?: string;
}

export const AppointmentStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'] as const;
export type AppointmentStatus = typeof AppointmentStatuses[number];

export type Appointment = {
  id: string;
  tenantId: string;
  requesterUserId: string;
  alumniUserId: string;
  title: string;
  dateTime: string;
  status: AppointmentStatus;
  meetingLink?: string;
  location?: string;
  notes?: string;
  costInCoins?: number;
  withUser: string;
  reminderDate?: string;
};

export type WalletTransaction = {
  id: string;
  tenantId: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
};

export type Wallet = {
  tenantId: string;
  userId: string;
  coins: number;
  transactions: WalletTransaction[];
};

export const PreferredTimeSlots = ["Morning (9AM-12PM)", "Afternoon (1PM-4PM)", "Evening (5PM-7PM)"] as const;
export type PreferredTimeSlot = typeof PreferredTimeSlots[number];

export interface ResumeScanHistoryItem {
  id: string;
  tenantId: string;
  userId: string;
  resumeId: string;
  resumeName: string;
  jobTitle: string;
  companyName: string;
  resumeTextSnapshot: string;
  jobDescriptionText: string;
  scanDate: string;
  matchScore?: number;
  bookmarked?: boolean;
}

export type KanbanColumnId = 'Saved' | 'Applied' | 'Interviewing' | 'Offer';

export interface TenantSettings {
  allowPublicSignup: boolean;
  customLogoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  features?: {
    communityFeedEnabled?: boolean;
    jobBoardEnabled?: boolean;
    gamificationEnabled?: boolean;
    walletEnabled?: boolean;
    eventRegistrationEnabled?: boolean;
  };
  emailTemplates?: {
    welcomeEmail?: string;
  };
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  settings?: TenantSettings;
  createdAt: string;
}

export type ReferralStatus = 'Pending' | 'Signed Up' | 'Reward Earned' | 'Expired';
export interface ReferralHistoryItem {
    id: string;
    referrerUserId: string;
    referredEmailOrName: string;
    referralDate: string;
    status: ReferralStatus;
    rewardAmount?: number;
}

export interface GamificationRule {
    actionId: string;
    description: string;
    xpPoints: number;
}

export interface SurveyOption {
  text: string;
  value: string;
  nextStepId?: string;
}

export interface SurveyStep {
  id: string;
  type: 'botMessage' | 'userOptions' | 'userInput' | 'userDropdown';
  text?: string;
  options?: SurveyOption[];
  dropdownOptions?: { label: string; value: string }[];
  placeholder?: string;
  inputType?: 'text' | 'textarea' | 'email' | 'tel' | 'url' | 'date';
  nextStepId?: string;
  variableName?: string;
  isLastStep?: boolean;
}

export interface SurveyResponse {
  id: string;
  userId: string;
  userName: string;
  surveyId: string;
  surveyName?: string;
  responseDate: string;
  data: Record<string, any>;
}

export type AffiliateStatus = 'pending' | 'approved' | 'rejected';
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
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  timestamp: string;
  ipAddress?: string;
  convertedToSignup: boolean;
}

export interface AffiliateSignup {
  id: string;
  affiliateId: string;
  newUserId: string;
  signupDate: string;
  commissionEarned?: number;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  category: string;
  dataAiHint?: string;
  content: string;
}

export interface TourStep {
  title: string;
  description: string;
  targetId?: string;
}

export interface ResumeHeaderData {
  fullName: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolio?: string;
  address?: string;
}

export interface ResumeExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
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
  experience: ResumeExperienceEntry[];
  education: ResumeEducationEntry[];
  skills: string[];
  summary: string;
  additionalDetails?: {
    awards?: string;
    certifications?: string;
    languages?: string;
    interests?: string;
  };
  templateId: string;
}

export type ResumeBuilderStep = 'header' | 'experience' | 'education' | 'skills' | 'summary' | 'additional-details' | 'finalize';

export const RESUME_BUILDER_STEPS: { id: ResumeBuilderStep; title: string; description?: string; mainHeading?: string; }[] = [
  { id: 'header', title: 'Header', description: "Let's start with your contact information.", mainHeading: "Contact Information" },
  { id: 'summary', title: 'Summary', description: "Write a compelling professional summary.", mainHeading: "Professional Summary" },
  { id: 'experience', title: 'Experience', description: "Add details about your work experience.", mainHeading: "Work Experience" },
  { id: 'education', title: 'Education', description: "Tell us about your education.", mainHeading: "Education & Training" },
  { id: 'skills', title: 'Skills', description: "Showcase your skills.", mainHeading: "Skills & Expertise" },
  { id: 'additional-details', title: 'Additional Info', description: "Include any other relevant details like awards or languages.", mainHeading: "Additional Information" },
  { id: 'finalize', title: 'Finalize', description: "Review and finalize your resume.", mainHeading: "Review & Finalize" },
];

export const ALL_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export type InterviewQuestionDifficulty = typeof ALL_DIFFICULTIES[number];

export interface InterviewQuestionUserComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
}

export interface InterviewQuestionUserRating {
  userId: string;
  rating: number; // 1-5
}

export interface DailyChallenge {
  id: string;
  type: 'standard' | 'flip';
  date?: string;
  title: string;
  description: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  category?: InterviewQuestionCategory;
  solution?: string;
  xpReward?: number;
  tasks?: {
    description: string;
    action: 'refer' | 'attend_interview' | 'take_interview' | 'analyze_resume' | 'post_job';
    target: number;
  }[];
}


export interface InterviewQuestion {
  id: string;
  category: InterviewQuestionCategory;
  questionText: string;
  isMCQ?: boolean;
  mcqOptions?: string[];
  correctAnswer?: string;
  answerOrTip: string;
  tags?: string[];
  difficulty?: InterviewQuestionDifficulty;
  rating?: number;
  ratingsCount?: number;
  userRatings?: InterviewQuestionUserRating[];
  userComments?: InterviewQuestionUserComment[];
  createdBy?: string;
  approved?: boolean;
  createdAt?: string;
  bookmarkedBy?: string[];
}


export type BankQuestionSortOrder = 'default' | 'highestRated' | 'mostRecent';
export type BankQuestionFilterView = 'all' | 'myBookmarks' | 'needsApproval';


export interface BlogGenerationSettings {
  generationIntervalHours: number;
  topics: string[];
  style?: 'informative' | 'casual' | 'formal' | 'technical' | 'storytelling';
  lastGenerated?: string;
}

export interface MockInterviewQuestion {
  id: string;
  questionText: string;
  category?: InterviewQuestionCategory;
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
  isRecording?: boolean;
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
  topic: string;
  description?: string;
  jobDescription?: string;
  questions: MockInterviewQuestion[];
  answers: MockInterviewAnswer[];
  overallFeedback?: GenerateOverallInterviewFeedbackOutput;
  overallScore?: number;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  timerPerQuestion?: number;
  questionCategories?: InterviewQuestionCategory[];
  recordingReferences?: RecordingReference[];
}


export interface GenerateMockInterviewQuestionsInput {
  topic: string;
  jobDescriptionText?: string;
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  timerPerQuestion?: number;
  questionCategories?: InterviewQuestionCategory[];
}
export interface GenerateMockInterviewQuestionsOutput {
  questions: MockInterviewQuestion[];
}

export interface EvaluateInterviewAnswerInput {
  questionText: string;
  userAnswer: string;
  topic?: string;
  jobDescriptionText?: string;
}
export interface EvaluateInterviewAnswerOutput {
  feedback: string;
  strengths?: string[];
  areasForImprovement?: string[];
  score: number;
  suggestedImprovements?: string[];
}

export interface GenerateOverallInterviewFeedbackInput {
  topic: string;
  jobDescriptionText?: string;
  evaluatedAnswers: { questionText: string; userAnswer: string; feedback: string; score: number }[];
}

export type MockInterviewStepId = 'setup' | 'interview' | 'feedback';
export const MOCK_INTERVIEW_STEPS: { id: MockInterviewStepId; title: string; description: string }[] = [
  { id: 'setup', title: 'Setup Interview', description: 'Configure your mock interview session.' },
  { id: 'interview', title: 'Interview Session', description: 'Answer the questions one by one.' },
  { id: 'feedback', title: 'Get Feedback', description: 'Review your performance and AI suggestions.' },
];

export interface QuizSession {
  id: string;
  userId: string;
  questions: InterviewQuestion[];
  userAnswers: Record<string, string>;
  score?: number;
  percentage?: number;
  startTime: string;
  endTime?: string;
  status: 'in-progress' | 'completed';
  title?: string;
}

export type PracticeSessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
export type PracticeSessionType = "friends" | "experts" | "ai";

export type DialogStep =
  | 'selectType'
  | 'selectTopics'
  | 'selectTimeSlot'
  | 'aiSetupBasic'
  | 'aiSetupAdvanced'
  | 'aiSetupCategories';


export interface PracticeSessionConfig {
  type: PracticeSessionType | null;
  topics: string[];
  dateTime: Date | null;
  friendEmail?: string;
  expertId?: string;
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
  category: "Practice with Friends" | "Practice with Experts" | "Practice with AI";
  type: string; // This likely refers to the specific topics for the practice
  language: string;
  status: PracticeSessionStatus;
  notes?: string;
  // AI specific fields
  aiTopicOrRole?: string;
  aiJobDescription?: string;
  aiNumQuestions?: number;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  aiTimerPerQuestion?: number;
  aiQuestionCategories?: InterviewQuestionCategory[];
}

export const PREDEFINED_INTERVIEW_TOPICS: string[] = Array.from(new Set([
    "Java", "Python", "DSA", "Angular", "Javascript", "Microservices",
    "System Design", "Product Management", "Data Science",
    ...ALL_CATEGORIES.filter(cat => cat !== "Behavioral") // Ensure Behavioral is not duplicated
]));


export const PRACTICE_FOCUS_AREAS = ["Java", "Python", "DSA", "Angular", "Javascript", "Microservices", "System Design", "Behavioral", "Product Management", "Data Science"] as const;
export type PracticeFocusArea = typeof PRACTICE_FOCUS_AREAS[number];

export const KANBAN_COLUMNS_CONFIG: { id: KanbanColumnId; title: string; description: string; acceptedStatuses: JobApplicationStatus[] }[] = [
  { id: 'Saved', title: 'Saved', description: 'Jobs saved from job boards or your resume scans.', acceptedStatuses: ['Saved'] },
  { id: 'Applied', title: 'Applied', description: 'Application completed. Awaiting response.', acceptedStatuses: ['Applied'] },
  { id: 'Interviewing', title: 'Interview', description: 'Record interview details and notes here.', acceptedStatuses: ['Interviewing'] },
  { id: 'Offer', title: 'Offer', description: 'Interviews completed. Negotiating offer.', acceptedStatuses: ['Offer'] },
];

export type ProfileVisibility = 'public' | 'alumni_only' | 'private';

export interface PlatformSettings {
  platformName: string;
  maintenanceMode: boolean;
  communityFeedEnabled: boolean;
  autoModeratePosts: boolean;
  jobBoardEnabled: boolean;
  maxJobPostingDays: number;
  gamificationEnabled: boolean;
  xpForLogin: number;
  xpForNewPost: number;
  resumeAnalyzerEnabled: boolean;
  aiResumeWriterEnabled: boolean;
  coverLetterGeneratorEnabled: boolean;
  mockInterviewEnabled: boolean;
  referralsEnabled: boolean;
  affiliateProgramEnabled: boolean;
  alumniConnectEnabled: boolean;
  defaultAppointmentCost: number;
  featureRequestsEnabled: boolean;
  allowTenantCustomBranding: boolean;
  allowTenantEmailCustomization: boolean;
  allowUserApiKey?: boolean;
  defaultProfileVisibility: ProfileVisibility;
  maxResumeUploadsPerUser: number;
  defaultTheme: 'light' | 'dark';
  enablePublicProfilePages: boolean;
  sessionTimeoutMinutes: number;
  maxEventRegistrationsPerUser?: number;
  globalAnnouncement?: string;
  pointsForAffiliateSignup?: number;
  walletEnabled?: boolean;
}

export const AnnouncementStatuses = ['Draft', 'Published', 'Archived'] as const;
export type AnnouncementStatus = typeof AnnouncementStatuses[number];

export const AnnouncementAudiences = ['All Users', 'Specific Tenant', 'Specific Role'] as const;
export type AnnouncementAudience = typeof AnnouncementAudiences[number];

export interface Announcement {
  id: string;
  title: string;
  content: string;
  startDate: string;
  endDate?: string;
  audience: AnnouncementAudience;
  audienceTarget?: string;
  status: AnnouncementStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tenantId?: string;
}

export interface AtsFormattingIssue {
  issue: string;
  recommendation: string;
}

export const AnalyzeResumeAndJobDescriptionInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),
  jobTitle: z.string().optional().describe('The target job title for the resume.'),
  companyName: z.string().optional().describe('The target company name.'),
});
export type AnalyzeResumeAndJobDescriptionInput = z.infer<typeof AnalyzeResumeAndJobDescriptionInputSchema>;


export interface SearchabilityDetails {
  hasPhoneNumber?: boolean;
  hasEmail?: boolean;
  hasAddress?: boolean;
  jobTitleMatchesJD?: boolean;
  hasWorkExperienceSection?: boolean;
  hasEducationSection?: boolean;
  hasProfessionalSummary?: boolean;
  keywordDensityFeedback?: string;
}

export interface RecruiterTipItem {
    category: string;
    finding: string;
    status: 'positive' | 'neutral' | 'negative';
    suggestion?: string;
}

export interface AtsParsingConfidenceDetails {
    overall?: number;
    warnings?: string[];
}

export interface QuantifiableAchievementDetails {
    score?: number;
    examplesFound?: string[];
    areasLackingQuantification?: string[];
}

export interface ActionVerbDetails {
    score?: number;
    strongVerbsUsed?: string[];
    weakVerbsUsed?: string[];
    overusedVerbs?: string[];
    suggestedStrongerVerbs?: { original: string; suggestion: string }[];
}

export interface ImpactStatementDetails {
    clarityScore?: number;
    unclearImpactStatements?: string[];
    exampleWellWrittenImpactStatements?: string[];
}

export interface ReadabilityDetails {
    fleschKincaidGradeLevel?: number;
    fleschReadingEase?: number;
    readabilityFeedback?: string;
}


export interface AnalyzeResumeAndJobDescriptionOutput {
  hardSkillsScore?: number;
  matchingSkills?: string[];
  missingSkills?: string[];
  resumeKeyStrengths?: string;
  jobDescriptionKeyRequirements?: string;
  overallQualityScore?: number;
  recruiterTips?: RecruiterTipItem[];
  overallFeedback?: string;

  searchabilityScore?: number;
  recruiterTipsScore?: number;
  formattingScore?: number;
  highlightsScore?: number;
  softSkillsScore?: number;
  identifiedSoftSkills?: string[];

  searchabilityDetails?: SearchabilityDetails;
  formattingDetails?: AtsFormattingIssue[];

  atsParsingConfidence?: AtsParsingConfidenceDetails;
  atsStandardFormattingComplianceScore?: number;
  standardFormattingIssues?: AtsFormattingIssue[];
  undefinedAcronyms?: string[];

  quantifiableAchievementDetails?: QuantifiableAchievementDetails;
  actionVerbDetails?: ActionVerbDetails;
  impactStatementDetails?: ImpactStatementDetails;
  readabilityDetails?: ReadabilityDetails;
}

export interface CalculateMatchScoreInput {
  resumeText: string;
  jobDescriptionText: string;
}

export interface CalculateMatchScoreOutput {
  matchScore: number;
  missingKeywords: string[];
  relevantKeywords: string[];
}

export interface SuggestResumeImprovementsInput {
  resumeText: string;
  jobDescriptionText: string;
}

export interface SuggestResumeImprovementsOutput {
  improvedResumeSections: Array<{
    sectionTitle: string;
    suggestedImprovements: string[];
  }>;
}

export interface GenerateResumeVariantInput {
  baseResumeText: string;
  targetRole: string;
  targetIndustry?: string;
  skillsToHighlight?: string[];
  tone?: 'professional' | 'creative' | 'concise' | 'technical';
  additionalInstructions?: string;
}
export interface GenerateResumeVariantOutput {
  generatedResumeText: string;
}

export interface GenerateCoverLetterInput {
  userProfileText: string;
  jobDescriptionText: string;
  companyName: string;
  jobTitle: string;
  userName: string;
  additionalNotes?: string;
}
export interface GenerateCoverLetterOutput {
  generatedCoverLetterText: string;
}

export interface PersonalizedJobRecommendationsInput {
  userProfileText: string;
  careerInterests: string;
  availableJobs: Array<Pick<JobOpening, 'id' | 'title' | 'company' | 'description' | 'location' | 'type'>>;
}

export interface PersonalizedJobRecommendationsOutput {
  recommendedJobs: Array<{
    jobId: string;
    title: string;
    company: string;
    reasoning: string;
    matchStrength: number;
  }>;
}

export interface SuggestDynamicSkillsInput {
  currentSkills: string[];
  contextText: string;
}

export interface SuggestDynamicSkillsOutput {
  suggestedSkills: Array<{
    skill: string;
    reasoning: string;
    relevanceScore: number;
  }>;
}

export interface GenerateAiBlogPostInput {
  topic: string;
  style?: 'informative' | 'casual' | 'formal' | 'technical' | 'storytelling';
  targetAudience?: string;
  keywords?: string[];
}
export interface GenerateAiBlogPostOutput {
  title: string;
  content: string;
  excerpt: string;
  suggestedTags: string[];
}


export interface GenerateRegionSummaryInput {
  region: string;
  language: string;
  dataPoints: string;
}

export interface GenerateRegionSummaryOutput {
  summary: string;
}

export type CountyData = {
  id: string;
  name: string;
  population?: number;
  medianIncome?: number;
};

export type LiveInterviewParticipant = {
  userId: string;
  name: string;
  role: 'interviewer' | 'candidate';
  profilePictureUrl?: string;
};

export type LiveInterviewSessionStatus = 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled';
export const LiveInterviewSessionStatuses = ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'] as const;


export interface RecordingReference {
  id: string;
  sessionId: string;
  startTime: string; // ISO date string
  durationSeconds: number;
  localStorageKey?: string; // Key for local storage if saved there initially
  cloudStorageUrl?: string; // URL if uploaded to cloud
  type: 'audio' | 'video'; // Type of recording
  blobUrl?: string;
  fileName?: string;
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
  scheduledTime: string; // ISO date string
  actualStartTime?: string; // ISO date string
  actualEndTime?: string; // ISO date string
  status: LiveInterviewSessionStatus;
  meetingLink?: string;
  interviewTopics?: string[];
  notes?: string;
  preSelectedQuestions?: MockInterviewQuestion[];
  recordingReferences?: RecordingReference[];
  interviewerScores?: InterviewerScore[];
  finalScore?: {
    achievedScore: number;
    totalPossibleScore: number;
    percentage: number;
    reportNotes?: string;
  };
}

export type Locale = 'en' | 'hi' | 'mr';
export const locales: Locale[] = ['en', 'hi', 'mr'];
export const localePrefix = 'as-needed'; // Or 'always', 'never'
export const defaultLocale: Locale = 'en';

export const localeDisplayNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
};

export type SystemAlertType = 'error' | 'warning' | 'info' | 'success';
export interface SystemAlert {
  id: string;
  type: SystemAlertType;
  title: string;
  message: string;
  timestamp: string; // ISO date string
  linkTo?: string;
  linkText?: string;
  isRead?: boolean;
}

export const UserInputActionSchema = z.object({
  type: z.enum(['missingQuantification', 'missingSkill', 'unclearExperience', 'missingSection', 'missingContactInfo', 'other']),
  detail: z.string().describe("A clear, user-facing prompt explaining what information is needed. E.g., 'Your experience leading a team at XYZ is lacks specifics. How large was the team?'"),
  suggestion: z.string().optional().describe("A specific skill or keyword the user might want to add, or the name of the section to generate. E.g., 'TypeScript', 'Summary'"),
});
export type UserInputAction = z.infer<typeof UserInputActionSchema>;

export const IdentifyResumeIssuesInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),
});
export type IdentifyResumeIssuesInput = z.infer<typeof IdentifyResumeIssuesInputSchema>;

export const IdentifyResumeIssuesOutputSchema = z.object({
  fixableByAi: z.array(z.string()).describe("A list of issues the AI can likely fix automatically. E.g., 'Rephrase passive voice to active voice', 'Correct grammatical errors', 'Improve conciseness in the summary section'"),
  requiresUserInput: z.array(UserInputActionSchema).describe("A list of issues that require the user to provide more information before the AI can effectively rewrite the resume."),
});
export type IdentifyResumeIssuesOutput = z.infer<typeof IdentifyResumeIssuesOutputSchema>;


export const RewriteResumeInputSchema = z.object({
  resumeText: z.string().describe('The original (or user-edited) resume text to be rewritten.'),
  jobDescriptionText: z.string().describe('The target job description.'),
  userInstructions: z.string().optional().describe("Specific instructions from the user on what to add, change, or emphasize. E.g., 'Add that my team at XYZ was 5 people. Emphasize my experience with TypeScript.'"),
  fixableByAi: z.array(z.string()).optional().describe("A list of general improvements the AI should perform."),
});
export type RewriteResumeInput = z.infer<typeof RewriteResumeInputSchema>;

export const RewriteResumeOutputSchema = z.object({
  rewrittenResume: z.string().describe('The full text of the newly rewritten resume.'),
  fixesApplied: z.array(z.string()).describe("A bulleted list of the key changes the AI made. E.g., 'Quantified achievement in the XYZ role.', 'Strengthened action verbs in the summary.'"),
});
export type RewriteResumeOutput = z.infer<typeof RewriteResumeOutputSchema>;

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
  gradientFrom: string;
  gradientTo: string;
  gradientVia?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  rewardType: 'coins' | 'xp' | 'premium_days';
  rewardValue: number;
  expiresAt?: string;
  usageLimit: number;
  timesUsed?: number;
  isActive: boolean;
}

// Utility function to ensure UserProfile has all fields, especially for sample data
export function ensureFullUserProfile(partialProfile: Partial<UserProfile>): UserProfile {
  const defaultUser: UserProfile = {
    id: `user-${Date.now()}`,
    tenantId: SAMPLE_TENANT_ID,
    role: 'user',
    name: 'New User',
    email: `user${Date.now()}@example.com`,
    status: 'active',
    lastLogin: new Date().toISOString(),
    currentJobTitle: '',
    company: '', // Ensure 'company' (from AlumniProfile) is present
    currentOrganization: '', // Ensure 'currentOrganization' (from UserProfile) is present
    skills: [],
    bio: '',
    profilePictureUrl: `https://avatar.vercel.sh/user${Date.now()}.png`,
    xpPoints: 0,
    dailyStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    weeklyActivity: [false,false,false,false,false,false,false],
    earnedBadges: [],
    interviewCredits: 0,
    createdAt: new Date().toISOString(),
    // Ensure all other UserProfile fields have defaults
    dateOfBirth: undefined,
    gender: undefined,
    mobileNumber: '',
    currentAddress: '',
    graduationYear: '',
    degreeProgram: undefined,
    department: '',
    industry: undefined,
    workLocation: '',
    linkedInProfile: '',
    yearsOfExperience: '',
    areasOfSupport: [],
    timeCommitment: undefined,
    preferredEngagementMode: undefined,
    otherComments: '',
    lookingForSupportType: undefined,
    helpNeededDescription: '',
    shareProfileConsent: true,
    featureInSpotlightConsent: false,
    isDistinguished: false,
    resumeText: '',
    careerInterests: '',
    interests: [],
    offersHelpWith: [],
    appointmentCoinCost: 10,
    referralCode: `REF${Date.now().toString().slice(-6)}`,
    affiliateCode: undefined,
    pastInterviewSessions: [],
    challengeTopics: [],
    shortBio: '', // From AlumniProfile
    university: '', // From AlumniProfile,
    userApiKey: '',
    sessionId: undefined,
  };
  return { ...defaultUser, ...partialProfile };
}
