
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
