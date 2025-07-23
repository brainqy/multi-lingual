
'use server';

import { db } from '@/lib/db';
import {
  samplePlatformUsers,
  sampleTenants,
  sampleResumeScanHistory,
  sampleCommunityPosts,
  sampleJobApplications,
  sampleAlumni,
  sampleMockInterviewSessions,
  sampleSystemAlerts,
  samplePromotionalContent,
  sampleActivities,
  sampleBadges,
  sampleChallenges,
} from '@/lib/sample-data';
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
import { sampleAppointments } from '../data/appointments';

const useMockDb = process.env.USE_MOCK_DB === 'true';

// This is a simplified data fetching function. A real-world app would have more complex queries.
export async function getDashboardData(tenantId?: string | null, userId?: string | null) {
  console.log(`[DashboardAction] Fetching data... (Mock DB: ${useMockDb})`);
  if (useMockDb) {
    return {
      users: samplePlatformUsers,
      tenants: sampleTenants,
      resumeScans: sampleResumeScanHistory,
      communityPosts: sampleCommunityPosts,
      jobApplications: sampleJobApplications,
      alumni: sampleAlumni,
      mockInterviews: sampleMockInterviewSessions,
      appointments: sampleAppointments,
      systemAlerts: sampleSystemAlerts,
      promotions: samplePromotionalContent,
      activities: sampleActivities,
      badges: sampleBadges,
      challenges: sampleChallenges,
    };
  }

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
    const activities = (await db.activity.findMany()) as unknown as Activity[];
    const badges = (await db.badge.findMany()) as unknown as Badge[];


    // For data not yet in DB schema, we fall back to mock data
    return {
      users,
      tenants,
      resumeScans,
      communityPosts,
      jobApplications,
      appointments,
      activities,
      badges,
      alumni: sampleAlumni, // Mocked
      mockInterviews: sampleMockInterviewSessions, // Mocked
      systemAlerts: sampleSystemAlerts, // Mocked
      promotions: samplePromotionalContent, // Mocked
      challenges: sampleChallenges, // Mocked
    };
  } catch (error) {
    console.error('[DashboardAction] Error fetching data from database:', error);
    // Fallback to mock data on error to prevent crashing the dashboard
    return {
      users: samplePlatformUsers,
      tenants: sampleTenants,
      resumeScans: sampleResumeScanHistory,
      communityPosts: sampleCommunityPosts,
      jobApplications: sampleJobApplications,
      alumni: sampleAlumni,
      mockInterviews: sampleMockInterviewSessions,
      appointments: sampleAppointments,
      systemAlerts: sampleSystemAlerts,
      promotions: samplePromotionalContent,
      activities: sampleActivities,
      badges: sampleBadges,
      challenges: sampleChallenges,
    };
  }
}
