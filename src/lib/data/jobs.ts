
import type { JobApplication, JobOpening } from '@/types';
import { sampleUserProfile } from './users';

export let sampleJobApplications: JobApplication[] = [
  { id: '1', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'Tech Solutions Inc.', jobTitle: 'Software Engineer', status: 'Applied', dateApplied: '2024-07-01', notes: 'Applied via company portal.', location: 'Remote', reminderDate: new Date(Date.now() + 86400000 * 7).toISOString(), applicationUrl: 'https://example.com/apply/job1', salary: '150000' },
  {
    id: '2',
    tenantId: 'Brainqy',
    userId: 'managerUser1',
    companyName: 'Innovate LLC',
    jobTitle: 'Frontend Developer',
    status: 'Interviewing',
    dateApplied: '2024-06-25',
    notes: 'First interview scheduled for 2024-07-10.',
    location: 'New York, NY',
    applicationUrl: 'https://example.com/apply/job2',
    salary: '130000',
    resumeIdUsed: 'resume1',
    coverLetterText: 'Dear Innovate LLC Hiring Manager...',
    interviews: [
      { id: 'int1', date: new Date(Date.now() - 86400000 * 10).toISOString(), type: 'Phone Screen', interviewer: 'John Smith', notes: 'Went well, discussed React hooks.' },
      { id: 'int2', date: new Date(Date.now() + 86400000 * 10).toISOString(), type: 'Technical', interviewer: 'Jane Doe', notes: 'Live coding challenge on component design.' }
    ]
  },
  { id: '3', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'Data Corp', jobTitle: 'Data Analyst', status: 'Offer', dateApplied: '2024-06-15', notes: 'Received offer, considering.', location: 'San Francisco, CA', reminderDate: new Date(Date.now() + 86400000 * 3).toISOString(), applicationUrl: 'https://example.com/apply/job3', salary: '110000' },
  { id: '4', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'Web Wizards', jobTitle: 'UX Designer', status: 'Rejected', dateApplied: '2024-06-20', notes: 'Did not proceed after initial screening.', location: 'Austin, TX', salary: '95000' },
  { id: '5', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'CloudNetics', jobTitle: 'Cloud Engineer', status: 'Saved', dateApplied: '2024-07-05', notes: 'Interested, need to tailor resume.', location: 'Boston, MA', sourceJobOpeningId: 'job-board-cloudnetics-01', salary: '140000' },
  { id: '6', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'AI Future', jobTitle: 'Machine Learning Eng.', status: 'Saved', dateApplied: '2024-07-15', notes: 'From scan report, good match.', location: 'Seattle, WA', sourceJobOpeningId: 'job-board-aifuture-02', salary: '160000' },
  { id: '7', tenantId: 'Brainqy', userId: 'alumni1', companyName: 'Innovatech Solutions Inc.', jobTitle: 'Senior Frontend Developer', status: 'Applied', dateApplied: '2024-07-20', notes: 'Applied using AI generated cover letter.', location: 'San Francisco, CA', reminderDate: new Date(Date.now() + 86400000 * 5).toISOString(), applicationUrl: 'https://example.com/innovatech/apply', salary: '145000' },
  {
    id: '8',
    tenantId: 'Brainqy',
    userId: 'alumni1',
    companyName: 'Web Solutions Co.',
    jobTitle: 'Frontend Developer',
    status: 'Interviewing',
    dateApplied: '2024-07-18',
    notes: 'Had a great phone screen, technical round is next.',
    location: 'Remote',
    applicationUrl: 'https://example.com/websolutions/apply',
    salary: '125000',
    interviews: [
      { id: 'int3', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'Phone Screen', interviewer: 'Emily White', notes: 'Positive initial call. Discussed React experience and portfolio. Seemed impressed with the live coding challenge solution.' },
      { id: 'int4', date: new Date(Date.now() + 86400000 * 4).toISOString(), type: 'Technical', interviewer: 'David Green', notes: 'Upcoming technical deep dive on state management and performance optimization.' },
    ]
  },
];

export const sampleJobOpenings: JobOpening[] = [
  { id: 'job1', tenantId: 'Brainqy', title: 'Junior Developer', company: 'Google', postedByAlumniId: 'managerUser1', alumniName: 'Manager Mike', description: 'Exciting opportunity for recent graduates to join our engineering team. Key skills: Java, Python, Problem Solving.', datePosted: '2024-07-10', location: 'Mountain View, CA', type: 'Full-time', applicationLink: 'https://careers.google.com/jobs/results/' },
  { id: 'job2', tenantId: 'Brainqy', title: 'Marketing Intern (Summer)', company: 'Amazon', postedByAlumniId: 'alumni1', alumniName: 'Alice Wonderland', description: 'Gain hands-on experience in a fast-paced marketing environment. Focus on digital campaigns and market research.', datePosted: '2024-07-08', location: 'Seattle, WA', type: 'Internship', applicationLink: 'https://www.amazon.jobs/en/' },
  { id: 'job3', tenantId: 'Brainqy', title: 'Project Manager - Mentorship Program', company: 'Self-Employed (Mentorship)', postedByAlumniId: 'alumni2', alumniName: 'Bob The Builder', description: 'Looking to mentor aspiring Product Managers. Part-time commitment. Focus on agile methodologies and product strategy.', datePosted: '2024-07-05', location: 'Remote', type: 'Mentorship' },
  { id: 'job-board-cloudnetics-01', tenantId: 'Brainqy', title: 'Cloud Engineer', company: 'CloudNetics', postedByAlumniId: 'managerUser1', alumniName: 'Manager Mike', description: 'Join our innovative cloud solutions team. Experience with AWS/Azure required.', datePosted: '2024-07-03', location: 'Boston, MA', type: 'Full-time', applicationLink: 'https://example.com/cloudnetics/apply' },
  { id: 'job-board-aifuture-02', tenantId: 'Brainqy', title: 'Machine Learning Eng.', company: 'AI Future', postedByAlumniId: 'alumni3', alumniName: 'Charlie Brown', description: 'Work on cutting-edge ML projects. Strong Python and TensorFlow/PyTorch skills needed.', datePosted: '2024-07-14', location: 'Seattle, WA', type: 'Full-time' },
];
