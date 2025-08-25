

import * as z from "zod";
import type { Locale } from '@/locales';

export type Translations = {
  [key: string]: string | NestedTranslations;
};

export type NestedTranslations = {
  [key: string]: string | NestedTranslations | Array<string | NestedTranslations>;
};

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

export interface ProductCompany {
  id: string;
  name: string;
  location: string;
  websiteUrl: string;
  domain: string; // e.g., 'SaaS', 'Fintech', 'E-commerce'
  hrName?: string;
  hrEmail?: string;
  contactNumber?: string;
  logoUrl?: string;
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
  "Doctor of Philosophy (Ph.D)",
  "Master of Business Administration (MBA)",
  "Bachelor of Business Administration (BBA)", // <-- Add this line
  "Diploma",
  "Other"
] as const;
export type DegreeProgram =
  | "Bachelor of Technology (B.Tech)"
  | "Master of Technology (M.Tech)"
  | "Bachelor of Science (B.Sc)"
  | "Master of Science (M.Sc)"
  | "Bachelor of Arts (B.A)"
  | "Master of Arts (M.A)"
  | "Doctor of Philosophy (Ph.D)"
  | "Master of Business Administration (MBA)"
  | "Bachelor of Business Administration (BBA)" // <-- Add this line
  | "Diploma"                // <-- Add this
  | "Other"                  // <-- And this
  | undefined;
export type RecentPageItem = {
  path: string;
  label: string;
  timestamp: number;
};
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
  id?: string;
  date: string; 
  type: 'Phone Screen' | 'Technical' | 'Behavioral' | 'On-site' | 'Final Round';
  interviewer: string;
  interviewerMobile?: string;
  interviewerEmail?: string;
  notes?: string[];
}

export interface JobApplication {
  id: string;
  tenantId: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  status: JobApplicationStatus;
  dateApplied: string;
  notes?: string[];
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

export type SystemAlert = {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  linkTo?: string;
  linkText?: string;
  isRead?: boolean;
};
export type CommunityPostModerationStatus = 'visible' | 'flagged' | 'removed';

export interface CommunityComment {
  id: string;
  postId?: string; // To associate comment with a community post
  blogPostId?: string; // To associate comment with a blog post
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  comment: string;
  parentId?: string; // For threaded replies
  replies?: CommunityComment[]; // For nesting, though client-side filtering is often used
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
  status?: 'open' | 'assigned' | 'completed' | 'in progress';
  moderationStatus: CommunityPostModerationStatus;
  flagCount: number;
  flagReasons?: string[];
  comments?: CommunityComment[];
  bookmarkedBy?: string[];
  votedBy?: string[];
  registeredBy?: string[];
  likes?: number;
  likedBy?: string[];
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
  datePosted: Date;
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
  streakFreezeReward?: number;
}

export interface BlogPost {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  slug: string;
  author: string;
  date: string;
  imageUrl: string;
  dataAiHint?: string;
  content: string;
  excerpt: string;
  tags: string[];
  comments: CommunityComment[];
  bookmarkedBy: string[];
  // possibly other properties
}
export const ALL_CATEGORIES = ['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR', 'Situational', 'Problem-Solving'] as const;
export type InterviewQuestionCategory = typeof ALL_CATEGORIES[number];

export type ChallengeAction =
  | "refer"
  | "attend_interview"
  | "take_interview"
  | "analyze_resume"
  | "post_job"
  | "power_edit_resume"
  | "create_quiz"
  | "book_appointment"
  | "community_post"
  | "community_comment"
  | "profile_completion_percentage"
  | "generate_cover_letter"
  | "add_job_application"
  | "daily_challenge_complete";
  
export interface UserProfile extends AlumniProfile {
  id: string;
  tenantId: string;
  role: UserRole;
  name: string;
  email: string;
  password?: string; // Add this line
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
  challengeProgress?: Record<string, {
    action: ChallengeAction;
    current: number;
    target: number;
  }>;
  sessionId?: string;
  streakFreezes?: number;

  // Notification Preferences
  emailNotificationsEnabled?: boolean;
  appNotificationsEnabled?: boolean;
  gamificationNotificationsEnabled?: boolean;
  referralNotificationsEnabled?: boolean;
  
  // Dashboard Customization
  dashboardWidgets?: {
    user?: UserDashboardWidgetId[];
    manager?: ManagerDashboardWidgetId[];
    admin?: AdminDashboardWidgetId[];
  };
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

export interface FlashCoinBatch {
  id: string;
  amount: number;
  expiresAt: string; // ISO date string
  source: string; // e.g., "Daily Login Bonus", "Special Promotion"
}

export type WalletTransaction = {
  id: string;
  walletId: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
};

export type Wallet = {
  id: string;
  userId: string;
  coins: number;
  flashCoins: FlashCoinBatch[];
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
  // New styling fields
  headerColor?: string;
  bodyColor?: string;
  headerFontSize?: string; // e.g., '1.5rem'
  textAlign?: 'left' | 'center' | 'right';
  layout?: 'one-column' | 'two-column';
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
  useravatar?: string; // Optional avatar URL
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
    action: ChallengeAction;
    target: number;
  }[];
}


export interface InterviewQuestion {
  id: string;
  category: InterviewQuestionCategory;
  questionText: string;
  isMCQ?: boolean;
  mcqOptions?: string[];
  baseScore?: number;
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
  id:string;
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
  difficulty?: 'Easy' | 'Medium' | 'Hard';
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
  | 'aiSetupBasic'
  | 'aiSetupAdvanced'
  | 'aiSetupCategories'
  | 'selectTimeSlot'
  | 'selectInterviewCategory';

export interface PracticeSessionConfig {
  type: 'ai' | 'experts' | 'friends' | null;
  interviewCategory?: InterviewQuestionCategory;
  topics: string[];
  dateTime: Date | null;
  friendEmail: string;
  aiTopicOrRole: string;
  aiJobDescription: string;
  aiNumQuestions: number;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  aiTimerPerQuestion: number;
  aiQuestionCategories: string[];
}


export interface PracticeSession {
  topic: any;
  createdAt: string;
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
  id: string;
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
  aiMockInterviewCost: number;
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

export const EvaluateDailyChallengeAnswerInputSchema = z.object({
  question: z.string().describe("The interview question that was asked."),
  answer: z.string().describe("The user's answer to the question."),
  solution: z.string().optional().describe("The ideal solution or key points for a correct answer."),
});
export type EvaluateDailyChallengeAnswerInput = z.infer<typeof EvaluateDailyChallengeAnswerInputSchema>;

export const EvaluateDailyChallengeAnswerOutputSchema = z.object({
  feedback: z.string().describe("Constructive feedback on the user's answer, explaining what was good and what could be improved."),
  score: z.number().min(0).max(100).describe("A numerical score (0-100) evaluating the quality of the answer."),
  isCorrect: z.boolean().describe("A boolean indicating if the answer is fundamentally correct."),
});
export type EvaluateDailyChallengeAnswerOutput = z.infer<typeof EvaluateDailyChallengeAnswerOutputSchema>;

export const AnalyzeResumeAndJobDescriptionInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),
  jobTitle: z.string().optional().describe('The target job title for the resume.'),
  companyName: z.string().optional().describe('The target company name.'),
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

export const AnalyzeResumeAndJobDescriptionOutputSchema = z.object({
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
  formattingDetails: z.array(z.custom<AtsFormattingIssue>()).optional().describe("Detailed breakdown of formatting aspects and feedback."),
  
  atsParsingConfidence: AtsParsingConfidenceSchema.optional().describe("Confidence scores for ATS parsing."),
  atsStandardFormattingComplianceScore: z.number().min(0).max(100).optional().describe("Score for compliance with standard ATS-friendly formatting, considering clarity, consistency, and length."),
  standardFormattingIssues: z.array(z.custom<AtsFormattingIssue>()).optional().describe("Specific standard formatting issues identified."),
  undefinedAcronyms: z.array(z.string()).optional().describe("Acronyms used without prior definition."),

  quantifiableAchievementDetails: QuantifiableAchievementDetailsSchema.optional().describe("Details on quantifiable achievements."),
  actionVerbDetails: ActionVerbDetailsSchema.optional().describe("Details on action verb usage."),
  impactStatementDetails: ImpactStatementDetailsSchema.optional().describe("Analysis of impact statement clarity and effectiveness."),
  readabilityDetails: ReadabilityDetailsSchema.optional().describe("Assessment of the resume's readability."),
});
export type AnalyzeResumeAndJobDescriptionOutput = z.infer<typeof AnalyzeResumeAndJobDescriptionOutputSchema>;

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
  generatedResumeText: string;
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
  gradientFrom?: string;
  gradientTo?: string;
  gradientVia?: string;
}

export interface PromoCode {
  id: string;
  tenantId?: string;
  code: string;
  description: string;
  rewardType: 'coins' | 'xp' | 'premium_days' | 'flash_coins' | 'streak_freeze';
  rewardValue: number;
  expiresAt?: string;
  usageLimit: number;
  timesUsed?: number;
  isActive: boolean;
}

export type UserDashboardWidgetId =
  | 'promotionCard'
  | 'jobApplicationStatusChart'
  | 'matchScoreOverTimeChart'
  | 'jobAppReminders'
  | 'upcomingAppointments'
  | 'recentActivities'
  | 'userBadges'
  | 'leaderboard';

export type ManagerDashboardWidgetId =
  | 'activeUsersStat'
  | 'resumesAnalyzedStat'
  | 'communityPostsStat'
  | 'pendingApprovalsStat'
  | 'tenantEngagementOverview'
  | 'tenantManagementActions';

export type AdminDashboardWidgetId =
  | 'promotionalSpotlight'
  | 'totalUsersStat'
  | 'totalTenantsStat'
  | 'resumesAnalyzedStat'
  | 'communityPostsStat'
  | 'platformActivityStat'
  | 'jobApplicationsStat'
  | 'alumniConnectionsStat'
  | 'mockInterviewsStat'
  | 'timeSpentStats'
  | 'tenantActivityOverview'
  | 'registrationTrendsChart'
  | 'aiUsageBreakdownChart'
  | 'contentModerationQueueSummary'
  | 'systemAlerts'
  | 'adminQuickActions';

export type NotificationType = 'mention' | 'event' | 'system';
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    content: string;
    link?: string; // e.g., /community-feed#comment-123
    isRead: boolean;
    createdAt: string;
}

// Schemas for evaluateDailyChallengeAnswer flow are removed from here to avoid redeclaration.
// They are correctly placed in the `types/index.ts` file.

export const EvaluateDailyChallengeAnswerInputSchema = z.object({
  question: z.string().describe("The interview question that was asked."),
  answer: z.string().describe("The user's answer to the question."),
  solution: z.string().optional().describe("The ideal solution or key points for a correct answer."),
});
export type EvaluateDailyChallengeAnswerInput = z.infer<typeof EvaluateDailyChallengeAnswerInputSchema>;

export const EvaluateDailyChallengeAnswerOutputSchema = z.object({
  feedback: z.string().describe("Constructive feedback on the user's answer, explaining what was good and what could be improved."),
  score: z.number().min(0).max(100).describe("A numerical score (0-100) evaluating the quality of the answer."),
  isCorrect: z.boolean().describe("A boolean indicating if the answer is fundamentally correct."),
});
export type EvaluateDailyChallengeAnswerOutput = z.infer<typeof EvaluateDailyChallengeAnswerOutputSchema>;
```
- usr/src/app/src/lib/data-services.ts:
```ts

"use client";

import type { JobOpening, UserProfile } from '@/types';
import { db } from '@/lib/db'; // Import db client

const useMockDb = process.env.USE_MOCK_DB === 'true';

// This is a server action file for interacting with the database.
// All functions are marked as server-side and will not run on the client.

/**
 * Fetches all job openings, respecting tenant boundaries.
 * In a multi-tenant app, you'd pass a tenantId here. For simplicity, we show all.
 * @returns A promise that resolves to an array of JobOpening objects.
 */
export async function getJobOpenings(): Promise<JobOpening[]> {
  'use server';
  if (useMockDb) {
    // This part is now just for fallback or specific testing
    return []; 
  }
  
  try {
    const openings = await db.jobOpening.findMany({
      orderBy: {
        datePosted: 'desc',
      },
    });
    return openings as unknown as JobOpening[];
  } catch (error) {
    console.error('[DataService] Error fetching job openings from DB:', error);
    return [];
  }
}

/**
 * Adds a new job opening to the database.
 * @param jobData The data for the new job opening.
 * @param currentUser The user who is posting the job.
 * @returns The newly created JobOpening object or null if failed.
 */
export async function addJobOpening(
  jobData: Omit<JobOpening, 'id' | 'datePosted' | 'postedByAlumniId' | 'alumniName' | 'tenantId'>,
  currentUser: Pick<UserProfile, 'id' | 'name' | 'tenantId'>
): Promise<JobOpening | null> {
  'use server';
  if (useMockDb) {
    return null;
  }

  const newOpeningData = {
    ...jobData,
    datePosted: new Date(),
    postedByAlumniId: currentUser.id,
    alumniName: currentUser.name,
    tenantId: currentUser.tenantId,
  };

  try {
    const newOpening = await db.jobOpening.create({
      data: newOpeningData,
    });
    return newOpening as unknown as JobOpening;
  } catch (error) {
    console.error('[DataService] Error creating job opening in DB:', error);
    return null;
  }
}

```
- usr/src/app/src/lib/db.ts:
```ts
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// This setup prevents multiple instances of Prisma Client in development.
declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export const db = prisma;

```
- usr/src/app/src/lib/recent-pages.ts:
```ts

'use client';

import type { RecentPageItem } from '@/types';

const MAX_RECENT_PAGES = 5;
const LOCAL_STORAGE_KEY = 'recentVisitedPages';

export function getRecentPages(): RecentPageItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedPages = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedPages ? JSON.parse(storedPages) : [];
  } catch (error) {
    console.error("Error reading recent pages from localStorage:", error);
    return [];
  }
}

export function addRecentPage(path: string, label: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Path is already locale-stripped by AppLayout
  const pathWithoutLocale = path;

  if (pathWithoutLocale.startsWith('/auth') || (pathWithoutLocale === '/' && label !== 'Dashboard')) {
    return;
  }

  try {
    let currentPages = getRecentPages();
    currentPages = currentPages.filter(page => page.path !== pathWithoutLocale);
    currentPages.unshift({ path: pathWithoutLocale, label, timestamp: Date.now() });
    const updatedPages = currentPages.slice(0, MAX_RECENT_PAGES);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPages));
  } catch (error) {
    console.error("Error saving recent page to localStorage:", error);
  }
}

const PATH_LABEL_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/resume-analyzer': 'Resume Analyzer',
  '/ai-resume-writer': 'AI Resume Writer',
  '/cover-letter-generator': 'Cover Letter Generator',
  '/ai-mock-interview': 'AI Mock Interview',
  '/my-resumes': 'My Resumes',
  '/resume-builder': 'Resume Builder',
  '/resume-templates': 'Resume Templates',
  '/job-tracker': 'Job Tracker',
  '/interview-prep': 'Interview Prep Hub',
  // '/live-interview/new': 'Start Live Interview', // Removed
  // '/interview-queue': 'Interview Queue', // Removed
  '/alumni-connect': 'Alumni Directory',
  '/job-board': 'Job Board',
  '/community-feed': 'Community Feed',
  '/gallery': 'Event Gallery',
  '/activity-log': 'Activity Log',
  '/profile': 'My Profile',
  '/appointments': 'Appointments',
  '/wallet': 'Digital Wallet',
  '/feature-requests': 'Feature Requests',
  '/settings': 'Settings',
  '/documentation': 'Documentation',
  '/gamification': 'Rewards & Badges',
  '/referrals': 'Referrals',
  '/affiliates': 'Affiliates Program',
  '/blog': 'Blog',
  '/number-match-game': 'Number Match Game',
  '/admin/tenants': 'Tenant Management',
  '/admin/tenant-onboarding': 'Tenant Onboarding',
  '/admin/user-management': 'User Management',
  '/admin/gamification-rules': 'Gamification Rules',
  '/admin/content-moderation': 'Content Moderation',
  '/admin/messenger-management': 'Messenger Management',
  '/admin/affiliate-management': 'Affiliate Management',
  '/admin/gallery-management': 'Gallery Management',
  '/admin/blog-settings': 'AI Blog Settings',
  '/admin/platform-settings': 'Platform Settings',
};

export function getLabelForPath(path: string): string {
  // Path is assumed to be locale-stripped already
  const pathWithoutLocale = path;

  if (pathWithoutLocale.startsWith('/blog/')) {
    const slug = pathWithoutLocale.substring('/blog/'.length);
    const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `Blog: ${title}`;
  }
   if (pathWithoutLocale.startsWith('/interview-prep/quiz/edit/')) {
    const quizId = pathWithoutLocale.substring('/interview-prep/quiz/edit/'.length);
    return quizId === 'new' ? 'Create New Quiz' : `Edit Quiz: ${quizId.substring(0,8)}...`;
  }
  if (pathWithoutLocale.startsWith('/interview-prep/quiz')) {
    const quizId = new URLSearchParams(pathWithoutLocale.split('?')[1]).get('quizId');
    return quizId ? `Quiz: ${quizId.substring(0,8)}...` : 'Take Quiz';
  }
  // Default: use the mapping or fallback to the path itself
  return PATH_LABEL_MAP[pathWithoutLocale] || pathWithoutLocale;
}

```
- usr/src/app/src/lib/utils.ts:
```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```
- usr/src/app/src/locales/index.ts:
```ts
// src/locales/index.ts

// Define the record of locales and their display names
export const locales = {
  en: 'English',
  mr: 'मराठी', // Marathi
  hi: 'हिन्दी', // Hindi
} as const;

// Infer the Locale type from the keys of the locales object
export type Locale = keyof typeof locales;

// Create an array of locale keys for use in places like generateStaticParams
export const localeKeys = Object.keys(locales) as Locale[];

// Define the default locale
export const defaultLocale: Locale = 'en';

```
- usr/src/app/src/locales/en.json:
```json

{
  "dashboard": {
    "navigation": {
      "overview": "Overview",
      "translate": "Translate",
      "settings": "Settings",
      "admin": "Admin Panel"
    },
    "userMenu": {
      "profile": "Profile",
      "logout": "Logout"
    }
  },
  "translateTool": {
    "title": "Translation Tool",
    "enterTextLabel": "Enter Text to Translate",
    "enterTextPlaceholder": "Type any word or sentence here...",
    "submitButton": "Translate",
    "originalText": "Original Text",
    "suggestedTranslations": "Suggested Translations",
    "qualityScore": "Quality Score",
    "errorTranslating": "An error occurred while translating. Please try again.",
    "english": "English",
    "marathi": "Marathi",
    "hindi": "Hindi"
  }
}

```
- usr/src/app/src/locales/hi.json:
```json

{
  "dashboard": {
    "navigation": {
      "overview": "अवलोकन",
      "translate": "अनुवाद करें",
      "settings": "सेटिंग्स",
      "admin": "एडमिन पैनल"
    },
    "userMenu": {
      "profile": "प्रोफ़ाइल",
      "logout": "लॉग आउट"
    }
  },
  "translateTool": {
    "title": "अनुवाद उपकरण",
    "enterTextLabel": "अनुवाद करने के लिए पाठ दर्ज करें",
    "enterTextPlaceholder": "यहां कोई भी शब्द या वाक्य टाइप करें...",
    "submitButton": "अनुवाद करें",
    "originalText": "मूल पाठ",
    "suggestedTranslations": "सुझाए गए अनुवाद",
    "qualityScore": "गुणवत्ता स्कोर",
    "errorTranslating": "अनुवाद करते समय एक त्रुटि हुई। कृपया पुन: प्रयास करें।",
    "english": "अंग्रेज़ी",
    "marathi": "मराठी",
    "hindi": "हिन्दी"
  }
}

```
- usr/src/app/src/locales/mr.json:
```json

{
  "dashboard": {
    "navigation": {
      "overview": "आढावा",
      "translate": "भाषांतर करा",
      "settings": "सेटिंग्ज",
      "admin": "प्रशासक पॅनेल"
    },
    "userMenu": {
      "profile": "प्रोफाइल",
      "logout": "लॉग आउट"
    }
  },
  "translateTool": {
    "title": "भाषांतर साधन",
    "enterTextLabel": "भाषांतर करण्यासाठी मजकूर प्रविष्ट करा",
    "enterTextPlaceholder": "येथे कोणताही शब्द किंवा वाक्य टाइप करा...",
    "submitButton": "भाषांतर करा",
    "originalText": "मूळ मजकूर",
    "suggestedTranslations": "सुचवलेले भाषांतर",
    "qualityScore": "गुणवत्ता गुण",
    "errorTranslating": "भाषांतर करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
    "english": "इंग्रजी",
    "marathi": "मराठी",
    "hindi": "हिंदी"
  }
}

```
- usr/src/app/src/middleware.ts:
```ts

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  const isApiOrInternal = pathname.startsWith('/api/') || pathname.startsWith('/_next/') || /\.(png|ico|svg|jpg|jpeg|css|js)$/.test(pathname);
  if (isApiOrInternal) {
    return NextResponse.next();
  }

  // Handle localhost and production domains
  const domainParts = hostname.replace('localhost', 'app.localhost').split('.'); // Treat localhost like myapp.localhost
  const subdomain = domainParts.length > 2 ? domainParts[0] : null;
  
  // Create a new response object so we can modify its headers.
  const response = NextResponse.next();

  // The tenantId 'platform' is used for the main domain without a subdomain.
  const tenantId = subdomain || 'platform';
  response.headers.set('X-Tenant-Id', tenantId);
  console.log(`[Middleware] Host: ${hostname}, Subdomain: ${subdomain}, Tenant ID: ${tenantId}`);
  
  // If the user is on a tenant subdomain but tries to access the root public page,
  // redirect them to the tenant-specific login page.
  if (subdomain && pathname === '/') {
    url.pathname = '/auth/login';
    console.log(`[Middleware] Redirecting from root of subdomain '${subdomain}' to ${url.pathname}`);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};

```
- usr/src/app/src/next.config.ts:
```ts

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is to fix the HMR websocket connection issue with local subdomains
    if (!isServer) {
      config.watchOptions.poll = 300;
      if (config.devServer) {
        config.devServer.hot = true;
        config.devServer.webSocketURL = 'ws://localhost:9002/ws';
      }
    }
    return config;
  },
  devIndicators: {
    allowedDevOrigins: [
      'http://brainqy.localhost:9002',
      'http://cpp.localhost:9002',
    ],
  },
};

export default nextConfig;

```
- usr/src/app/src/lib/data/gamification.ts:
```ts

import type { Badge, GamificationRule } from '@/types';

export const sampleBadges: Badge[] = [
    { id: 'profile-pro', name: 'Profile Pro', description: 'Completed 100% of your profile.', icon: 'UserCheck', xpReward: 100, triggerCondition: 'Profile completion reaches 100%' },
    { id: 'early-adopter', name: 'Early Adopter', description: 'Joined within the first month of launch.', icon: 'Award', xpReward: 50, triggerCondition: 'User signup date within launch window' },
    { id: 'networker', name: 'Networker', description: 'Made 10+ alumni connections.', icon: 'Users', xpReward: 75, triggerCondition: 'Number of connections > 10' },
    { id: 'analyzer-ace', name: 'Analyzer Ace', description: 'Analyzed 5+ resumes.', icon: 'Zap', xpReward: 50, triggerCondition: 'Resume scan count > 5' },
    { id: 'contributor', name: 'Contributor', description: 'Posted 5+ times in the community feed.', icon: 'MessageSquare', xpReward: 30, triggerCondition: 'Community post count > 5' },
    { id: 'admin-master', name: 'Admin Master', description: 'Successfully managed platform settings.', icon: 'ShieldCheck', xpReward: 0, triggerCondition: 'User role is Admin' },
    { id: 'platform-architect', name: 'Platform Architect', description: 'Made significant contributions to platform architecture.', icon: 'GitFork', xpReward: 200, triggerCondition: 'Admin assigned for specific contributions' }
];

export const sampleXpRules: GamificationRule[] = [
    { actionId: 'profile_complete_50', description: 'Reach 50% Profile Completion', xpPoints: 25 },
    { actionId: 'profile_complete_100', description: 'Reach 100% Profile Completion', xpPoints: 100 },
    { actionId: 'resume_scan', description: 'Analyze a Resume', xpPoints: 20 },
    { actionId: 'book_appointment', description: 'Book an Appointment', xpPoints: 30 },
    { actionId: 'community_post', description: 'Create a Community Post', xpPoints: 15 },
    { actionId: 'community_comment', description: 'Comment on a Post', xpPoints: 5 },
    { actionId: 'successful_referral', description: 'Successful Referral Signup', xpPoints: 50 },
    { actionId: 'daily_login', description: 'Daily Login', xpPoints: 10 },
];

```
- usr/src/app/src/lib/data/monetization.ts:
```ts

import type { Wallet, PromoCode, Affiliate, AffiliateClick, AffiliateSignup, ReferralHistoryItem } from '@/types';

const MOCK_USER_ID = 'alumni1';
const MOCK_TENANT_ID = 'Brainqy';

export let sampleWalletBalance: Wallet = {
    userId: MOCK_USER_ID,
    coins: 150,
    transactions: [
        { id: 'txn1', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: 'Reward for profile completion', amount: 50, type: 'credit' },
        { id: 'txn2', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), description: 'Used for premium report', amount: -20, type: 'debit' },
        { id: 'txn3', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: 'Appointment booking fee (Bob B.)', amount: -10, type: 'debit' },
        { id: 'txn4', date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), description: 'Daily login bonus', amount: 5, type: 'credit' },
    ]
};

export let samplePromoCodes: PromoCode[] = [
  {
    id: 'promo1',
    code: 'WELCOME50',
    description: 'Grants 50 bonus coins for new users.',
    rewardType: 'coins',
    rewardValue: 50,
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    usageLimit: 100,
    timesUsed: 25,
    isActive: true,
  },
  {
    id: 'promo2',
    code: 'XPBOOST',
    description: 'Get an extra 100 XP!',
    rewardType: 'xp',
    rewardValue: 100,
    usageLimit: 0, // Unlimited
    timesUsed: 150,
    isActive: true,
  },
  {
    id: 'promo3',
    code: 'PREMIUMTEST',
    description: '7 days of premium access.',
    rewardType: 'premium_days',
    rewardValue: 7,
    usageLimit: 50,
    timesUsed: 50,
    isActive: true,
  },
   {
    id: 'promo4',
    code: 'OLDCODE',
    description: 'An expired test code.',
    rewardType: 'coins',
    rewardValue: 10,
    expiresAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    usageLimit: 100,
    timesUsed: 10,
    isActive: true,
  },
  {
    id: 'promo5',
    code: 'INACTIVE',
    description: 'A currently inactive code.',
    rewardType: 'coins',
    rewardValue: 20,
    usageLimit: 100,
    timesUsed: 0,
    isActive: false,
  }
];

export const sampleReferralHistory: ReferralHistoryItem[] = [
  { id: 'ref1', referrerUserId: 'alumni1', referredEmailOrName: 'friend1@example.com', referralDate: new Date(Date.now() - 86400000 * 7).toISOString(), status: 'Signed Up' },
  { id: 'ref2', referrerUserId: 'managerUser1', referredEmailOrName: 'colleague@example.com', referralDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Reward Earned', rewardAmount: 25 },
  { id: 'ref3', referrerUserId: 'alumni2', referredEmailOrName: 'contact@example.com', referralDate: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Pending' },
  { id: 'ref4', referrerUserId: 'alumni2', referredEmailOrName: 'another@example.com', referralDate: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'Expired' },
  { id: 'ref5', referrerUserId: 'managerUser1', referredEmailOrName: 'newcorpcontact@example.com', referralDate: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'Signed Up' },
];

export const sampleAffiliates: Affiliate[] = [
  {
    id: 'affiliateuser1',
    userId: 'alumni1',
    name: 'Alice Wonderland',
    email: 'alice.wonderland@example.com',
    status: 'approved',
    affiliateCode: 'ALICEAFF1',
    commissionRate: 0.15,
    totalEarned: 75.00,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'affiliateuser2',
    userId: 'alumni2',
    name: 'Bob The Builder',
    email: 'bob.builder@example.com',
    status: 'pending',
    affiliateCode: 'BOBAFF2',
    commissionRate: 0.12,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
   {
    id: 'affiliateuser3',
    userId: 'alumni3',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    status: 'rejected',
    affiliateCode: 'CHARLIEAFF3',
    commissionRate: 0.10,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'affiliateuser4',
    userId: 'managerUser1',
    name: 'Manager Mike',
    email: 'manager.mike@tenant2.com',
    status: 'approved',
    affiliateCode: 'MIKEAFF4',
    commissionRate: 0.20,
    totalEarned: 125.50,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

export const sampleAffiliateClicks: AffiliateClick[] = [
  { id: 'click1', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), convertedToSignup: true },
  { id: 'click2', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false },
  { id: 'click3', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), convertedToSignup: true },
  { id: 'click4', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 0.5 * 86400000).toISOString(), convertedToSignup: false },
  { id: 'click5', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), convertedToSignup: false },
  { id: 'click6', affiliateId: 'affiliateuser2', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false },
];

export const sampleAffiliateSignups: AffiliateSignup[] = [
  { id: 'signup1', affiliateId: 'affiliateuser4', newUserId: 'newUserFromMike1', signupDate: new Date(Date.now() - 86400000 * 2).toISOString(), commissionEarned: 7.50 },
  { id: 'signup2', affiliateId: 'affiliateuser1', newUserId: 'newUserFromAlice1', signupDate: new Date(Date.now() - 86400000 * 3).toISOString(), commissionEarned: 5.00 },
  { id: 'signup3', affiliateId: 'affiliateuser4', newUserId: 'newUserFromMike2', signupDate: new Date(Date.now() - 86400000 * 1).toISOString(), commissionEarned: 10.00 },
  { id: 'signup4', affiliateId: 'affiliateuser1', newUserId: 'newUserFromAlice2', signupDate: new Date(Date.now() - 86400000 * 5).toISOString(), commissionEarned: 5.00 },
];

```
- usr/src/app/src/lib/data/promotions.ts:
```ts

import type { PromotionalContent } from '@/types';

export let samplePromotionalContent: PromotionalContent[] = [
  {
    id: 'promo-1',
    isActive: true,
    title: 'Unlock Premium Features!',
    description: 'Upgrade your JobMatch AI experience with advanced analytics, unlimited resume scans, priority support, and exclusive templates.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageAlt: 'Retro motel sign against a blue sky',
    imageHint: 'motel sign',
    buttonText: 'Learn More',
    buttonLink: '#',
    gradientFrom: 'from-primary/80',
    gradientVia: 'via-primary',
    gradientTo: 'to-accent/80',
  },
  {
    id: 'promo-2',
    isActive: true,
    title: 'New Feature: AI Mock Interview!',
    description: 'Practice for your next big interview with our new AI-powered mock interview tool. Get instant feedback and improve your skills.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageAlt: 'Person in a video call interview',
    imageHint: 'interview video call',
    buttonText: 'Try it Now',
    buttonLink: '/ai-mock-interview',
    gradientFrom: 'from-blue-500',
    gradientVia: 'via-cyan-500',
    gradientTo: 'to-teal-500',
  },
    {
    id: 'promo-3',
    isActive: false, // Inactive example
    title: 'Upcoming: Networking Event',
    description: 'Join our annual networking event next month. Connect with top professionals and alumni from your field.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageAlt: 'People networking at an event',
    imageHint: 'networking event',
    buttonText: 'Save the Date',
    buttonLink: '/events',
    gradientFrom: 'from-purple-500',
    gradientVia: 'via-pink-500',
    gradientTo: 'to-red-500',
  }
];

```
- usr/src/app/src/lib/data/requests.ts:
```ts

import type { FeatureRequest } from '@/types';

export const sampleFeatureRequests: FeatureRequest[] = [
  { id: 'fr1', tenantId: 'Brainqy', userId: 'alumni1', userName: 'Alice Wonderland', userAvatar: 'https://picsum.photos/seed/alice/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), title: 'Integrate with LinkedIn for profile import', description: 'It would be great to automatically pull resume data from LinkedIn.', status: 'Pending', upvotes: 15 },
  { id: 'fr2', tenantId: 'Brainqy', userId: 'alumni2', userName: 'Bob The Builder', userAvatar: 'https://picsum.photos/seed/bob/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), title: 'Dark mode for the dashboard', description: 'A dark theme option would be easier on the eyes.', status: 'In Progress', upvotes: 28 },
  { id: 'fr3', tenantId: 'tenant-2', userId: 'managerUser1', userName: 'Manager Mike', userAvatar: 'https://avatar.vercel.sh/managermike.png', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), title: 'Tenant-specific branding options', description: 'Allow tenant managers to customize logos and color schemes.', status: 'Completed', upvotes: 42 },
];

```
- usr/src/app/src/lib/data/surveys.ts:
```ts

import type { SurveyResponse, SurveyStep } from '@/types';
import { sampleUserProfile } from './users';
import { Genders, DegreePrograms, Industries, AreasOfSupport, TimeCommitments, EngagementModes, SupportTypesSought } from '@/types';
import { graduationYears } from './platform';


export const sampleSurveyResponses: SurveyResponse[] = [
    {
        id: 'resp1',
        userId: 'alumni1',
        userName: 'Alice Wonderland',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 1).toISOString(),
        data: {
            experience: 'amazing',
            loved_feature: 'Resume Analyzer accuracy',
            referral_likelihood: 'very_likely'
        }
    },
    {
        id: 'resp2',
        userId: 'alumni2',
        userName: 'Bob The Builder',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        data: {
            experience: 'okay',
            improvement_suggestion: 'More filter options in Alumni Connect',
            referral_likelihood: 'likely'
        }
    },
    {
        id: 'resp3',
        userId: 'alumni3',
        userName: 'Charlie Brown',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        data: {
            experience: 'needs_improvement',
            frustration_details: 'The job board sometimes loads slowly.',
            referral_likelihood: 'neutral'
        }
    },
    {
        id: 'resp_pc_alice',
        userId: 'alumni1',
        userName: 'Alice Wonderland',
        surveyId: 'profileCompletionSurvey',
        surveyName: 'Profile Completion Survey',
        responseDate: new Date(Date.now() - 86400000 * 4).toISOString(),
        data: {
            fullName: 'Alice Wonderland',
            dateOfBirth: '1993-03-15',
            gender: 'Female',
            email: 'alice.wonderland@example.com',
            mobileNumber: '+15551112222',
            currentAddress: '123 Main St, Anytown, CA, USA',
            graduationYear: '2015',
            degreeProgram: 'Master of Science (M.Sc)',
            department: 'Computer Science',
            currentJobTitle: 'Senior Software Engineer',
            currentOrganization: 'Google',
            industry: 'IT/Software',
            workLocation: 'Mountain View, CA',
            linkedInProfile: 'https://linkedin.com/in/alicewonder',
            yearsOfExperience: '7',
            skills: 'Java, Python, Machine Learning, Cloud Computing, Algorithms, React, Next.js',
            areasOfSupport: 'Mentoring Students, Sharing Job Referrals, Guest Lecturing',
            timeCommitment: '1-2 hours',
            preferredEngagementMode: 'Online',
            shareProfileConsent: 'true',
            featureInSpotlightConsent: 'true'
        }
    }
];

export const initialFeedbackSurvey: SurveyStep[] = [
  { id: 'start', type: 'botMessage', text: 'Hi there! 👋 Welcome to JobMatch AI. We\'d love to hear your thoughts.', nextStepId: 'q_experience' },
  { id: 'q_experience', type: 'botMessage', text: 'How has your experience been using our platform so far?', nextStepId: 'ans_experience' },
  { id: 'ans_experience', type: 'userOptions', options: [
    { text: '🚀 Amazing!', value: 'amazing', nextStepId: 'feedback_positive' },
    { text: '😐 It\'s okay', value: 'okay', nextStepId: 'feedback_neutral' },
    { text: '😕 Needs improvement', value: 'needs_improvement', nextStepId: 'feedback_negative' },
  ]},
  { id: 'feedback_positive', type: 'botMessage', text: 'That\'s great to hear! What feature do you find most helpful?', nextStepId: 'input_positive_feature' },
  { id: 'input_positive_feature', type: 'userInput', placeholder: 'Type your favorite feature...', variableName: 'loved_feature', nextStepId: 'q_referral' },
  { id: 'feedback_neutral', type: 'botMessage', text: 'Thanks for the honesty. What\'s one thing we could improve to make it better for you?', nextStepId: 'input_neutral_feedback'},
  { id: 'input_neutral_feedback', type: 'userInput', placeholder: 'Tell us what to improve...', variableName: 'improvement_suggestion', nextStepId: 'q_referral' },
  { id: 'feedback_negative', type: 'botMessage', text: 'We\'re sorry to hear that. Could you please tell us more about what wasn\'t working or what you found frustrating?', nextStepId: 'input_negative_feedback'},
  { id: 'input_negative_feedback', type: 'userInput', placeholder: 'Describe your concerns...', variableName: 'frustration_details', nextStepId: 'q_referral' },
  { id: 'q_referral', type: 'botMessage', text: 'Thank you for sharing! One last thing: how likely are you to recommend JobMatch AI to a friend or colleague?', nextStepId: 'ans_referral_dropdown' },
  { id: 'ans_referral_dropdown', type: 'userDropdown', dropdownOptions: [
      { label: 'Very Likely', value: 'very_likely' },
      { label: 'Likely', value: 'likely' },
      { label: 'Neutral', value: 'neutral' },
      { label: 'Unlikely', value: 'unlikely' },
      { label: 'Very Unlikely', value: 'very_unlikely' },
    ], variableName: 'referral_likelihood', nextStepId: 'thank_you'
  },
  { id: 'thank_you', type: 'botMessage', text: 'Thank you for your valuable feedback! We appreciate you taking the time. Have a great day! 😊', isLastStep: true },
];

export const profileCompletionSurveyDefinition: SurveyStep[] = [
  { id: 'pc_intro', type: 'botMessage', text: "Let's complete your profile! This will help us personalize your experience and connect you with better opportunities.", nextStepId: 'pc_s1_start' },
  { id: 'pc_s1_start', type: 'botMessage', text: "First, some personal details.", nextStepId: 'pc_s1_fullName' },
  { id: 'pc_s1_fullName', type: 'userInput', text: "What's your full name? (Required)", placeholder: "e.g., John Doe", variableName: 'fullName', nextStepId: 'pc_s1_dob' },
  { id: 'pc_s1_dob', type: 'userInput', inputType: 'date', text: "What's your date of birth? (YYYY-MM-DD)", placeholder: "YYYY-MM-DD", variableName: 'dateOfBirth', nextStepId: 'pc_s1_gender' },
  { id: 'pc_s1_gender', type: 'userDropdown', text: "What's your gender?", dropdownOptions: Genders.map(g => ({label: g, value: g})), variableName: 'gender', nextStepId: 'pc_s1_email' },
  { id: 'pc_s1_email', type: 'userInput', inputType: 'email', text: "What's your email ID? (Required)", placeholder: "you@example.com", variableName: 'email', nextStepId: 'pc_s1_mobile' },
  { id: 'pc_s1_mobile', type: 'userInput', inputType: 'tel', text: "What's your mobile number (with country code)?", placeholder: "+1 123 456 7890", variableName: 'mobileNumber', nextStepId: 'pc_s1_address' },
  { id: 'pc_s1_address', type: 'userInput', text: "What's your current address (City, State, Country)?", placeholder: "San Francisco, CA, USA", inputType: 'textarea', variableName: 'currentAddress', nextStepId: 'pc_s2_start' },
  { id: 'pc_s2_start', type: 'botMessage', text: "Great! Now, let's cover your academic background.", nextStepId: 'pc_s2_gradYear' },
  { id: 'pc_s2_gradYear', type: 'userDropdown', text: "What's your year of graduation/batch?", dropdownOptions: graduationYears.map(y => ({label: y, value: y})), variableName: 'graduationYear', nextStepId: 'pc_s2_degree' },
  { id: 'pc_s2_degree', type: 'userDropdown', text: "What's your degree/program?", dropdownOptions: DegreePrograms.map(d => ({label: d, value: d})), variableName: 'degreeProgram', nextStepId: 'pc_s2_department' },
  { id: 'pc_s2_department', type: 'userInput', text: "What's your department?", placeholder: "e.g., Computer Science", variableName: 'department', nextStepId: 'pc_s3_start' },
  { id: 'pc_s3_start', type: 'botMessage', text: "Excellent. Let's move on to your professional information.", nextStepId: 'pc_s3_jobTitle' },
  { id: 'pc_s3_jobTitle', type: 'userInput', text: "What's your current job title?", placeholder: "e.g., Software Engineer", variableName: 'currentJobTitle', nextStepId: 'pc_s3_organization' },
  { id: 'pc_s3_organization', type: 'userInput', text: "What's your current organization?", placeholder: "e.g., Tech Corp", variableName: 'currentOrganization', nextStepId: 'pc_s3_industry' },
  { id: 'pc_s3_industry', type: 'userDropdown', text: "What's your industry/sector?", dropdownOptions: Industries.map(i => ({label: i, value: i})), variableName: 'industry', nextStepId: 'pc_s3_workLocation' },
  { id: 'pc_s3_workLocation', type: 'userInput', text: "What's your work location (City, Country)?", placeholder: "e.g., London, UK", variableName: 'workLocation', nextStepId: 'pc_s3_linkedin' },
  { id: 'pc_s3_linkedin', type: 'userInput', inputType: 'url', text: "What's your LinkedIn profile URL? (Optional)", placeholder: "https://linkedin.com/in/yourprofile", variableName: 'linkedInProfile', nextStepId: 'pc_s3_experience' },
  { id: 'pc_s3_experience', type: 'userInput', text: "How many years of experience do you have?", placeholder: "e.g., 5 or 5+", variableName: 'yearsOfExperience', nextStepId: 'pc_s3_skills_prompt' },
  { id: 'pc_s3_skills_prompt', type: 'botMessage', text: "What are your key skills or areas of expertise? (Please list them, separated by commas)", nextStepId: 'pc_s3_skills_input' },
  { id: 'pc_s3_skills_input', type: 'userInput', placeholder: "e.g., React, Python, Data Analysis", inputType: 'textarea', variableName: 'skills', nextStepId: 'pc_s4_start' },
  { id: 'pc_s4_start', type: 'botMessage', text: "Let's talk about alumni engagement.", nextStepId: 'pc_s4_supportAreas_prompt' },
  { id: 'pc_s4_supportAreas_prompt', type: 'botMessage', text: `Which areas can you support? (Comma-separated from: ${AreasOfSupport.join(', ')})`, nextStepId: 'pc_s4_supportAreas_input' },
  { id: 'pc_s4_supportAreas_input', type: 'userInput', text: "Your areas of support:", placeholder: "e.g., Mentoring Students, Job Referrals", inputType: 'textarea', variableName: 'areasOfSupport', nextStepId: 'pc_s4_timeCommitment' },
  { id: 'pc_s4_timeCommitment', type: 'userDropdown', text: "How much time are you willing to commit per month?", dropdownOptions: TimeCommitments.map(tc => ({label: tc, value: tc})), variableName: 'timeCommitment', nextStepId: 'pc_s4_engagementMode' },
  { id: 'pc_s4_engagementMode', type: 'userDropdown', text: "What's your preferred mode of engagement?", dropdownOptions: EngagementModes.map(em => ({label: em, value: em})), variableName: 'preferredEngagementMode', nextStepId: 'pc_s4_otherComments' },
  { id: 'pc_s4_otherComments', type: 'userInput', text: "Any other comments or notes regarding engagement? (Optional)", inputType: 'textarea', variableName: 'otherComments', nextStepId: 'pc_s5_start' },
  { id: 'pc_s5_start', type: 'botMessage', text: "Now, optionally, tell us if you're looking for any specific support.", nextStepId: 'pc_s5_supportType' },
  { id: 'pc_s5_supportType', type: 'userDropdown', text: "What type of support are you looking for? (Optional)", dropdownOptions: [{label: "Not looking for support now", value: "none"}, ...SupportTypesSought.map(st => ({label: st, value: st}))], variableName: 'lookingForSupportType', nextStepId: 'pc_s5_helpNeeded' },
  { id: 'pc_s5_helpNeeded', type: 'userInput', text: "Briefly describe the help you need. (Optional, if you selected a support type)", inputType: 'textarea', variableName: 'helpNeededDescription', nextStepId: 'pc_s6_start' },
  { id: 'pc_s6_start', type: 'botMessage', text: "Almost done! Just a couple of consent questions.", nextStepId: 'pc_s6_shareProfile' },
  { id: 'pc_s6_shareProfile', type: 'userOptions', text: "Can we share your profile with other alumni for relevant collaboration?", options: [{text: 'Yes', value: 'true', nextStepId: 'pc_s6_featureSpotlight'}, {text: 'No', value: 'false', nextStepId: 'pc_s6_featureSpotlight'}], variableName: 'shareProfileConsent' },
  { id: 'pc_s6_featureSpotlight', type: 'userOptions', text: "Can we feature you on the alumni dashboard or spotlight?", options: [{text: 'Yes', value: 'true', nextStepId: 'pc_end'}, {text: 'No', value: 'false', nextStepId: 'pc_end'}], variableName: 'featureInSpotlightConsent' },
  { id: 'pc_end', type: 'botMessage', text: "Thank you for completing your profile information! Your profile is now more discoverable. 🎉", isLastStep: true },
];

```
- usr/src/app/src/locales/en/common.json:
```json

{
  "appName": "JobMatch AI",
  "validation": {
    "email": "Please enter a valid email address.",
    "required": "This field is required.",
    "termsRequired": "You must accept the terms and conditions.",
    "tenantNameMin": "Tenant name must be at least 3 characters.",
    "invalidUrl": "Please enter a valid URL.",
    "invalidColor": "Please enter a valid HSL or hex color code.",
    "adminEmailInvalid": "Please enter a valid admin email address.",
    "adminNameRequired": "Admin name is required.",
    "adminPasswordMin": "Password must be at least 8 characters.",
    "titleMin": "Title must be at least {count} characters.",
    "contentMin": "Content must be at least {count} characters.",
    "startDateRequired": "Start date is required."
  },
  "errorPage": {
    "title": "Something Went Wrong",
    "description": "We're sorry, but an unexpected error occurred. Please try again or contact support if the issue persists.",
    "detailsPrefix": "Error Details:",
    "retryButton": "Try Again"
  },
  "accessDenied": {
    "title": "Access Denied",
    "message": "You do not have permission to view this page or perform this action.",
    "dashboardButton": "Go to Dashboard"
  },
  "common": {
      "cancel": "Cancel",
      "submit": "Submit"
  }
}

```
- usr/src/app/src/locales/hi/common.json:
```json

{
  "appName": "भाषा सेतु",
  "validation": {
    "email": "कृपया एक मान्य ईमेल पता दर्ज करें।",
    "required": "यह फ़ील्ड आवश्यक है।",
    "termsRequired": "आपको नियमों और शर्तों को स्वीकार करना होगा।",
    "tenantNameMin": "किरायेदार का नाम कम से कम 3 अक्षर का होना चाहिए।",
    "invalidUrl": "कृपया एक मान्य यूआरएल दर्ज करें।",
    "invalidColor": "कृपया एक मान्य एचएसएल या हेक्स रंग कोड दर्ज करें।",
    "adminEmailInvalid": "कृपया एक मान्य व्यवस्थापक ईमेल पता दर्ज करें।",
    "adminNameRequired": "व्यवस्थापक का नाम आवश्यक है।",
    "adminPasswordMin": "पासवर्ड कम से कम 8 अक्षर का होना चाहिए।",
    "titleMin": "शीर्षक कम से कम {count} अक्षर का होना चाहिए।",
    "contentMin": "सामग्री कम से कम {count} अक्षर की होनी चाहिए।",
    "startDateRequired": "प्रारंभ तिथि आवश्यक है।"
  },
  "errorPage": {
    "title": "कुछ गलत हो गया",
    "description": "हमें खेद है, लेकिन एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें या यदि समस्या बनी रहती है तो सहायता से संपर्क करें।",
    "detailsPrefix": "त्रुटि विवरण:",
    "retryButton": "पुनः प्रयास करें"
  },
  "accessDenied": {
    "title": "पहुंच निषिद्ध",
    "message": "आपको यह पृष्ठ देखने या यह कार्रवाई करने की अनुमति नहीं है।",
    "dashboardButton": "डैशबोर्ड पर जाएं"
  },
  "common": {
    "cancel": "रद्द करें",
    "submit": "सबमिट करें"
  }
}

```
- usr/src/app/src/locales/mr/common.json:
```json

{
  "appName": "भाषा सेतू",
  "validation": {
    "required": "हे क्षेत्र आवश्यक आहे.",
    "email": "अवैध ईमेल पत्ता.",
    "termsRequired": "तुम्ही अटी आणि शर्ती स्वीकारल्या पाहिजेत.",
    "tenantNameMin": "भाडेकरूचे नाव किमान 3 अक्षरांचे असणे आवश्यक आहे.",
    "invalidUrl": "कृपया वैध URL प्रविष्ट करा.",
    "invalidColor": "कृपया वैध HSL किंवा हेक्स रंग कोड प्रविष्ट करा.",
    "adminEmailInvalid": "कृपया वैध प्रशासक ईमेल पत्ता प्रविष्ट करा.",
    "adminNameRequired": "प्रशासकाचे नाव आवश्यक आहे.",
    "adminPasswordMin": "पासवर्ड किमान 8 अक्षरांचा असणे आवश्यक आहे.",
    "titleMin": "शीर्षक किमान {count} अक्षरांचे असणे आवश्यक आहे.",
    "contentMin": "सामग्री किमान {count} अक्षरांची असणे आवश्यक आहे.",
    "startDateRequired": "प्रारंभ तारीख आवश्यक आहे."
  },
  "errorPage": {
    "title": "काहीतरी चूक झाली!",
    "description": "आम्हाला एक अनपेक्षित समस्या आली. कृपया पुन्हा प्रयत्न करा, किंवा समस्या कायम राहिल्यास समर्थनाशी संपर्क साधा.",
    "detailsPrefix": "त्रुटी तपशील:",
    "retryButton": "पुन्हा प्रयत्न करा"
  },
  "accessDenied": {
    "title": "प्रवेश नाकारला",
    "message": "तुम्हाला हे पृष्ठ पाहण्याची परवानगी नाही.",
    "dashboardButton": "डॅशबोर्डवर जा"
  },
  "common": {
    "cancel": "रद्द करा",
    "submit": "सबमिट करा"
  }
}

```
- usr/src/app/src/locales/en/auth.json:
```json

{
  "login": {
    "title": "Welcome Back",
    "emailLabel": "Email",
    "passwordLabel": "Password",
    "submitButton": "Login",
    "signupPrompt": "Don't have an account?",
    "signupLink": "Sign Up"
  },
  "signup": {
    "title": "Create Account",
    "nameLabel": "Full Name",
    "emailLabel": "Email",
    "passwordLabel": "Password",
    "roleLabel": "Role",
    "roleUser": "User",
    "roleAdmin": "Admin (for demo)",
    "submitButton": "Sign Up",
    "loginPrompt": "Already have an account?",
    "loginLink": "Login",
    "referralCodeLabel": "Referral Code (Optional)",
    "referralCodePlaceholder": "Enter referral code",
    "agreeToTermsLabel": "Agree to our terms and conditions",
    "agreeToTermsDescription": "By signing up, you agree to our",
    "termsLink": "Terms of Service",
    "privacyLink": "Privacy Policy"
  },
  "forgotPassword": {
    "title": "Forgot Password?",
    "description": "Enter your email and we'll send you instructions to reset your password.",
    "submitButton": "Send Reset Instructions",
    "backToLogin": "Back to Login",
    "toastSuccessTitle": "Check Your Email",
    "toastSuccessDescription": "If an account exists for {email}, you will receive password reset instructions.",
    "submittedTitle": "Instructions Sent!",
    "submittedDescription": "Please check your inbox at {email} for the next steps."
  }
}

```
- usr/src/app/src/locales/hi/auth.json:
```json

{
  "login": {
    "title": "पुनः स्वागत है",
    "emailLabel": "ईमेल",
    "passwordLabel": "पासवर्ड",
    "submitButton": "लॉग इन करें",
    "signupPrompt": "खाता नहीं है?",
    "signupLink": "साइन अप करें"
  },
  "signup": {
    "title": "खाता बनाएं",
    "nameLabel": "पूरा नाम",
    "emailLabel": "ईमेल",
    "passwordLabel": "पासवर्ड",
    "roleLabel": "भूमिका",
    "roleUser": "उपयोगकर्ता",
    "roleAdmin": "एडमिन (डेमो के लिए)",
    "submitButton": "साइन अप करें",
    "loginPrompt": "पहले से ही खाता है?",
    "loginLink": "लॉग इन करें",
    "referralCodeLabel": "रेफ़रल कोड (वैकल्पिक)",
    "referralCodePlaceholder": "रेफ़रल कोड दर्ज करें",
    "agreeToTermsLabel": "हमारे नियमों और शर्तों से सहमत हों",
    "agreeToTermsDescription": "साइन अप करके, आप हमारे",
    "termsLink": "सेवा की शर्तें",
    "privacyLink": "गोपनीयता नीति"
  },
  "forgotPassword": {
    "title": "पासवर्ड भूल गए?",
    "description": "अपना ईमेल दर्ज करें और हम आपको पासवर्ड रीसेट करने के लिए निर्देश भेजेंगे।",
    "submitButton": "रीसेट निर्देश भेजें",
    "backToLogin": "लॉगिन पर वापस जाएं",
    "toastSuccessTitle": "अपना ईमेल जांचें",
    "toastSuccessDescription": "यदि {email} के लिए कोई खाता मौजूद है, तो आपको पासवर्ड रीसेट निर्देश प्राप्त होंगे।",
    "submittedTitle": "निर्देश भेजे गए!",
    "submittedDescription": "अगले चरणों के लिए कृपया {email} पर अपना इनबॉक्स जांचें।"
  }
}

```
- usr/src/app/src/locales/mr/auth.json:
```json
{
  "login": {
    "title": "पुन्हा स्वागत आहे",
    "emailLabel": "ईमेल",
    "passwordLabel": "पासवर्ड",
    "submitButton": "लॉग इन करा",
    "signupPrompt": "खाते नाही?",
    "signupLink": "नोंदणी करा"
  },
  "signup": {
    "title": "खाते तयार करा",
    "nameLabel": "पूर्ण नाव",
    "emailLabel": "ईमेल",
    "passwordLabel": "पासवर्ड",
    "roleLabel": "भूमिका",
    "roleUser": "वापरकर्ता",
    "roleAdmin": "प्रशासक (डेमोसाठी)",
    "submitButton": "नोंदणी करा",
    "loginPrompt": "आधीपासून खाते आहे?",
    "loginLink": "लॉग इन करा",
    "referralCodeLabel": "रेफरल कोड (पर्यायी)",
    "referralCodePlaceholder": "रेफरल कोड प्रविष्ट करा",
    "agreeToTermsLabel": "आमच्या अटी आणि शर्तींना सहमत आहात",
    "agreeToTermsDescription": "साइन अप करून, तुम्ही आमच्या",
    "termsLink": "सेवा अटी",
    "privacyLink": "गोपनीयता धोरण"
  },
  "forgotPassword": {
    "title": "पासवर्ड विसरलात?",
    "description": "तुमचा ईमेल टाका आणि आम्ही तुम्हाला पासवर्ड रीसेट करण्यासाठी सूचना पाठवू.",
    "submitButton": "रीसेट सूचना पाठवा",
    "backToLogin": "लॉगिनवर परत जा",
    "toastSuccessTitle": "तुमचा ईमेल तपासा",
    "toastSuccessDescription": "जर {email} साठी खाते अस्तित्वात असेल, तर तुम्हाला पासवर्ड रीसेट सूचना मिळतील.",
    "submittedTitle": "सूचना पाठवल्या!",
    "submittedDescription": "पुढील चरणांसाठी कृपया {email} वर तुमचा इनबॉक्स तपासा."
  }
}
```
- usr/src/app/src/lib/actions/auth.ts:
```ts

'use server';

import { getUserByEmail, createUser, updateUser } from '@/lib/data-services/users';
import type { UserProfile } from '@/types';
import { db } from '@/lib/db';
import { logAction, logError } from '@/lib/logger';

/**
 * Handles user login, scoped to a specific tenant.
 * @param email The user's email address.
 * @param password The user's password.
 * @param tenantId The ID of the tenant from the URL subdomain.
 * @returns The user profile if login is successful, otherwise null.
 */
export async function loginUser(email: string, password?: string, tenantId?: string): Promise<UserProfile | null> {
  try {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      const isPlatformLogin = !tenantId || tenantId === 'platform';
      
      if (user.role === 'admin' && !isPlatformLogin) {
        logError('Admin login attempt failed on tenant subdomain', { email, tenantId });
        return null;
      }
      
      if (user.role !== 'admin' && user.tenantId !== tenantId) {
        logError('User login attempt failed due to tenant mismatch', { email, userTenant: user.tenantId, loginTenant: tenantId });
        return null;
      }

      const isPasswordMatch = user.password ? (password === user.password) : true;
      
      if (isPasswordMatch) {
        const sessionId = `session-${Date.now()}`;
        const updatedUser = await updateUser(user.id, { sessionId, lastLogin: new Date().toISOString() });
        logAction('User login successful', { userId: user.id, email: user.email, tenantId: user.tenantId });
        return updatedUser;
      }
    }
    logError('Login failed for email', { email, reason: 'User not found or password incorrect' });
    return null;
  } catch (error) {
    logError('Exception during loginUser', error, { email });
    return null;
  }
}

/**
 * Handles new user registration.
 * @param userData The data for the new user, including password.
 * @returns An object with success status, a message, and the user object if successful.
 */
export async function signupUser(userData: { name: string; email: string; role: 'user' | 'admin'; password?: string; tenantId?: string; }): Promise<{ success: boolean; user: UserProfile | null; message?: string; error?: string }> {
  try {
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      logAction('Signup failed: Account exists', { email: userData.email });
      return {
        success: false,
        user: null,
        message: "An account with this email already exists. Please login instead.",
        error: "Account Exists",
      };
    }

    const newUser = await createUser(userData);

    if (newUser) {
      logAction('New user signup successful', { userId: newUser.id, email: newUser.email, tenantId: newUser.tenantId });
      return { success: true, user: newUser };
    }

    logError('Signup failed: Could not create user', {}, { email: userData.email });
    return { success: false, user: null, message: "Could not create a new user account." };
  } catch (error) {
    logError('Exception during signupUser', error, { email: userData.email });
    return { success: false, user: null, message: 'An unexpected error occurred during signup.' };
  }
}

/**
 * Validates a user's session by checking their email and session ID against the database.
 * @param email The user's email.
 * @param sessionId The user's current session ID.
 * @returns The user profile if the session is valid, otherwise null.
 */
export async function validateSession(email: string, sessionId: string): Promise<UserProfile | null> {
  try {
    const user = await getUserByEmail(email);
    if (user && user.sessionId === sessionId) {
      return user;
    }
    return null;
  } catch (error) {
    logError('Exception during validateSession', error, { email });
    return null;
  }
}

```
- usr/src/app/src/lib/logger.ts:
```ts
// src/lib/logger.ts
import fs from 'fs';
import path from 'path';

const logDirectory = path.join(process.cwd(), 'logs');

// Ensure the log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const actionLogStream = fs.createWriteStream(path.join(logDirectory, 'actions.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logDirectory, 'errors.log'), { flags: 'a' });

function writeLog(stream: fs.WriteStream, level: string, message: string, meta?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta,
  };
  stream.write(`${JSON.stringify(logEntry)}\n`);
}

/**
 * Logs a user action.
 * @param message A description of the action.
 * @param meta Additional data like userId, tenantId, etc.
 */
export function logAction(message: string, meta?: Record<string, any>) {
  console.log(`[ACTION] ${message}`, meta || '');
  writeLog(actionLogStream, 'INFO', message, meta);
}

/**
 * Logs an error.
 * @param message A description of the error.
 * @param error The error object or stack trace.
 * @param meta Additional context.
 */
export function logError(message: string, error: any, meta?: Record<string, any>) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[ERROR] ${message}`, { ...meta, error: errorMessage, stack });
  writeLog(errorLogStream, 'ERROR', message, { ...meta, error: errorMessage, stack });
}

```
- .gitignore:
```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
**/generated/prisma

```
- usr/src/app/src/lib/data/activities.ts:
```ts

import type { Activity } from '@/types';

export let sampleActivities: Activity[] = [
  { id: 'act1', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), description: 'Uploaded resume "Software_Engineer_Resume.pdf".' },
  { id: 'act2', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), description: 'Analyzed resume for "Senior Product Manager" role at Innovate LLC.' },
  { id: 'act3', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: 'Connected with Bob The Builder.' },
  { id: 'act4', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), description: 'Tracked new job application for "Data Scientist" at Data Corp.' },
  { id: 'act5', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), description: 'Earned the "Profile Pro" badge.' },
  { id: 'act6', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), description: 'Posted in Community Feed: "Interview Tips?".' },
  { id: 'act7', tenantId: 'Brainqy', userId: 'alumni2', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), description: 'Shared a new job opening: "Junior Developer at Google".' },
  { id: 'act8', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), description: 'Commented on "Interview Tips?" post.' },
  { id: 'act9', tenantId: 'tenant-2', userId: 'managerUser1', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), description: 'Published a new announcement for Tenant-2.' },
  { id: 'act10', tenantId: 'Brainqy', userId: 'alumni4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), description: 'Registered for "Intro to Cloud Native" workshop.' },
];

```
- usr/src/app/src/lib/data/announcements.ts:
```ts

import type { Announcement } from '@/types';

export let sampleAnnouncements: Announcement[] = [
  {
    id: 'announce-1',
    tenantId: 'platform',
    title: 'New Feature: AI Mock Interview!',
    content: 'We are excited to launch our new AI Mock Interview feature. Practice common interview questions and get instant feedback. Find it under "Interview Prep" in the sidebar.',
    startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    audience: 'All Users',
    status: 'Published',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdBy: 'alumni1',
  },
  {
    id: 'announce-2',
    tenantId: 'platform',
    title: 'Platform Maintenance Scheduled',
    content: 'We will be performing scheduled maintenance on Sunday from 2 AM to 4 AM PST. The platform may be temporarily unavailable during this time.',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 3 + (2 * 60 * 60 * 1000)).toISOString(),
    audience: 'All Users',
    status: 'Published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'alumni1',
  },
  {
    id: 'announce-3',
    tenantId: 'tenant-2',
    title: 'Tenant-2 Welcome Mixer!',
    content: 'Welcome to the Corporate Partner Inc. alumni portal! Join us for a virtual welcome mixer next Friday at 5 PM. Check the community events for details.',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    audience: 'Specific Tenant',
    audienceTarget: 'tenant-2',
    status: 'Published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'managerUser1',
  },
];

```
- usr/src/app/src/lib/data/appointments.ts:
```ts

// This file is now obsolete as appointment data is managed in the database.
// It can be removed.

    
```
- usr/src/app/src/lib/data/blog.ts:
```ts

import type { BlogPost, BlogGenerationSettings } from '@/types';

export let sampleBlogPosts: BlogPost[] = [
  {
    id: 'blog4',
    tenantId: 'platform',
    userId: 'system',
    userName: 'Career Coach Pro',
    userAvatar: 'https://picsum.photos/seed/coach/50/50',
    title: 'The Art of the Follow-Up Email After an Interview',
    slug: 'art-of-the-follow-up-email',
    author: 'Career Coach Pro',
    date: '2024-07-25T11:00:00Z',
    imageUrl: 'https://placehold.co/800x400.png',
    dataAiHint: 'email keyboard',
    content: 'A well-crafted follow-up email can make a significant difference. It reinforces your interest, shows professionalism, and brings your name back to the top of the hiring manager\'s mind.\n\n**Key Components:**\n- **Subject Line:** Make it clear and concise (e.g., "Following up on the [Job Title] Interview").\n- **Personalized Greeting:** Address the interviewer by name.\n- **Express Thanks:** Thank them for their time.\n- **Reiterate Interest:** Briefly restate your enthusiasm for the role and the company.\n- **Mention a Specific Point:** Refer to something specific you discussed to jog their memory.\n- **Call to Action:** End with a polite closing and next steps.\n\nKeep it brief and send it within 24 hours of your interview.',
    excerpt: 'A great follow-up email can set you apart from other candidates. Learn the key components to craft the perfect note that leaves a lasting impression.',
    tags: ['interview', 'communication', 'jobsearch'],
    comments: [],
    bookmarkedBy: []
  },
  {
    id: 'blog5',
    tenantId: 'platform',
    userId: 'system',
    userName: 'JobMatch AI Team',
    userAvatar: 'https://picsum.photos/seed/systemlogo/50/50',
    title: '5 Common Resume Mistakes and How to Fix Them',
    slug: 'common-resume-mistakes',
    author: 'JobMatch AI Team',
    date: '2024-07-24T09:00:00Z',
    imageUrl: 'https://placehold.co/800x400.png',
    dataAiHint: 'resume document',
    content: 'Your resume is your first impression. Avoid these common pitfalls:\n\n1. **Typos and Grammatical Errors:** The easiest way to get rejected. Always proofread multiple times.\n2. **Generic, One-Size-Fits-All Resume:** Tailor your resume for each job. Use our Resume Analyzer to match keywords!\n3. **Focusing on Responsibilities, Not Achievements:** Instead of "Responsible for reports," say "Generated weekly reports that led to a 15% reduction in costs."\n4. **Poor Formatting:** Keep it clean, professional, and easy to read. Use a consistent font and clear sections.\n5. **Being Too Long:** Aim for one page if you have less than 10 years of experience. Be concise.',
    excerpt: 'Avoid these common pitfalls on your resume to make sure you stand out to recruiters for all the right reasons. From typos to poor formatting, we cover how to fix them.',
    tags: ['resume', 'writing', 'career'],
    comments: [],
    bookmarkedBy: []
  },
  {
    id: 'blog6',
    tenantId: 'Brainqy',
    userId: 'alumni-relations',
    userName: 'Alumni Relations',
    userAvatar: 'https://picsum.photos/seed/alumni/50/50',
    title: 'Navigating a Career Change: A Step-by-Step Guide',
    slug: 'navigating-career-change',
    author: 'Alumni Relations',
    date: '2024-07-23T16:00:00Z',
    imageUrl: 'https://placehold.co/800x400.png',
    dataAiHint: 'crossroads path',
    content: 'Changing careers can be daunting, but with a clear plan, it\'s achievable. Here\'s a guide:\n\n- **Self-Assessment:** Identify your transferable skills, interests, and values.\n- **Research:** Explore industries and roles that align with your assessment.\n- **Networking:** Connect with people in your target field. Our Alumni Directory is a great place to start!\n- **Skill-Up:** Take online courses or certifications to fill any skill gaps.\n- **Update Your Brand:** Tailor your resume, cover letter, and LinkedIn profile to your new career path.',
    excerpt: 'Thinking about a career change? This step-by-step guide helps you plan your transition, from self-assessment to landing your new role.',
    tags: ['career change', 'advice', 'planning'],
    comments: [],
    bookmarkedBy: []
  },
  {
    id: 'blog7',
    tenantId: 'Brainqy',
    userId: 'alumni1',
    userName: 'Alice Wonderland',
    userAvatar: 'https://picsum.photos/seed/alice/50/50',
    title: 'Building Your Personal Brand on LinkedIn',
    slug: 'building-personal-brand-linkedin',
    author: 'Alice Wonderland',
    date: '2024-07-22T10:00:00Z',
    imageUrl: 'https://placehold.co/800x400.png',
    dataAiHint: 'linkedin profile',
    content: 'LinkedIn is more than an online resume. It\'s a powerful tool for building your personal brand. Here are some quick tips:\n\n1. **Professional Headshot:** Your picture is the first thing people see.\n2. **Compelling Headline:** Go beyond your job title. What value do you provide?\n3. **Engaging Summary:** Write a first-person narrative about your skills and career goals.\n4. **Share Relevant Content:** Post articles, share insights, and comment on others\' posts to show your expertise.\n5. **Get Recommendations:** Ask colleagues and mentors to endorse your skills and write recommendations.',
    excerpt: 'Your LinkedIn profile is a key part of your professional identity. Learn how to optimize your profile, share content, and build a strong personal brand.',
    tags: ['linkedin', 'personal branding', 'networking'],
    comments: [],
    bookmarkedBy: []
  },
  {
    id: 'blog8',
    tenantId: 'platform',
    userId: 'system',
    userName: 'Career Coach Pro',
    userAvatar: 'https://picsum.photos/seed/coach/50/50',
    title: 'How to Answer "What Are Your Salary Expectations?"',
    slug: 'how-to-answer-salary-expectations',
    author: 'Career Coach Pro',
    date: '2024-07-21T14:00:00Z',
    imageUrl: 'https://placehold.co/800x400.png',
    dataAiHint: 'salary negotiation',
    content: 'This question can be tricky. Here\'s how to handle it:\n\n1. **Do Your Research:** Use sites like Glassdoor, Levels.fyi, and LinkedIn to research the salary range for your role, experience level, and location.\n2. **Provide a Range:** Instead of a single number, provide a thoughtful and well-researched range. "Based on my research for this type of role in this area, I\'m expecting a salary in the range of $X to $Y."\n3. **Focus on Value:** You can also deflect by focusing on the role itself. "I\'d prefer to learn more about the role\'s responsibilities and the total compensation package before discussing a specific number."\n4. **Know Your Worth:** Be prepared with a number you are happy with, but always start the negotiation higher.',
    excerpt: 'The dreaded salary question can be intimidating. We break down how to research, prepare, and confidently answer questions about your salary expectations.',
    tags: ['salary', 'negotiation', 'interview'],
    comments: [],
    bookmarkedBy: []
  },
  {
    id: 'blog1',
    tenantId: 'platform',
    userId: 'system',
    userName: 'JobMatch AI Team',
    userAvatar: 'https://picsum.photos/seed/systemlogo/50/50',
    title: 'Mastering the AI Resume Analysis',
    slug: 'mastering-ai-resume-analysis',
    author: 'JobMatch AI Team',
    date: '2024-07-20T10:00:00Z',
    imageUrl: 'https://placehold.co/800x400.png?text=AI+Resume+Analysis',
    dataAiHint: 'resume analysis report',
    content: 'Learn how to leverage our AI analysis tool to its full potential. Understand match scores, keyword analysis, and how to use suggestions effectively...\n\nOur AI engine scans your resume against the provided job description, identifying key skills, experiences, and keywords. It then calculates a match score based on alignment.\n\n**Understanding the Score:**\n- **80%+:** Excellent match, likely a strong candidate.\n- **60-79%:** Good match, minor adjustments might be needed.\n- **Below 60%:** Significant gaps, consider tailoring your resume.\n\n**Using Suggestions:**\nThe AI provides suggestions for improvement. Focus on incorporating missing keywords naturally and highlighting relevant experiences mentioned in the job description. Remember, authenticity is key!\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Learn how to leverage our AI analysis tool to its full potential. Understand match scores, keyword analysis...',
    tags: ['resume', 'ai', 'jobsearch'],
    comments: [],
    bookmarkedBy: []
  },
  {
    id: 'blog2',
    tenantId: 'Brainqy',
    userId: 'alumni1',
    userName: 'Alice Wonderland',
    userAvatar: 'https://picsum.photos/seed/alice/50/50',
    title: 'Networking Success Stories from Brainqy University Alumni',
    slug: 'brainqy-uni-networking-success',
    author: 'Alumni Relations (Brainqy University)',
    date: '2024-07-15T14:30:00Z',
    imageUrl: 'https://placehold.co/800x400.png?text=Networking+Success',
    dataAiHint: 'networking success',
    content: 'Hear inspiring stories from fellow alumni who found opportunities through the JobMatch AI network. Discover tips for effective networking...\n\nAlice Wonderland (Class of \'15) shares how a connection made through the platform led to her current role at Google. "The recommendation feature pointed me towards someone I hadn\'t considered, and it turned out to be the perfect connection," she says.\n\nBob The Builder (Class of \'18) used the Alumni Directory filters to find mentors in Product Management. "Being able to filter by skills and industry was invaluable," Bob notes.\n\n**Networking Tips:**\n1. Personalize your connection requests.\n2. Be clear about what you\'re seeking (advice, referral, chat).\n3. Follow up respectfully.\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Hear inspiring stories from fellow alumni who found opportunities through the JobMatch AI network...',
    tags: ['networking', 'career', 'success stories', 'brainqy university'],
    comments: [],
    bookmarkedBy: []
  },
  {
    id: 'blog3',
    tenantId: 'platform',
    userId: 'system',
    userName: 'JobMatch AI Team',
    userAvatar: 'https://picsum.photos/seed/systemlogo/50/50',
    title: 'The Power of Mentorship: Connecting Generations',
    slug: 'power-of-mentorship',
    author: 'JobMatch AI Team',
    date: '2024-07-10T09:00:00Z',
    imageUrl: 'https://placehold.co/800x400.png?text=Mentorship+Concept',
    dataAiHint: 'mentorship people',
    content: 'Explore the benefits of both being a mentor and finding a mentor within our community. How our platform facilitates these connections...\n\nMentorship provides invaluable guidance for career growth. Our platform makes it easy to identify alumni willing to offer support in specific areas.\n\n**Benefits for Mentees:**\n- Gain industry insights.\n- Receive personalized career advice.\n- Expand your professional network.\n\n**Benefits for Mentors:**\n- Develop leadership skills.\n- Give back to the community.\n- Stay connected with emerging talent.\n\nUse the Alumni Directory filters to find potential mentors or mentees based on your interests and needs.\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Explore the benefits of both being a mentor and finding a mentor within our community...',
    tags: ['mentorship', 'community', 'connections'],
    comments: [],
    bookmarkedBy: []
  },
];

export let sampleBlogGenerationSettings: BlogGenerationSettings = {
  generationIntervalHours: 24,
  topics: ['Career Advice', 'Resume Writing Tips', 'Interview Skills', 'Networking Strategies', 'Industry Trends'],
  style: 'informative',
  lastGenerated: undefined,
};

```
- usr/src/app/src/lib/data/challenges.ts:
```ts

import type { DailyChallenge } from "@/types";

export const sampleChallenges: DailyChallenge[] = [
  {
    id: "flip-challenge-1",
    type: 'flip',
    title: "Platform Power User",
    description: "Complete the following tasks to prove your mastery of the platform and earn a massive XP boost!",
    xpReward: 1000,
    tasks: [
      { description: "Refer 5 colleagues to the platform.", action: "refer", target: 5 },
      { description: "Analyze your resume against 3 different job descriptions.", action: "analyze_resume", target: 3 },
    ]
  },
  {
    id: "challenge-1",
    type: 'standard',
    date: "2023-10-27",
    title: "Reverse a String",
    description: "Write a function that reverses a given string.",
    difficulty: "Easy",
    category: "Coding",
    solution: "A common approach is to use `str.split('').reverse().join('')` in JavaScript, or to use a two-pointer technique swapping characters from the start and end of the string.",
  },
  {
    id: "challenge-2",
    type: 'standard',
    date: "2023-10-28",
    title: "Find the Missing Number",
    description: "Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing from the array.",
    difficulty: "Medium",
    category: "Coding",
    solution: "Calculate the expected sum of the sequence using the formula n*(n+1)/2. The missing number is the difference between the expected sum and the actual sum of the array elements.",
  },
   {
    id: "flip-challenge-2",
    type: 'flip',
    title: "Interview Champion",
    description: "Hone your interview skills by actively participating in mock interviews.",
    xpReward: 1000,
    tasks: [
      { description: "Attend at least 2 mock interviews as the candidate.", action: "attend_interview", target: 2 },
      { description: "Conduct 1 mock interview as the interviewer.", action: "take_interview", target: 1 },
    ]
  },
  {
    id: "challenge-3",
    type: 'standard',
    date: "2023-10-29",
    title: "Longest Common Subsequence",
    description: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    difficulty: "Hard",
    category: "Coding",
    solution: "This is a classic dynamic programming problem. Use a 2D DP table where dp[i][j] is the length of the LCS for the first i characters of text1 and the first j characters of text2.",
  },
  {
    id: "flip-challenge-3",
    type: 'flip',
    title: "Community Builder",
    description: "Help grow our community by posting jobs and referring new members.",
    xpReward: 1000,
    tasks: [
      { description: "Post 2 new, valid job opportunities on the job board.", action: "post_job", target: 2 },
      { description: "Successfully refer 3 new members who sign up.", action: "refer", target: 3 },
    ]
  },
  {
    id: "flip-challenge-4",
    type: 'flip',
    title: "Platform Guru",
    description: "Demonstrate your complete mastery of the JobMatch AI ecosystem by completing these advanced tasks.",
    xpReward: 2500,
    tasks: [
      { description: "Analyze a resume, then use Power Edit to apply at least one AI suggestion and re-analyze.", action: "power_edit_resume", target: 1 },
      { description: "Create and save a custom interview quiz with at least 5 questions from the question bank.", action: "create_quiz", target: 1 },
      { description: "Successfully book an appointment with an alumni mentor.", action: "book_appointment", target: 1 }
    ]
  },
  {
    id: "challenge-4",
    type: 'standard',
    date: "2023-10-30",
    title: "Find the Maximum Element in an Array",
    description: "Write a function to find the largest number in a given array of integers.",
    difficulty: "Easy",
    category: "Coding",
    solution: "Initialize a variable with the first element of the array. Iterate through the rest of the array, updating the variable if you find a larger element.",
  },
  {
    id: "challenge-5",
    type: 'standard',
    date: "2023-10-31",
    title: "Reverse a Linked List",
    description: "Reverse a singly linked list. Return the reversed list.",
    difficulty: "Medium",
    category: "Coding",
    solution: "Iterate through the list, keeping track of the previous, current, and next nodes. In each iteration, reverse the 'next' pointer of the current node to point to the previous node.",
  },
];

```
- usr/src/app/src/lib/data/community.ts:
```ts

// This file is now obsolete and its contents have been migrated to the database.
// It can be removed.

    
```
- usr/src/app/src/lib/data/companies.ts:
```ts
import type { ProductCompany } from '@/types';

export const sampleProductCompanies: ProductCompany[] = [
  // Fintech Companies
  { id: 'comp-ft-1', name: 'Serrala Center Of Excellence', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=SC' },
  { id: 'comp-ft-2', name: 'Euronet Global Development Center', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=EG' },
  { id: 'comp-ft-3', name: 'MasterCard', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=MC' },
  { id: 'comp-ft-4', name: 'Crif Solutions', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=CS' },
  { id: 'comp-ft-5', name: 'Western Union', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=WU' },
  { id: 'comp-ft-6', name: 'TransUnion', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=TU' },
  { id: 'comp-ft-7', name: 'i-exceed', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=IE' },
  { id: 'comp-ft-8', name: 'stylopay', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=SP' },
  { id: 'comp-ft-9', name: 'Broadridge', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=BR' },
  { id: 'comp-ft-10', name: 'Visa', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=VI' },
  { id: 'comp-ft-11', name: 'Accordion Technology', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=AT' },
  { id: 'comp-ft-12', name: 'IG Group', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=IG' },
  { id: 'comp-ft-13', name: 'FIS', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=FS' },
  { id: 'comp-ft-14', name: 'PayU', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=PU' },
  { id: 'comp-ft-15', name: 'White Clarke Group', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=WC' },
  { id: 'comp-ft-16', name: 'Global Payments', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=GP' },
  { id: 'comp-ft-17', name: 'Verifone', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=VF' },
  { id: 'comp-ft-18', name: 'PayPal', location: 'Pune, India', websiteUrl: '#', domain: 'Fintech', logoUrl: 'https://placehold.co/100x100/1abc9c/FFFFFF&text=PP' },

  // Banking and Finance Companies
  { id: 'comp-bf-1', name: 'Bank of America', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=BA' },
  { id: 'comp-bf-2', name: 'DTCC', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=DT' },
  { id: 'comp-bf-3', name: 'ESAF Small Finance Bank', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=ES' },
  { id: 'comp-bf-4', name: 'AMERICAN EXPRESS', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=AX' },
  { id: 'comp-bf-5', name: 'SVC Co operative Bank', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=SV' },
  { id: 'comp-bf-6', name: 'YES Bank', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=YB' },
  { id: 'comp-bf-7', name: 'MSCI Services', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=MS' },
  { id: 'comp-bf-8', name: 'Shinhan Bank', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=SB' },
  { id: 'comp-bf-9', name: 'Arohan', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=AR' },
  { id: 'comp-bf-10', name: 'Aviva India', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=AI' },
  { id: 'comp-bf-11', name: 'Axis Finance', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=AF' },
  { id: 'comp-bf-12', name: 'WTW Global Delivery And Solutions', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=WT' },
  { id: 'comp-bf-13', name: 'Franklin Templeton', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=FT' },
  { id: 'comp-bf-14', name: 'Axa XL', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=AX' },
  { id: 'comp-bf-15', name: 'MetLife', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=ML' },
  { id: 'comp-bf-16', name: 'Invesco', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=IV' },
  { id: 'comp-bf-17', name: 'Axis Bank', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=AB' },
  { id: 'comp-bf-18', name: 'Toppan Merrill', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=TM' },
  { id: 'comp-bf-19', name: 'ALLIANZ SERVICES PRIVATE LIMITED', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=AS' },
  { id: 'comp-bf-20', name: 'Ocwen Financial Corporation', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=OC' },
  { id: 'comp-bf-21', name: 'Equifax', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=EQ' },
  { id: 'comp-bf-22', name: 'Wells Fargo', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=WF' },
  { id: 'comp-bf-23', name: 'IndusInd Bank', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=IB' },
  { id: 'comp-bf-24', name: 'JPMorgan Chase Bank', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=JP' },
  { id: 'comp-bf-25', name: 'NatWest Markets', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=NW' },
  { id: 'comp-bf-26', name: 'Amicorp Group', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=AG' },
  { id: 'comp-bf-27', name: 'Synchrony', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=SY' },
  { id: 'comp-bf-28', name: 'Deutsche Bank', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=DB' },
  { id: 'comp-bf-29', name: 'Swastika Investmart', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=SI' },
  { id: 'comp-bf-30', name: 'Intertrust Group', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=IG' },
  { id: 'comp-bf-31', name: 'Fidelity International', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=FI' },
  { id: 'comp-bf-32', name: 'Swiss Re', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=SR' },
  { id: 'comp-bf-33', name: 'BNP Paribas', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=BP' },
  { id: 'comp-bf-34', name: 'ReSource Pro', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=RP' },
  { id: 'comp-bf-35', name: 'Kroll', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=KR' },
  { id: 'comp-bf-36', name: 'ICICI Securities', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=IS' },
  { id: 'comp-bf-37', name: 'FactSet', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=FS' },
  { id: 'comp-bf-38', name: 'CME Group', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=CG' },
  { id: 'comp-bf-39', name: 'TMF Group', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=TG' },
  { id: 'comp-bf-40', name: 'HSBC', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=HS' },
  { id: 'comp-bf-41', name: 'Edelman Financial Engines', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=EF' },
  { id: 'comp-bf-42', name: 'ANZ', location: 'Mumbai, India', websiteUrl: '#', domain: 'Banking & Finance', logoUrl: 'https://placehold.co/100x100/3498db/FFFFFF&text=AZ' },

  // Product Based Companies
  { id: 'comp-pb-1', name: 'Google', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=G' },
  { id: 'comp-pb-2', name: 'Microsoft', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=MS' },
  { id: 'comp-pb-3', name: 'Apple', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=AP' },
  { id: 'comp-pb-4', name: 'Amazon', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=AM' },
  { id: 'comp-pb-5', name: 'Uber', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=UB' },
  { id: 'comp-pb-6', name: 'CoinBase', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=CB' },
  { id: 'comp-pb-7', name: 'LinkedIn', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=LI' },
  { id: 'comp-pb-8', name: 'Goldman Sachs', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=GS' },
  { id: 'comp-pb-9', name: 'Twitter', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=TW' },
  { id: 'comp-pb-10', name: 'Stripe', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=ST' },
  { id: 'comp-pb-11', name: 'Flipkart', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=FK' },
  { id: 'comp-pb-12', name: 'Adobe', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=AD' },
  { id: 'comp-pb-13', name: 'Atlassian', location: 'Australia', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=AT' },
  { id: 'comp-pb-14', name: 'D.E.Shaw', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=DE' },
  { id: 'comp-pb-15', name: 'Directi', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=DI' },
  { id: 'comp-pb-16', name: 'Media.net', location: 'UAE', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=MN' },
  { id: 'comp-pb-17', name: 'Zeta', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=ZT' },
  { id: 'comp-pb-18', name: 'Intuit', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=IT' },
  { id: 'comp-pb-19', name: 'InMobi', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=IM' },
  { id: 'comp-pb-20', name: 'Walmart labs', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=WL' },
  { id: 'comp-pb-21', name: 'Arcesium', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=AR' },
  { id: 'comp-pb-22', name: 'SalesForce', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=SF' },
  { id: 'comp-pb-23', name: 'Rubrik', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=RB' },
  { id: 'comp-pb-24', name: 'Nutanix', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=NU' },
  { id: 'comp-pb-25', name: 'Rippling', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=RP' },
  { id: 'comp-pb-26', name: 'Slack', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=SL' },
  { id: 'comp-pb-27', name: 'Twilio', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=TL' },
  { id: 'comp-pb-28', name: 'Tekion', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=TK' },
  { id: 'comp-pb-29', name: 'Github', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=GH' },
  { id: 'comp-pb-30', name: 'Swiggy', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=SW' },
  { id: 'comp-pb-31', name: 'Unacademy', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=UN' },
  { id: 'comp-pb-32', name: 'Cred', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=CR' },
  { id: 'comp-pb-33', name: 'Grab', location: 'Singapore', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=GR' },
  { id: 'comp-pb-34', name: 'PhonePe', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=PP' },
  { id: 'comp-pb-35', name: 'ShareChat', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=SC' },
  { id: 'comp-pb-36', name: 'RazorPay', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=RP' },
  { id: 'comp-pb-37', name: 'Udaan', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=UD' },
  { id: 'comp-pb-38', name: 'Meesho', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=ME' },
  { id: 'comp-pb-39', name: 'BharatPe', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=BP' },
  { id: 'comp-pb-40', name: 'ClearTax', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=CT' },
  { id: 'comp-pb-41', name: 'CultFit', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=CF' },
  { id: 'comp-pb-42', name: 'Dunzo', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=DZ' },
  { id: 'comp-pb-43', name: 'Zomato', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=ZM' },
  { id: 'comp-pb-44', name: 'Hotstar', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=HS' },
  { id: 'comp-pb-45', name: 'Glance', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=GL' },
  { id: 'comp-pb-46', name: 'Myntra', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=MY' },
  { id: 'comp-pb-47', name: 'Acko', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=AC' },
  { id: 'comp-pb-48', name: 'MakeMyTrip', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=MT' },
  { id: 'comp-pb-49', name: 'Paytm', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=PT' },
  { id: 'comp-pb-50', name: 'OLA', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=OL' },
  { id: 'comp-pb-51', name: 'Gojek', location: 'Indonesia', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=GJ' },
  { id: 'comp-pb-52', name: 'Oracle', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=OR' },
  { id: 'comp-pb-53', name: 'Paypal', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=PP' },
  { id: 'comp-pb-54', name: 'Samsung', location: 'South Korea', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=SS' },
  { id: 'comp-pb-55', name: 'SnapDeal', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=SD' },
  { id: 'comp-pb-56', name: 'UrbanCompany', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=UC' },
  { id: 'comp-pb-57', name: 'DreamSports', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=DS' },
  { id: 'comp-pb-58', name: 'MPL', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=MP' },
  { id: 'comp-pb-59', name: 'Morgan Stanley', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=MS' },
  { id: 'comp-pb-60', name: 'Target', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=TA' },
  { id: 'comp-pb-61', name: 'BrowserStack', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=BS' },
  { id: 'comp-pb-62', name: 'Expedia', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=EX' },
  { id: 'comp-pb-63', name: 'OYO', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=OY' },
  { id: 'comp-pb-64', name: 'Delhivery', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=DL' },
  { id: 'comp-pb-65', name: 'Blinkit(Grofers)', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=BL' },
  { id: 'comp-pb-66', name: 'Zerodha', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=ZE' },
  { id: 'comp-pb-67', name: 'Groww', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=GR' },
  { id: 'comp-pb-68', name: 'Upstox', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=UP' },
  { id: 'comp-pb-69', name: 'Pine Labs', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=PL' },
  { id: 'comp-pb-70', name: 'Nobroker', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=NB' },
  { id: 'comp-pb-71', name: 'PharmEasy', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=PE' },
  { id: 'comp-pb-72', name: 'Apna', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=AP' },
  { id: 'comp-pb-73', name: 'TrueCaller', location: 'Sweden', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=TC' },
  { id: 'comp-pb-74', name: 'GupShup', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=GS' },
  { id: 'comp-pb-75', name: 'Hike', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=HK' },
  { id: 'comp-pb-76', name: 'BigBasket', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=BB' },
  { id: 'comp-pb-77', name: 'TimesInternet', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=TI' },
  { id: 'comp-pb-78', name: 'Quikr', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=QK' },
  { id: 'comp-pb-79', name: 'Cars24', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=C4' },
  { id: 'comp-pb-80', name: 'Zenefits', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=ZF' },
  { id: 'comp-pb-81', name: 'UpGrad', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=UG' },
  { id: 'comp-pb-82', name: 'PAYU', location: 'Netherlands', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=PY' },
  { id: 'comp-pb-83', name: 'PolicyBazaar', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=PB' },
  { id: 'comp-pb-84', name: 'CoinSwitch', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=CS' },
  { id: 'comp-pb-85', name: 'DigitInsurance', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=DI' },
  { id: 'comp-pb-86', name: 'JPMorgan Chase & Co.', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=JP' },
  { id: 'comp-pb-87', name: 'Visa', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=VS' },
  { id: 'comp-pb-88', name: 'VMWARE', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=VM' },
  { id: 'comp-pb-89', name: 'Yahoo', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=YH' },
  { id: 'comp-pb-90', name: 'VERSE', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=VR' },
  { id: 'comp-pb-91', name: 'Slice', location: 'India', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=SL' },
  { id: 'comp-pb-92', name: 'Vimeo', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=VM' },
  { id: 'comp-pb-93', name: 'Cisco', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=CS' },
  { id: 'comp-pb-94', name: 'MasterCard', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=MC' },
  { id: 'comp-pb-95', name: 'Zynga', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=ZY' },
  { id: 'comp-pb-96', name: 'Nvidia', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=NV' },
  { id: 'comp-pb-97', name: 'Innovaccer', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=IN' },
  { id: 'comp-pb-98', name: 'SapLabs', location: 'Germany', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=SL' },
  { id: 'comp-pb-99', name: 'MindTickle', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=MT' },
  { id: 'comp-pb-100', name: 'MongoDB', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=MD' },
  { id: 'comp-pb-101', name: 'Amdocs', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=AM' },
  { id: 'comp-pb-102', name: 'Facebook', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=FB' },
  { id: 'comp-pb-103', name: 'Hewlett-Packard(HP)', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=HP' },
  { id: 'comp-pb-104', name: 'Informatica', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=IN' },
  { id: 'comp-pb-105', name: 'Intel', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=IN' },
  { id: 'comp-pb-106', name: 'McAfee', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=MC' },
  { id: 'comp-pb-107', name: 'BMC', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=BM' },
  { id: 'comp-pb-108', name: 'Qualcomm', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=QC' },
  { id: 'comp-pb-109', name: 'ADP', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=AD' },
  { id: 'comp-pb-110', name: 'Electronic Arts', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=EA' },
  { id: 'comp-pb-111', name: 'ServiceNow', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=SN' },
  { id: 'comp-pb-112', name: 'AIRBNB', location: 'USA', websiteUrl: '#', domain: 'Product Based', logoUrl: 'https://placehold.co/100x100/e74c3c/FFFFFF&text=AB' },
];
```
- usr/src/app/src/lib/data/jobs.ts:
```ts

// This file is now obsolete as job data is managed in the database.
// It can be removed.

    
```
- usr/src/app/src/lib/sample-challenges.ts:
```ts
import { type DailyChallenge } from "@/types"; // Assuming you have a types file

const sampleChallenges: DailyChallenge[] = [
  {
    id: "flip-challenge-1",
    type: 'flip',
    title: "Platform Power User",
    description: "Complete the following tasks to prove your mastery of the platform and earn a massive XP boost!",
    xpReward: 1000,
    tasks: [
      { description: "Refer 5 colleagues to the platform.", action: "refer", target: 5 },
      { description: "Analyze your resume against 3 different job descriptions.", action: "analyze_resume", target: 3 },
    ]
  },
  {
    id: "challenge-1",
    type: 'standard',
    date: "2023-10-27",
    title: "Reverse a String",
    description: "Write a function that reverses a given string.",
    difficulty: "Easy",
    category: "Coding",
    solution: "A common approach is to use `str.split('').reverse().join('')` in JavaScript, or to use a two-pointer technique swapping characters from the start and end of the string.",
  },
  {
    id: "challenge-2",
    type: 'standard',
    date: "2023-10-28",
    title: "Find the Missing Number",
    description: "Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing from the array.",
    difficulty: "Medium",
    category: "Coding",
    solution: "Calculate the expected sum of the sequence using the formula n*(n+1)/2. The missing number is the difference between the expected sum and the actual sum of the array elements.",
  },
   {
    id: "flip-challenge-2",
    type: 'flip',
    title: "Interview Champion",
    description: "Hone your interview skills by actively participating in mock interviews.",
    xpReward: 1000,
    tasks: [
      { description: "Attend at least 2 mock interviews as the candidate.", action: "attend_interview", target: 2 },
      { description: "Conduct 1 mock interview as the interviewer.", action: "take_interview", target: 1 },
    ]
  },
  {
    id: "challenge-3",
    type: 'standard',
    date: "2023-10-29",
    title: "Longest Common Subsequence",
    description: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    difficulty: "Hard",
    category: "Coding",
    solution: "This is a classic dynamic programming problem. Use a 2D DP table where dp[i][j] is the length of the LCS for the first i characters of text1 and the first j characters of text2.",
  },
  {
    id: "flip-challenge-3",
    type: 'flip',
    title: "Community Builder",
    description: "Help grow our community by posting jobs and referring new members.",
    xpReward: 1000,
    tasks: [
      { description: "Post 2 new, valid job opportunities on the job board.", action: "post_job", target: 2 },
      { description: "Successfully refer 3 new members who sign up.", action: "refer", target: 3 },
    ]
  },
  {
    id: "flip-challenge-4",
    type: 'flip',
    title: "Platform Guru",
    description: "Demonstrate your complete mastery of the JobMatch AI ecosystem by completing these advanced tasks.",
    xpReward: 2500,
    tasks: [
      { description: "Analyze a resume, then use Power Edit to apply at least one AI suggestion and re-analyze.", action: "power_edit_resume", target: 1 },
      { description: "Create and save a custom interview quiz with at least 5 questions from the question bank.", action: "create_quiz", target: 1 },
      { description: "Successfully book an appointment with an alumni mentor.", action: "book_appointment", target: 1 }
    ]
  },
  {
    id: "challenge-4",
    type: 'standard',
    date: "2023-10-30",
    title: "Find the Maximum Element in an Array",
    description: "Write a function to find the largest number in a given array of integers.",
    difficulty: "Easy",
    category: "Coding",
    solution: "Initialize a variable with the first element of the array. Iterate through the rest of the array, updating the variable if you find a larger element.",
  },
  {
    id: "challenge-5",
    type: 'standard',
    date: "2023-10-31",
    title: "Reverse a Linked List",
    description: "Reverse a singly linked list. Return the reversed list.",
    difficulty: "Medium",
    category: "Coding",
    solution: "Iterate through the list, keeping track of the previous, current, and next nodes. In each iteration, reverse the 'next' pointer of the current node to point to the previous node.",
  },
];

export default sampleChallenges;
```
- usr/src/app/src/lib/data-services/users.ts:
```ts

'use server';

import type { UserProfile, Tenant } from '@/types';
import { db } from '@/lib/db';
import { sampleTenants } from '@/lib/data/platform';

const log = console.log;

export async function getUsers(tenantId?: string): Promise<UserProfile[]> {
  log(`[DataService] Fetching users for tenant: ${tenantId || 'all'}`);
  try {
    const users = await db.user.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users as unknown as UserProfile[];
  } catch (error) {
    console.error('[DataService] Error fetching users:', error);
    return [];
  }
}


export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  log(`[DataService] Fetching user by email: ${email}`);
  const user = await db.user.findUnique({
    where: { email },
  });
  if (!user) {
      return null;
  }
  return user as unknown as UserProfile;
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  log(`[DataService] Fetching user by id: ${id}`);
  const user = await db.user.findUnique({
    where: { id },
  });
  return user as unknown as UserProfile | null;
}

export async function createUser(data: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!data.name || !data.email || !data.role) {
        throw new Error("Name, email, and role are required to create a user.");
    }

    const defaultTenantId = 'brainqy';
    const password = data.password;

    const newUserPayload = {
        id: `user-${Date.now()}`,
        tenantId: data.tenantId || defaultTenantId,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data?.status || 'active',
        lastLogin: new Date(),
        createdAt: new Date(),
        password: password,
        sessionId: `session-${Date.now()}`,
        currentJobTitle: data?.currentJobTitle || '',
        skills: data?.skills || [],
        bio: data?.bio || '',
        profilePictureUrl: data?.profilePictureUrl || `https://avatar.vercel.sh/${data.email}.png`,
        xpPoints: 0,
        dailyStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        weeklyActivity: Array(7).fill(false),
        earnedBadges: [],
        interviewCredits: 5,
        isDistinguished: false,
        shortBio: '',
        university: '',
    };
    
    log(`[DataService] Creating user in real DB: ${data.email}`);
    
    const tenantExists = await db.tenant.findUnique({
      where: { id: newUserPayload.tenantId },
    });

    if (!tenantExists) {
      const defaultTenantData = sampleTenants.find((t: Tenant) => t.id === defaultTenantId);
      if (defaultTenantData) {
        await db.tenant.create({
          data: {
            id: defaultTenantData.id,
            name: defaultTenantData.name,
            domain: defaultTenantData.domain,
            createdAt: new Date(defaultTenantData.createdAt),
            settings: {
              create: {
                allowPublicSignup: defaultTenantData.settings?.allowPublicSignup ?? true,
                primaryColor: defaultTenantData.settings?.primaryColor,
                accentColor: defaultTenantData.settings?.accentColor,
                customLogoUrl: defaultTenantData.settings?.customLogoUrl,
              }
            }
          }
        });
      }
    }

    const newUser = await db.user.create({
      data: newUserPayload as any,
    });

    return newUser as unknown as UserProfile;
}


export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  log(`[DataService] Updating user: ${userId}`);
  
  const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

 try {
    const user = await db.user.update({
        where: { id: userId },
        data: cleanData as any,
    });
    return user as unknown as UserProfile | null;
  } catch (error) {
    console.error(`[DataService] Error updating user ${userId}:`, error);
    return null;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  log(`[DataService] Deleting user: ${userId}`);
  try {
    await db.user.delete({
      where: { id: userId },
    });
    return true;
  } catch (error) {
    console.error(`[DataService] Error deleting user ${userId}:`, error);
    return false;
  }
}

```
- .gitignore:
```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
**/generated/prisma

```
- usr/src/app/src/lib/actions/auth.ts:
```ts

'use server';

import { getUserByEmail, createUser, updateUser } from '@/lib/data-services/users';
import type { UserProfile } from '@/types';
import { db } from '@/lib/db';

/**
 * Handles user login, scoped to a specific tenant.
 * @param email The user's email address.
 * @param password The user's password.
 * @param tenantId The ID of the tenant from the URL subdomain.
 * @returns The user profile if login is successful, otherwise null.
 */
export async function loginUser(email: string, password?: string, tenantId?: string): Promise<UserProfile | null> {
  try {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      // Admins can only log in on the main domain (no tenantId or tenantId is 'platform')
      const isPlatformLogin = !tenantId || tenantId === 'platform';
      if (user.role === 'admin' && !isPlatformLogin) {
        console.warn(`Admin login attempt failed on tenant subdomain: ${tenantId}`);
        return null; // Prevent admin login on tenant-specific subdomains
      }
      
      // Regular users/managers must log in on their assigned tenant subdomain
      if (user.role !== 'admin' && user.tenantId !== tenantId) {
        console.warn(`User login failed due to tenant mismatch. User tenant: ${user.tenantId}, Login tenant: ${tenantId}`);
        return null;
      }

      const isPasswordMatch = user.password ? (password === user.password) : true;
      
      if (isPasswordMatch) {
        const sessionId = `session-${Date.now()}`;
        const updatedUser = await updateUser(user.id, { sessionId, lastLogin: new Date().toISOString() });
        return updatedUser;
      }
    }
    console.log(`Login failed for email: ${email}`);
    return null;
  } catch (error) {
    console.error("Error during loginUser:", error);
    return null;
  }
}


/**
 * Handles new user registration.
 * @param userData The data for the new user, including password.
 * @returns An object with success status, a message, and the user object if successful.
 */
export async function signupUser(userData: { name: string; email: string; role: 'user' | 'admin'; password?: string; tenantId?: string; }): Promise<{ success: boolean; user: UserProfile | null; message?: string; error?: string }> {
  try {
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return {
        success: false,
        user: null,
        message: "An account with this email already exists. Please login instead.",
        error: "Account Exists",
      };
    }

    const newUser = await createUser(userData);

    if (newUser) {
      return { success: true, user: newUser };
    }

    return { success: false, user: null, message: "Could not create a new user account." };
  } catch (error) {
    console.error("Error during signupUser:", error);
    return { success: false, user: null, message: 'An unexpected error occurred during signup.' };
  }
}

/**
 * Validates a user's session by checking their email and session ID against the database.
 * @param email The user's email.
 * @param sessionId The user's current session ID.
 * @returns The user profile if the session is valid, otherwise null.
 */
export async function validateSession(email: string, sessionId: string): Promise<UserProfile | null> {
  try {
    const user = await getUserByEmail(email);
    // If the user exists and their session ID matches, the session is valid
    if (user && user.sessionId === sessionId) {
      return user;
    }
    // If session ID doesn't match, it's invalid (e.g., user logged in elsewhere)
    return null;
  } catch (error) {
    console.error("Error during validateSession:", error);
    return null;
  }
}

```
- usr/src/app/src/lib/data/gamification.ts:
```ts

import type { Badge, GamificationRule } from '@/types';

export const sampleBadges: Badge[] = [
    { id: 'profile-pro', name: 'Profile Pro', description: 'Completed 100% of your profile.', icon: 'UserCheck', xpReward: 100, triggerCondition: 'Profile completion reaches 100%' },
    { id: 'early-adopter', name: 'Early Adopter', description: 'Joined within the first month of launch.', icon: 'Award', xpReward: 50, triggerCondition: 'User signup date within launch window' },
    { id: 'networker', name: 'Networker', description: 'Made 10+ alumni connections.', icon: 'Users', xpReward: 75, triggerCondition: 'Number of connections > 10' },
    { id: 'analyzer-ace', name: 'Analyzer Ace', description: 'Analyzed 5+ resumes.', icon: 'Zap', xpReward: 50, triggerCondition: 'Resume scan count > 5' },
    { id: 'contributor', name: 'Contributor', description: 'Posted 5+ times in the community feed.', icon: 'MessageSquare', xpReward: 30, triggerCondition: 'Community post count > 5' },
    { id: 'admin-master', name: 'Admin Master', description: 'Successfully managed platform settings.', icon: 'ShieldCheck', xpReward: 0, triggerCondition: 'User role is Admin' },
    { id: 'platform-architect', name: 'Platform Architect', description: 'Made significant contributions to platform architecture.', icon: 'GitFork', xpReward: 200, triggerCondition: 'Admin assigned for specific contributions' }
];

export const sampleXpRules: GamificationRule[] = [
    { actionId: 'profile_complete_50', description: 'Reach 50% Profile Completion', xpPoints: 25 },
    { actionId: 'profile_complete_100', description: 'Reach 100% Profile Completion', xpPoints: 100 },
    { actionId: 'resume_scan', description: 'Analyze a Resume', xpPoints: 20 },
    { actionId: 'book_appointment', description: 'Book an Appointment', xpPoints: 30 },
    { actionId: 'community_post', description: 'Create a Community Post', xpPoints: 15 },
    { actionId: 'community_comment', description: 'Comment on a Post', xpPoints: 5 },
    { actionId: 'successful_referral', description: 'Successful Referral Signup', xpPoints: 50 },
    { actionId: 'daily_login', description: 'Daily Login', xpPoints: 10 },
];

```
- usr/src/app/src/lib/data/monetization.ts:
```ts

import type { Wallet, PromoCode, Affiliate, AffiliateClick, AffiliateSignup, ReferralHistoryItem } from '@/types';

const MOCK_USER_ID = 'alumni1';
const MOCK_TENANT_ID = 'Brainqy';

export let sampleWalletBalance: Wallet = {
    userId: MOCK_USER_ID,
    coins: 150,
    transactions: [
        { id: 'txn1', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: 'Reward for profile completion', amount: 50, type: 'credit' },
        { id: 'txn2', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), description: 'Used for premium report', amount: -20, type: 'debit' },
        { id: 'txn3', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: 'Appointment booking fee (Bob B.)', amount: -10, type: 'debit' },
        { id: 'txn4', date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), description: 'Daily login bonus', amount: 5, type: 'credit' },
    ]
};

export let samplePromoCodes: PromoCode[] = [
  {
    id: 'promo1',
    code: 'WELCOME50',
    description: 'Grants 50 bonus coins for new users.',
    rewardType: 'coins',
    rewardValue: 50,
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    usageLimit: 100,
    timesUsed: 25,
    isActive: true,
  },
  {
    id: 'promo2',
    code: 'XPBOOST',
    description: 'Get an extra 100 XP!',
    rewardType: 'xp',
    rewardValue: 100,
    usageLimit: 0, // Unlimited
    timesUsed: 150,
    isActive: true,
  },
  {
    id: 'promo3',
    code: 'PREMIUMTEST',
    description: '7 days of premium access.',
    rewardType: 'premium_days',
    rewardValue: 7,
    usageLimit: 50,
    timesUsed: 50,
    isActive: true,
  },
   {
    id: 'promo4',
    code: 'OLDCODE',
    description: 'An expired test code.',
    rewardType: 'coins',
    rewardValue: 10,
    expiresAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    usageLimit: 100,
    timesUsed: 10,
    isActive: true,
  },
  {
    id: 'promo5',
    code: 'INACTIVE',
    description: 'A currently inactive code.',
    rewardType: 'coins',
    rewardValue: 20,
    usageLimit: 100,
    timesUsed: 0,
    isActive: false,
  }
];

export const sampleReferralHistory: ReferralHistoryItem[] = [
  { id: 'ref1', referrerUserId: 'alumni1', referredEmailOrName: 'friend1@example.com', referralDate: new Date(Date.now() - 86400000 * 7).toISOString(), status: 'Signed Up' },
  { id: 'ref2', referrerUserId: 'managerUser1', referredEmailOrName: 'colleague@example.com', referralDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Reward Earned', rewardAmount: 25 },
  { id: 'ref3', referrerUserId: 'alumni2', referredEmailOrName: 'contact@example.com', referralDate: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Pending' },
  { id: 'ref4', referrerUserId: 'alumni2', referredEmailOrName: 'another@example.com', referralDate: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'Expired' },
  { id: 'ref5', referrerUserId: 'managerUser1', referredEmailOrName: 'newcorpcontact@example.com', referralDate: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'Signed Up' },
];

export const sampleAffiliates: Affiliate[] = [
  {
    id: 'affiliateuser1',
    userId: 'alumni1',
    name: 'Alice Wonderland',
    email: 'alice.wonderland@example.com',
    status: 'approved',
    affiliateCode: 'ALICEAFF1',
    commissionRate: 0.15,
    totalEarned: 75.00,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'affiliateuser2',
    userId: 'alumni2',
    name: 'Bob The Builder',
    email: 'bob.builder@example.com',
    status: 'pending',
    affiliateCode: 'BOBAFF2',
    commissionRate: 0.12,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
   {
    id: 'affiliateuser3',
    userId: 'alumni3',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    status: 'rejected',
    affiliateCode: 'CHARLIEAFF3',
    commissionRate: 0.10,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'affiliateuser4',
    userId: 'managerUser1',
    name: 'Manager Mike',
    email: 'manager.mike@tenant2.com',
    status: 'approved',
    affiliateCode: 'MIKEAFF4',
    commissionRate: 0.20,
    totalEarned: 125.50,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

export const sampleAffiliateClicks: AffiliateClick[] = [
  { id: 'click1', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), convertedToSignup: true },
  { id: 'click2', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false },
  { id: 'click3', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), convertedToSignup: true },
  { id: 'click4', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 0.5 * 86400000).toISOString(), convertedToSignup: false },
  { id: 'click5', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), convertedToSignup: false },
  { id: 'click6', affiliateId: 'affiliateuser2', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false },
];

export const sampleAffiliateSignups: AffiliateSignup[] = [
  { id: 'signup1', affiliateId: 'affiliateuser4', newUserId: 'newUserFromMike1', signupDate: new Date(Date.now() - 86400000 * 2).toISOString(), commissionEarned: 7.50 },
  { id: 'signup2', affiliateId: 'affiliateuser1', newUserId: 'newUserFromAlice1', signupDate: new Date(Date.now() - 86400000 * 3).toISOString(), commissionEarned: 5.00 },
  { id: 'signup3', affiliateId: 'affiliateuser4', newUserId: 'newUserFromMike2', signupDate: new Date(Date.now() - 86400000 * 1).toISOString(), commissionEarned: 10.00 },
  { id: 'signup4', affiliateId: 'affiliateuser1', newUserId: 'newUserFromAlice2', signupDate: new Date(Date.now() - 86400000 * 5).toISOString(), commissionEarned: 5.00 },
];
```