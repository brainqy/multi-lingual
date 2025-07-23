
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
  sampleAppointments,
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
    const tenants = (await db.tenant.findMany()) as unknown as Tenant[];
    // Add other Prisma fetches as your schema grows
    // For now, we return mock data for complex types not in the DB schema yet.
    return {
      users,
      tenants,
      resumeScans: sampleResumeScanHistory, // Mocked until schema exists
      communityPosts: sampleCommunityPosts, // Mocked until schema exists
      jobApplications: sampleJobApplications, // Mocked until schema exists
      alumni: sampleAlumni, // Mocked until schema exists
      mockInterviews: sampleMockInterviewSessions, // Mocked until schema exists
      appointments: sampleAppointments, // Mocked until schema exists
      systemAlerts: sampleSystemAlerts, // Mocked until schema exists
      promotions: samplePromotionalContent, // Mocked until schema exists
      activities: sampleActivities, // Mocked until schema exists
      badges: sampleBadges, // Mocked until schema exists
      challenges: sampleChallenges, // Mocked until schema exists
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
