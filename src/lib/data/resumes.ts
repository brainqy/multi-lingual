
import type { ResumeProfile, ResumeScanHistoryItem } from '@/types';
import { samplePlatformUsers } from './users';
import { SAMPLE_DATA_BASE_DATE } from './platform';

const placeholderResumeText = `[Your Name]
[Your Contact Info]

Summary:
Experienced professional seeking a challenging role.

Experience:
Company A - Role 1 (2020-2022)
- Did task X
- Accomplished Y

Education:
University Z - Degree (2016-2020)
`;

const placeholderJobDescription = `Title: Sample Job
Company: Sample Corp
Location: Remote

Responsibilities:
- Do X
- Manage Y
- Achieve Z

Qualifications:
- Skill A
- Skill B
`;

export let sampleResumeProfiles: ResumeProfile[] = [
  { id: 'resume1', tenantId: 'Brainqy', userId: 'alumni1', name: "Software Engineer Focused (Alice)", resumeText: samplePlatformUsers.find(u => u.id === 'alumni1')?.resumeText || "Alice Wonderland's resume focused on software engineering roles...", lastAnalyzed: "2024-07-15" },
  { id: 'resume2', tenantId: 'Brainqy', userId: 'alumni2', name: "Product Manager Application (Bob)", resumeText: "Bob The Builder's resume tailored for product management positions...", lastAnalyzed: "2024-07-10" },
  { id: 'resume3', tenantId: 'tenant-2', userId: 'alumni3', name: "Data Science General (Charlie)", resumeText: "Charlie Brown's general purpose resume for various data roles.", lastAnalyzed: "2024-06-20" },
  { id: 'resumeManager1', tenantId: 'tenant-2', userId: 'managerUser1', name: "Engagement Strategy Lead Resume (Mike)", resumeText: samplePlatformUsers.find(u => u.id === 'managerUser1')?.resumeText || "Resume for Manager Mike, focused on engagement and leadership.", lastAnalyzed: "2024-07-20" },
];

export const sampleResumeScanHistory: ResumeScanHistoryItem[] = [
  {
    id: 'scan1',
    tenantId: 'Brainqy',
    userId: 'alumni1',
    resumeId: 'resume1',
    resumeName: 'Software_Engineer_Resume_v2.pdf',
    jobTitle: `Senior Software Engineer`,
    companyName: 'Innovate LLC',
    resumeTextSnapshot: placeholderResumeText.replace("professional", "software engineer for Innovate LLC"),
    jobDescriptionText: `Title: Senior Software Engineer\nCompany: Innovate LLC\n${placeholderJobDescription}`,
    scanDate: new Date(SAMPLE_DATA_BASE_DATE.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    matchScore: 85,
    bookmarked: true,
  },
  {
    id: 'scan2',
    tenantId: 'Brainqy',
    userId: 'alumni2',
    resumeId: 'resume2',
    resumeName: 'Product_Manager_Profile.docx',
    jobTitle: `Product Lead`,
    companyName: 'FutureTech Corp',
    resumeTextSnapshot: placeholderResumeText.replace("professional", "product manager for FutureTech"),
    jobDescriptionText: `Title: Product Lead\nCompany: FutureTech Corp\n${placeholderJobDescription}`,
    scanDate: new Date(SAMPLE_DATA_BASE_DATE.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    matchScore: 72,
    bookmarked: false,
  },
  {
    id: 'scan3',
    tenantId: 'tenant-2',
    userId: 'alumni3',
    resumeId: 'resume3',
    resumeName: 'General_Data_Resume.pdf',
    jobTitle: `Data Analyst`,
    companyName: 'Data Corp',
    resumeTextSnapshot: placeholderResumeText.replace("professional", "data analyst for Data Corp"),
    jobDescriptionText: `Title: Data Analyst\nCompany: Data Corp\n${placeholderJobDescription}`,
    scanDate: new Date(SAMPLE_DATA_BASE_DATE.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    matchScore: 91,
    bookmarked: false,
  },
   {
    id: 'scan4',
    tenantId: 'tenant-2',
    userId: 'managerUser1',
    resumeId: 'resumeManager1',
    resumeName: 'CorpStrategyResume.pdf',
    jobTitle: `Strategy Consultant`,
    companyName: 'McKinsey',
    resumeTextSnapshot: samplePlatformUsers.find(u => u.id === 'managerUser1')?.resumeText || "Strategic resume content for McKinsey...",
    jobDescriptionText: `Title: Strategy Consultant\nCompany: McKinsey\n${placeholderJobDescription}`,
    scanDate: new Date(SAMPLE_DATA_BASE_DATE.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    matchScore: 88,
    bookmarked: false,
  },
];
