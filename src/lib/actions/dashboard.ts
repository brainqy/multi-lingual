
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

export async function getDashboardData(tenantId?: string | null, userId?: string | null) {
  console.log(`[DashboardAction] Fetching data from database...`);
  
  try {
    const users = (await db.user.findMany()) as unknown as UserProfile[];
    const tenants = (await db.tenant.findMany({ include: { settings: true } })) as unknown as Tenant[];
    const resumeScans = (await db.resumeScanHistory.findMany()) as unknown as ResumeScanHistoryItem[];
    const communityPosts = (await db.communityPost.findMany({ include: { comments: true } })) as unknown as CommunityPost[];
    const jobApplications = (await db.jobApplication.findMany({ include: { interviews: true } })) as unknown as JobApplication[];
    const appointments = (await db.appointment.findMany()) as unknown as Appointment[];
    const activities = (await db.activity.findMany({ orderBy: { timestamp: 'desc' }, take: 50 })) as unknown as Activity[];
    const badges = (await db.badge.findMany()) as unknown as Badge[];
    const promotions = (await db.promotionalContent.findMany()) as unknown as PromotionalContent[];
    const mockInterviews = (await db.mockInterviewSession.findMany({ include: { answers: true } })) as unknown as MockInterviewSession[];
    const systemAlerts = (await db.systemAlert.findMany({ orderBy: { timestamp: 'desc' } })) as unknown as SystemAlert[];
    const challenges = (await db.dailyChallenge.findMany()) as unknown as DailyChallenge[];

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
      alumni: users as AlumniProfile[],
      mockInterviews,
      systemAlerts,
      challenges,
    };
  } catch (error) {
    console.error('[DashboardAction] Error fetching data from database:', error);
    // Return empty arrays on error to prevent crashing the dashboard
    return {
      users: [],
      tenants: [],
      resumeScans: [],
      communityPosts: [],
      jobApplications: [],
      alumni: [],
      mockInterviews: [],
      appointments: [],
      systemAlerts: [],
      promotions: [],
      activities: [],
      badges: [],
      challenges: [],
    };
  }
}
