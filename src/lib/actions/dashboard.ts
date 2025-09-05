
'use server';

import { db } from '@/lib/db';
import type {
  UserProfile,
  Tenant,
  ResumeScanHistoryItem,
  CommunityPost,
  JobApplication,
  AlumniProfile,
  MockInterviewSession,
  Appointment,
  SystemAlert,
  PromotionalContent,
  Activity,
  Badge,
  DailyChallenge,
} from '@/types';

// Mock data is now only used as a fallback in case of a DB error during development.
import {
  sampleMockInterviewSessions,
  sampleSystemAlerts,
  sampleChallenges,
} from '@/lib/sample-data';

const useMockDb = process.env.USE_MOCK_DB === 'true';

// This is the primary data fetching function for all dashboards.
export async function getDashboardData(tenantId?: string | null, userId?: string | null) {
  console.log(`[DashboardAction] Fetching data... (Mock DB: ${useMockDb})`);
  
  // Real database fetching logic using Prisma
  try {
    const users = (await db.user.findMany()) as unknown as UserProfile[];
    const tenants = (await db.tenant.findMany({
      include: { settings: true }
    })) as unknown as Tenant[];
    const resumeScans = (await db.resumeScanHistory.findMany()) as unknown as ResumeScanHistoryItem[];
    const communityPosts = (await db.communityPost.findMany({
        include: { comments: true }
    })) as unknown as CommunityPost[];
    const jobApplications = (await db.jobApplication.findMany({
        include: { interviews: true }
    })) as unknown as JobApplication[];
    const appointments = (await db.appointment.findMany()) as unknown as Appointment[];
    const activities = (await db.activity.findMany({ orderBy: { timestamp: 'desc' }, take: 50 })) as unknown as Activity[];
    const badges = (await db.badge.findMany()) as unknown as Badge[];
    const promotions = (await db.promotionalContent.findMany()) as unknown as PromotionalContent[];


    // For data not yet in DB schema, we can still fall back to mock data
    return {
      users,
      tenants,
      resumeScans,
      communityPosts,
      jobApplications,
      appointments,
      activities,
      badges,
      promotions,
      alumni: users as AlumniProfile[], // Use users as the base for alumni profiles
      mockInterviews: sampleMockInterviewSessions, // Still mock until DB model is added
      systemAlerts: sampleSystemAlerts, // Still mock until DB model is added
      challenges: sampleChallenges, // Still mock until DB model is added
    };
  } catch (error) {
    console.error('[DashboardAction] Error fetching data from database:', error);
    // Fallback to mock data on error to prevent crashing the dashboard
    // In production, you'd want more robust error handling
    return {
      users: [],
      tenants: [],
      resumeScans: [],
      communityPosts: [],
      jobApplications: [],
      alumni: [],
      mockInterviews: sampleMockInterviewSessions,
      appointments: [],
      systemAlerts: sampleSystemAlerts,
      promotions: [],
      activities: [],
      badges: [],
      challenges: sampleChallenges,
    };
  }
}
