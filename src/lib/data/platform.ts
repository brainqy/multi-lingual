
import type { Tenant, PlatformSettings, SystemAlert, GalleryEvent, ResumeTemplate, Badge, DailyChallenge, TourStep } from '@/types';
import { AreasOfSupport } from '@/types';

export const SAMPLE_TENANT_ID = 'brainqy';
export const SAMPLE_DATA_BASE_DATE = new Date('2025-06-01T12:00:00Z');
export const graduationYears = Array.from({ length: 56 }, (_, i) => (new Date().getFullYear() + 5 - i).toString());

export const sampleTenants: Tenant[] = [
  {
    id: 'brainqy',
    name: 'Brainqy University',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    domain: 'brainqy.JobMatch.ai',
    settings: {
      allowPublicSignup: true,
      customLogoUrl: 'https://placehold.co/200x50/008080/FFFFFF&text=Brainqy+U',
      primaryColor: 'hsl(180 100% 25%)',
      accentColor: 'hsl(180 100% 30%)',
      features: {
        communityFeedEnabled: true,
        jobBoardEnabled: true,
        gamificationEnabled: true,
        walletEnabled: true,
        eventRegistrationEnabled: true,
      },
      emailTemplates: {
        welcomeEmail: 'Welcome to Brainqy University Alumni Network!',
      }
    }
  },
  {
    id: 'tenant-2',
    name: 'Corporate Partner Inc.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    domain: 'cpp.JobMatch.ai',
    settings: {
      allowPublicSignup: false,
      primaryColor: 'hsl(221 83% 53%)',
      accentColor: 'hsl(221 83% 63%)',
      customLogoUrl: 'https://placehold.co/200x50/2C5282/FFFFFF&text=CorpPartner',
      features: {
        communityFeedEnabled: false,
        jobBoardEnabled: true,
        gamificationEnabled: false,
        walletEnabled: false,
        eventRegistrationEnabled: true,
      }
    }
  },
  {
    id: 'tenant-3',
    name: 'Community College Connect',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    domain: 'ccc.JobMatch.ai',
    settings: {
      allowPublicSignup: true,
      primaryColor: 'hsl(39 100% 50%)',
      accentColor: 'hsl(39 100% 55%)',
      customLogoUrl: 'https://placehold.co/200x50/FFBF00/000000&text=CCC',
      features: {
        communityFeedEnabled: true,
        jobBoardEnabled: true,
        gamificationEnabled: true,
        walletEnabled: true,
        eventRegistrationEnabled: false,
      }
    }
  },
];

export let samplePlatformSettings: PlatformSettings = {
  platformName: "JobMatch AI",
  maintenanceMode: false,
  communityFeedEnabled: true,
  autoModeratePosts: true,
  jobBoardEnabled: true,
  maxJobPostingDays: 30,
  gamificationEnabled: true,
  xpForLogin: 10,
  xpForNewPost: 20,
  resumeAnalyzerEnabled: true,
  aiResumeWriterEnabled: true,
  coverLetterGeneratorEnabled: true,
  mockInterviewEnabled: true,
  referralsEnabled: true,
  affiliateProgramEnabled: true,
  alumniConnectEnabled: true,
  defaultAppointmentCost: 10,
  featureRequestsEnabled: true,
  allowTenantCustomBranding: true,
  allowTenantEmailCustomization: false,
  allowUserApiKey: true,
  defaultProfileVisibility: 'alumni_only',
  maxResumeUploadsPerUser: 5,
  defaultTheme: 'light',
  enablePublicProfilePages: false,
  sessionTimeoutMinutes: 60,
  maxEventRegistrationsPerUser: 3,
  globalAnnouncement: 'Welcome to the new and improved JobMatch AI platform! Check out the AI Mock Interview feature.',
  pointsForAffiliateSignup: 50,
  walletEnabled: true,
};

export let sampleSystemAlerts: SystemAlert[] = [
  {
    id: 'alert1',
    type: 'error',
    title: 'Database Connection Issue',
    message: 'Failed to connect to the primary database. Services might be affected. Attempting to reconnect...',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    linkTo: '/admin/platform-settings#database', // Example link
    linkText: 'Check DB Settings',
  },
  {
    id: 'alert2',
    type: 'warning',
    title: 'High CPU Usage Detected',
    message: 'CPU usage on server EU-WEST-1A has exceeded 85% for the last 10 minutes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: 'alert3',
    type: 'info',
    title: 'New Platform Update Deployed',
    message: 'Version 2.5.1 has been successfully deployed to production. See release notes for details.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    linkTo: '/blog/platform-update-v2-5-1',
    linkText: 'Release Notes',
  },
  {
    id: 'alert4',
    type: 'success',
    title: 'Nightly Backup Completed',
    message: 'Full system backup completed successfully without errors.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
  },
  {
    id: 'alert5',
    type: 'warning',
    title: 'Low Disk Space',
    message: 'The main application server disk space is below 10%. Please investigate.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true, // Example of a read alert
  },
];

export let sampleEvents: GalleryEvent[] = [
  { id: 'event1', tenantId: 'Brainqy', title: 'Annual Alumni Meet 2023', date: '2023-10-15T10:00:00Z', imageUrls: ['https://placehold.co/600x400.png?text=Annual+Meet+Pic+1', 'https://placehold.co/600x400.png?text=Networking+View', 'https://placehold.co/600x400.png?text=Awards+Ceremony'], description: 'A wonderful evening connecting with fellow alumni.' , dataAiHint: 'conference networking', approved: true, createdByUserId: 'alumni1', attendeeUserIds: ['managerUser1', 'alumni2', 'alumni4']},
  { id: 'event2', tenantId: 'Brainqy', title: 'Tech Talk Series: AI Today', date: '2024-03-22T10:00:00Z', imageUrls: ['https://placehold.co/600x400.png?text=AI+Presentation'], description: 'Insightful talks on the future of Artificial Intelligence.' , dataAiHint: 'presentation seminar', approved: true, createdByUserId: 'managerUser1', attendeeUserIds: ['alumni1', 'alumni2']},
  { id: 'event3', tenantId: 'Brainqy', title: 'Campus Job Fair Spring 2024', date: '2024-04-10T10:00:00Z', imageUrls: ['https://placehold.co/600x400.png?text=Job+Fair+Stalls', 'https://placehold.co/600x400.png?text=Students+Interacting', 'https://placehold.co/600x400.png?text=Company+Banners'], description: 'Connecting students with top employers.', dataAiHint: 'job fair students', approved: false, createdByUserId: 'managerUser1', attendeeUserIds: ['managerUser1', 'alumni4'] },
  { id: 'event4', tenantId: 'tenant-2', title: 'Tenant 2 Networking Mixer', date: '2024-05-10T10:00:00Z', imageUrls: ['https://placehold.co/600x400.png?text=Corporate+Event+Tenant2'], description: 'Exclusive networking event for Corporate Partner Inc. members.', dataAiHint: 'corporate networking', approved: true, createdByUserId: 'managerUser1', attendeeUserIds: ['alumni3', 'managerUser1'] },
];

export const sampleResumeTemplates: ResumeTemplate[] = [
  {
    id: 'template1',
    name: 'Modern Chronological',
    description: 'A clean, modern take on the classic chronological resume. Great for experienced professionals.',
    previewImageUrl: 'https://placehold.co/300x400.png?text=Modern+Chrono',
    category: 'Modern',
    dataAiHint: 'resume modern',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn Profile URL] | [Your Portfolio URL (Optional)]

Summary
---
[Briefly summarize your career objectives and key qualifications. Tailor this to the job you're applying for.]

Experience
---
[Job Title] | [Company Name] | [City, State] | [Dates of Employment (e.g., Month YYYY – Month YYYY)]
- [Responsibility or accomplishment 1 - Use action verbs]
- [Responsibility or accomplishment 2]
- [Responsibility or accomplishment 3]

[Previous Job Title] | [Previous Company Name] | [City, State] | [Dates of Employment]
- [Responsibility or accomplishment 1]
- [Responsibility or accomplishment 2]

Education
---
[Degree Name] | [Major/Minor] | [University Name] | [City, State] | [Graduation Year]
- [Relevant coursework, honors, or activities (Optional)]

Skills
---
Technical Skills: [List hard skills, e.g., Python, JavaScript, SQL, Microsoft Excel, Adobe Creative Suite]
Soft Skills: [List soft skills, e.g., Communication, Teamwork, Problem-solving, Leadership]
Languages: [List languages and proficiency levels]

Projects (Optional)
---
[Project Name] | [Link to Project (Optional)]
- [Brief description of the project and your role/contributions]
- [Technologies used]

Certifications (Optional)
---
[Certification Name] | [Issuing Organization] | [Date Issued]`
  },
  {
    id: 'template2',
    name: 'Creative Combination',
    description: 'Highlights skills and projects. Ideal for creative fields or career changers.',
    previewImageUrl: 'https://placehold.co/300x400.png?text=Creative+Combo',
    category: 'Creative',
    dataAiHint: 'resume creative',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn Profile URL] | [Your Portfolio URL]

Skills Summary
---
- [Skill 1 with brief example of application]
- [Skill 2 with brief example of application]
- [Skill 3 with brief example of application]
- Technical Proficiencies: [List software, tools, languages]

Projects
---
[Project Name 1] | [Your Role] | [Dates]
- [Description of project and impact. Highlight skills used.]
- [Link to project if available]

[Project Name 2] | [Your Role] | [Dates]
- [Description of project and impact. Highlight skills used.]

Experience
---
[Job Title] | [Company Name] | [City, State] | [Dates of Employment]
- [Key achievement or responsibility 1]
- [Key achievement or responsibility 2]

Education
---
[Degree Name] | [University Name] | [Graduation Year]
- [Relevant coursework or honors]

Awards & Recognition (Optional)
---
- [Award/Recognition 1]
- [Award/Recognition 2]`
  },
  {
    id: 'template3',
    name: 'Functional Skills-Based',
    description: 'Emphasizes skills over work history. Good for those with employment gaps or students.',
    previewImageUrl: 'https://placehold.co/300x400.png?text=Functional+Skills',
    category: 'Functional',
    dataAiHint: 'resume skills',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn Profile URL]

Professional Profile
---
[A concise statement highlighting your key skills and career focus.]

Core Competencies
---
[Skill Category 1 - e.g., Project Management]
- [Demonstrable achievement or experience related to this skill]
- [Another achievement or experience]

[Skill Category 2 - e.g., Communication]
- [Demonstrable achievement or experience]
- [Another achievement or experience]

[Skill Category 3 - e.g., Technical Proficiency]
- [List specific technical skills or software]

Work History
---
[Company Name 1] | [Job Title(s)] | [Dates of Employment (brief)]
[Company Name 2] | [Job Title(s)] | [Dates of Employment (brief)]
(Focus is on skills above, so work history can be more concise)

Education
---
[Degree Name] | [University Name] | [Graduation Year]
- [Relevant academic achievements or projects]

Volunteer Experience (Optional)
---
[Organization Name] | [Role] | [Dates]
- [Brief description of responsibilities and skills utilized]`
  },
  {
    id: 'template4',
    name: 'Academic CV',
    description: 'Designed for academic positions, research roles, and grants. Includes publication sections.',
    previewImageUrl: 'https://placehold.co/300x400.png?text=Academic+CV',
    category: 'Academic',
    dataAiHint: 'cv academic',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn/ResearchGate Profile URL]

Education
---
[Degree (e.g., Ph.D. in Subject)] | [University Name] | [City, State] | [Year of Completion/Expected]
Dissertation: "[Dissertation Title]" (Advisor: [Advisor's Name])

[Master's Degree] | [University Name] | [City, State] | [Year]
Thesis: "[Thesis Title]" (Optional)

[Bachelor's Degree] | [University Name] | [City, State] | [Year]

Research Experience
---
[Position, e.g., Postdoctoral Fellow] | [Lab/Department] | [University Name] | [Dates]
- [Description of research projects, methodologies, and findings.]
- [Key contributions and skills developed.]

[Position, e.g., Research Assistant] | [Lab/Department] | [University Name] | [Dates]
- [Description of research support and activities.]

Teaching Experience
---
[Position, e.g., Teaching Assistant] | [Course Name] | [Department] | [University Name] | [Semesters/Years]
- [Responsibilities, e.g., led discussion sections, graded assignments.]

[Position, e.g., Guest Lecturer] | [Topic] | [Course Name] | [University Name] | [Date]

Publications
---
(Use a consistent citation style, e.g., APA, MLA. List in reverse chronological order.)
Peer-Reviewed Articles:
1. [Author(s)]. ([Year]). [Article Title]. [Journal Name], [Volume](Issue), [Pages].
Book Chapters:
1. [Author(s)]. ([Year]). [Chapter Title]. In [Editor(s) (Eds.)], [Book Title] (pp. [Pages]). [Publisher].

Conference Presentations
---
1. [Author(s)]. ([Year, Month]). [Presentation Title]. Paper presented at the [Conference Name], [Location].

Grants and Awards
---
- [Grant/Award Name] | [Funding Body/Institution] | [Year]
- [Fellowship Name] | [Institution] | [Year]

Skills
---
Research Skills: [e.g., Statistical Analysis (SPSS, R), Qualitative Methods, Experimental Design]
Technical Skills: [e.g., Python, MATLAB, Lab Equipment]
Languages: [Language (Proficiency Level)]

References
---
Available upon request.`
  },
];

export const userDashboardTourSteps: TourStep[] = [
  { title: "Welcome to Your Dashboard!", description: "This is your central hub for managing your career journey with JobMatch AI." },
  { title: "Resume Analysis", description: "Use our AI tools to analyze your resume against job descriptions and get improvement suggestions." },
  { title: "Job Tracker", description: "Keep track of all your job applications in one place with our Kanban-style board." },
  { title: "Alumni Network", description: "Connect with fellow alumni, find mentors, and expand your professional network." },
  { title: "Rewards & Progress", description: "Earn XP and badges for your activity on the platform. Check your progress here!" }
];

export const adminDashboardTourSteps: TourStep[] = [
  { title: "Admin Dashboard Overview", description: "Welcome, Admin! Manage users, tenants, and platform-wide settings from here." },
  { title: "User Management", description: "View, edit, and manage all user accounts across different tenants." },
  { title: "Tenant Management", description: "Oversee and configure settings for individual tenants on the platform." },
  { title: "Gamification Rules", description: "Define and manage XP point rules and badges awarded for user actions." },
  { title: "Content Moderation", description: "Review and manage flagged content from the community feed to maintain a positive environment." }
];

export const managerDashboardTourSteps: TourStep[] = [
  { title: "Manager Dashboard Insights", description: "Hello Manager! Monitor your tenant's engagement, manage specific features, and track key metrics." },
  { title: "Tenant User Activity", description: "View statistics on active users and feature usage within your tenant." },
  { title: "Content Management", description: "Access tools to moderate community content and manage event submissions for your tenant." },
  { title: "Engagement Tools", description: "Utilize features to foster engagement within your tenant's alumni network." }
];
