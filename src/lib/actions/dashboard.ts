
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
  ChallengeAction,
} from '@/types';
import { Prisma } from '@prisma/client';

async function calculateChallengeProgress(userId: string, challenges: DailyChallenge[]): Promise<UserProfile['challengeProgress']> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          resumeScanHistories: true,
          jobApplications: true,
          communityPosts: true,
          communityComments: true,
          appointmentsRequester: true,
        },
      },
      referrals: true,
    },
  });

  if (!user) return {};

  const progress: UserProfile['challengeProgress'] = {};

  const flipChallenges = challenges.filter(c => c.type === 'flip');

  for (const challenge of flipChallenges) {
    if (challenge.tasks) {
      for (const task of challenge.tasks) {
        let currentCount = 0;
        switch (task.action) {
          case 'analyze_resume':
            currentCount = user._count.resumeScanHistories;
            break;
          case 'add_job_application':
            currentCount = user._count.jobApplications;
            break;
          case 'community_post':
            currentCount = user._count.communityPosts;
            break;
          case 'community_comment':
            currentCount = user._count.communityComments;
            break;
          case 'refer':
            currentCount = user.referrals.filter(r => r.status === 'Signed Up' || r.status === 'Reward Earned').length;
            break;
           case 'book_appointment':
            currentCount = user._count.appointmentsRequester;
            break;
          // Add other cases here as needed
        }
        progress[task.action] = {
          action: task.action,
          current: currentCount,
          target: task.target,
        };
      }
    }
  }
  return progress;
}


export async function getDashboardData(tenantId?: string | null, userId?: string | null, userRole?: 'admin' | 'manager' | 'user') {
  console.log(`[DashboardAction] Fetching data from database for tenant: ${tenantId}, user: ${userId}`);
  
  const isTenantScoped = userRole === 'manager' || userRole === 'user';
  
  // Define a base where clause for tenant-specific data
  const tenantWhereClause = isTenantScoped && tenantId ? { tenantId } : {};

  // Define a where clause for content that can be platform-wide (like community posts)
  const platformContentWhereClause = isTenantScoped && tenantId 
    ? { OR: [{ tenantId }, { tenantId: 'platform' }] }
    : {};

  try {
    const usersData = (await db.user.findMany({ where: tenantWhereClause })) as unknown as UserProfile[];
    const tenants = (await db.tenant.findMany({ where: tenantId && userRole === 'manager' ? { id: tenantId } : {}, include: { settings: true } })) as unknown as Tenant[];
    const resumeScans = (await db.resumeScanHistory.findMany({ where: tenantWhereClause })) as unknown as ResumeScanHistoryItem[];
    const communityPosts = (await db.communityPost.findMany({ where: platformContentWhereClause, include: { comments: true } })) as unknown as CommunityPost[];
    const jobApplications = (await db.jobApplication.findMany({ where: tenantWhereClause, include: { interviews: true } })) as unknown as JobApplication[];
    const appointments = (await db.appointment.findMany({ where: tenantWhereClause })) as unknown as Appointment[];
    const activities = (await db.activity.findMany({ where: tenantWhereClause, orderBy: { timestamp: 'desc' }, take: 50 })) as unknown as Activity[];
    
    // Global data (not tenant-specific)
    const badges = (await db.badge.findMany()) as unknown as Badge[];
    const promotions = (await db.promotionalContent.findMany()) as unknown as PromotionalContent[];
    const mockInterviews = (await db.mockInterviewSession.findMany({ where: isTenantScoped && userId ? { userId } : {}, include: { answers: true } })) as unknown as MockInterviewSession[];
    const systemAlerts = (await db.systemAlert.findMany({ orderBy: { timestamp: 'desc' } })) as unknown as SystemAlert[];
    const challenges = (await db.dailyChallenge.findMany()) as unknown as DailyChallenge[];

    // Dynamically calculate challenge progress for each user
    const usersWithProgress = await Promise.all(
      usersData.map(async (user) => {
        const progress = await calculateChallengeProgress(user.id, challenges);
        return { ...user, challengeProgress: progress };
      })
    );

    return {
      users: usersWithProgress,
      tenants,
      resumeScans,
      communityPosts,
      jobApplications,
      appointments,
      activities,
      badges,
      promotions,
      alumni: usersWithProgress as AlumniProfile[],
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
