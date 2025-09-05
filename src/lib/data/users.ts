
// This file is intentionally left blank to remove shadowing of the main users.ts

import type { UserProfile, AlumniProfile } from '@/types';
import { SAMPLE_TENANT_ID } from './platform';

export const sampleUserProfile: UserProfile = {
  id: 'alumni1',
  tenantId: SAMPLE_TENANT_ID,
  role: 'user',
  name: 'Alice Wonderland',
  email: 'alice.wonderland@example.com',
  password: 'password123',
  status: 'active',
  lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  
  // Personal Info
  dateOfBirth: '1995-05-15',
  gender: 'Female',
  mobileNumber: '123-456-7890',
  currentAddress: '123 Storybook Lane, Wonderland',

  // Academic Info
  graduationYear: '2017',
  degreeProgram: 'Bachelor of Technology (B.Tech)',
  department: 'Computer Science',
  university: 'Wonderland University',

  // Professional Info
  currentJobTitle: 'Software Engineer',
  currentOrganization: 'Google',
  industry: 'IT/Software',
  workLocation: 'Mountain View, CA',
  linkedInProfile: 'https://linkedin.com/in/alicewonderland',
  yearsOfExperience: '5+',

  // Skills & Interests
  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'System Design'],
  careerInterests: 'AI, Frontend Development, Product Management',
  bio: 'Creative software engineer with a passion for building delightful user experiences.',
  interests: ['Hiking', 'Photography', 'Chess'],

  // Engagement
  areasOfSupport: ['Mentoring Students', 'Sharing Job Referrals'],
  timeCommitment: '1-2 hours',
  preferredEngagementMode: 'Online',
  lookingForSupportType: 'Career Mentoring',
  helpNeededDescription: 'Looking for guidance on transitioning to a senior engineering role.',

  // Consents
  shareProfileConsent: true,
  featureInSpotlightConsent: true,

  // App-specific data
  profilePictureUrl: 'https://picsum.photos/seed/alice/200/200',
  resumeText: 'Full resume text for Alice Wonderland...',
  userApiKey: '',

  // Gamification
  xpPoints: 1250,
  dailyStreak: 3,
  longestStreak: 10,
  weeklyActivity: [1, 0, 1, 1, 0, 1, 1], // Last 7 days, today is last
  referralCode: 'ALICE123',
  earnedBadges: ['profile-pro', 'networker', 'analyzer-ace', 'streak-starter'],
  interviewCredits: 5,
  isDistinguished: true,
  streakFreezes: 2,
};


export const samplePlatformUsers: UserProfile[] = [
  sampleUserProfile,
  {
    id: 'alumni2',
    tenantId: SAMPLE_TENANT_ID,
    role: 'user',
    name: 'Bob The Builder',
    email: 'bob.builder@example.com',
    password: 'password123',
    currentJobTitle: 'Product Manager',
    currentOrganization: 'Microsoft',
    skills: ['Product Strategy', 'Agile', 'JIRA', 'User Research'],
    bio: 'Experienced Product Manager focused on building user-centric products.',
    xpPoints: 980,
    dailyStreak: 5,
    longestStreak: 5,
    weeklyActivity: [1, 1, 1, 1, 0, 1, 1],
    earnedBadges: ['profile-pro', 'contributor'],
    referralCode: 'BOB234',
    isDistinguished: false,
    streakFreezes: 1,
  },
  {
    id: 'alumni3',
    tenantId: 'tenant-2',
    role: 'user',
    name: 'Charlie Brown',
    email: 'charlie.brown@tenant2.com',
    password: 'password123',
    currentJobTitle: 'Data Analyst',
    currentOrganization: 'Corporate Partner Inc.',
    skills: ['SQL', 'Tableau', 'Python', 'Data Analysis'],
    bio: 'Data Analyst with a knack for finding insights in complex datasets.',
    xpPoints: 720,
    dailyStreak: 1,
    longestStreak: 2,
    weeklyActivity: [0, 0, 0, 1, 0, 0, 1],
    earnedBadges: [],
    referralCode: 'CHARLIE345',
    isDistinguished: false,
    streakFreezes: 0,
  },
  {
    id: 'managerUser1',
    tenantId: 'tenant-2',
    role: 'manager',
    name: 'Manager Mike',
    email: 'manager.mike@tenant2.com',
    password: 'password123',
    currentJobTitle: 'Alumni Engagement Lead',
    currentOrganization: 'Corporate Partner Inc.',
    skills: ['Community Management', 'Event Planning', 'Marketing'],
    bio: 'Dedicated to fostering a strong alumni community for Corporate Partner Inc.',
    xpPoints: 500,
    dailyStreak: 2,
    longestStreak: 8,
    weeklyActivity: [1, 0, 1, 1, 0, 1, 1],
    earnedBadges: [],
    referralCode: 'MIKE456',
    isDistinguished: false,
    streakFreezes: 1,
  },
  {
    id: 'alumni4',
    tenantId: 'Brainqy',
    role: 'user',
    name: 'Dorothy Gale',
    email: 'dorothy.gale@example.com',
    password: 'password123',
    currentJobTitle: 'UX Designer',
    currentOrganization: 'Startup Creative',
    skills: ['Figma', 'User Interface Design', 'Prototyping'],
    bio: 'UX Designer passionate about creating intuitive and beautiful digital experiences.',
    xpPoints: 1100,
    dailyStreak: 8,
    longestStreak: 8,
    weeklyActivity: [1, 1, 1, 1, 1, 1, 1],
    earnedBadges: ['profile-pro', 'networker'],
    referralCode: 'DOROTHY567',
    isDistinguished: true,
    streakFreezes: 3,
  },
  {
    id: 'adminUser1',
    tenantId: 'platform',
    role: 'admin',
    name: 'Admin Ava',
    email: 'admin.ava@JobMatch.ai',
    password: 'password123',
    currentJobTitle: 'Platform Administrator',
    currentOrganization: 'JobMatch AI',
    skills: ['System Administration', 'User Support', 'Database Management'],
    bio: 'Ensuring the smooth operation of the JobMatch AI platform for all users and tenants.',
    xpPoints: 2000,
    dailyStreak: 50,
    longestStreak: 50,
    weeklyActivity: [1, 1, 1, 1, 1, 1, 1],
    earnedBadges: ['admin-master', 'platform-architect'],
    referralCode: 'ADMIN789',
    isDistinguished: true,
    streakFreezes: 5,
  }
];

export const sampleAlumniProfiles: AlumniProfile[] = samplePlatformUsers;
export { sampleUserProfile as default };
