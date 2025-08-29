
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
  Affiliate,
} from '@/types';
import { Prisma } from '@prisma/client';
import { logAction, logError } from '@/lib/logger';
import { subDays, startOfISOWeek, addWeeks, endOfWeek } from 'date-fns';

async function calculateChallengeProgress(user: UserProfile, challenges: DailyChallenge[]): Promise<UserProfile['challengeProgress']> {
  if (!user || !user.currentFlipChallenge || !user.currentFlipChallenge.tasks) {
    return {};
  }
  
  const progress: UserProfile['challengeProgress'] = {};
  const progressStart = user.flipChallengeProgressStart as Record<string, number> | null;

  for (const task of user.currentFlipChallenge.tasks) {
    const baseline = progressStart?.[task.action] ?? 0;
    let currentTotal = 0;
    
    switch (task.action) {
      case 'analyze_resume':
        currentTotal = await db.resumeScanHistory.count({ where: { userId: user.id } });
        break;
      case 'add_job_application':
        currentTotal = await db.jobApplication.count({ where: { userId: user.id } });
        break;
      case 'community_post':
        currentTotal = await db.communityPost.count({ where: { userId: user.id } });
        break;
      case 'community_comment':
        currentTotal = await db.communityComment.count({ where: { userId: user.id } });
        break;
      case 'refer':
        currentTotal = await db.referralHistory.count({ where: { referrerUserId: user.id, status: { in: ['Signed Up', 'Reward Earned'] } } });
        break;
       case 'book_appointment':
        currentTotal = await db.appointment.count({ where: { requesterUserId: user.id } });
        break;
    }
    
    progress[task.action] = {
      action: task.action,
      current: Math.max(0, currentTotal - baseline),
      target: task.target,
    };
  }
  return progress;
}


export async function getDashboardData(tenantId?: string | null, userId?: string | null, userRole?: 'admin' | 'manager' | 'user') {
  logAction('Fetching dashboard data', { tenantId, userId, userRole });
  
  const isTenantScoped = userRole === 'manager' || userRole === 'user';
  
  const tenantWhereClause = isTenantScoped && tenantId ? { tenantId } : {};

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
    
    const badges = (await db.badge.findMany()) as unknown as Badge[];
    const promotions = (await db.promotionalContent.findMany()) as unknown as PromotionalContent[];
    const mockInterviews = (await db.mockInterviewSession.findMany({ where: isTenantScoped && userId ? { userId } : {}, include: { answers: true } })) as unknown as MockInterviewSession[];
    const systemAlerts = (await db.systemAlert.findMany({ orderBy: { timestamp: 'desc' } })) as unknown as SystemAlert[];
    const challenges = (await db.dailyChallenge.findMany()) as unknown as DailyChallenge[];
    const featureRequests = (await db.featureRequest.findMany()) as unknown as any[];
    const blogPosts = (await db.blogPost.findMany()) as unknown as any[];
    const affiliates = (await db.affiliate.findMany({ include: { commissionTier: true } })) as unknown as Affiliate[];
    
    const userRoleCounts = await db.user.groupBy({
      by: ['role'],
      _count: { role: true },
      where: tenantWhereClause
    });
    const userStatusCounts = await db.user.groupBy({
      by: ['status'],
      _count: { status: true },
      where: tenantWhereClause
    });
    
    const coinStatsPromises = {
      circulation: db.wallet.aggregate({ _sum: { coins: true } }),
      earned: db.walletTransaction.aggregate({ where: { type: 'credit', currency: 'coins' }, _sum: { amount: true } }),
      spent: db.walletTransaction.aggregate({ where: { type: 'debit', currency: 'coins' }, _sum: { amount: true } }),
      spendingByCategory: db.walletTransaction.groupBy({
        by: ['description'],
        where: { type: 'debit', currency: 'coins' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      topEarners: db.walletTransaction.groupBy({
        by: ['walletId'], where: { type: 'credit', currency: 'coins' }, _sum: { amount: true }, orderBy: { _sum: { amount: 'desc' } }, take: 5
      }),
      topSpenders: db.walletTransaction.groupBy({
        by: ['walletId'], where: { type: 'debit', currency: 'coins' }, _sum: { amount: true }, orderBy: { _sum: { amount: 'desc' } }, take: 5
      }),
    };
    const coinStatsResults = await Promise.all(Object.values(coinStatsPromises));
    const [circulation, earned, spent, spendingByCategory, topEarners, topSpenders] = coinStatsResults;

    const topEarnerUsers = await db.user.findMany({ where: { wallet: { id: { in: topEarners.map(u => u.walletId) } } }, select: { id: true, name: true, wallet: { select: { id: true } } }});
    const topSpenderUsers = await db.user.findMany({ where: { wallet: { id: { in: topSpenders.map(u => u.walletId) } } }, select: { id: true, name: true, wallet: { select: { id: true } } }});

    const coinStats = {
        totalInCirculation: circulation._sum.coins || 0,
        totalEarned: earned._sum.amount || 0,
        totalSpent: Math.abs(spent._sum.amount || 0),
        spendingByCategory: spendingByCategory.map(c => ({
            name: c.description.replace(/^(Purchased|Fee for|Redeemed promo code:)\s*/, ''),
            value: Math.abs(c._sum.amount || 0),
        })).reduce((acc, curr) => { 
            const existing = acc.find(item => item.name === curr.name);
            if (existing) {
                existing.value += curr.value;
            } else {
                acc.push(curr);
            }
            return acc;
        }, [] as { name: string, value: number }[]),
        topEarners: topEarners.map(u => ({ name: topEarnerUsers.find(user => user.wallet?.id === u.walletId)?.name || 'Unknown', value: u._sum.amount || 0 })),
        topSpenders: topSpenders.map(u => ({ name: topSpenderUsers.find(user => user.wallet?.id === u.walletId)?.name || 'Unknown', value: Math.abs(u._sum.amount || 0) })),
    };


    const usersWithProgress = await Promise.all(
      usersData.map(async (user) => {
        const progress = await calculateChallengeProgress(user, challenges);
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
      featureRequests,
      blogPosts,
      affiliates,
      demographics: {
        byRole: userRoleCounts.map(item => ({ name: item.role, count: item._count.role })),
        byStatus: userStatusCounts.map(item => ({ name: item.status, count: item._count.status })),
      },
      coinStats
    };
  } catch (error) {
    logError('[DashboardAction] Error fetching data from database', error, { tenantId, userId });
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
      featureRequests: [],
      blogPosts: [],
      affiliates: [],
      demographics: { byRole: [], byStatus: [] },
      coinStats: { totalInCirculation: 0, totalEarned: 0, totalSpent: 0, spendingByCategory: [], topEarners: [], topSpenders: [] },
    };
  }
}
