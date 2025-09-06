
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
  FeatureRequest,
  BlogPost,
  Wallet,
  WalletTransaction
} from '@/types';
import { headers } from 'next/headers';

/**
 * This is the primary data fetching function for all dashboards.
 * It retrieves comprehensive data from the database.
 * @param userId Optional user ID for user-specific data.
 * @param role Optional user role for permission checks.
 * @returns A promise that resolves to an object containing various dashboard data points.
 */
export async function getDashboardData(userId?: string | null, role?: string) {
  const headersList = headers();
  const tenantId = headersList.get('X-Tenant-Id');
  console.log(`[DashboardAction] Fetching data for tenant: ${tenantId}, user: ${userId}`);
  
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
    const challenges = (await db.dailyChallenge.findMany()) as unknown as DailyChallenge[];
    const mockInterviews = (await db.mockInterviewSession.findMany()) as unknown as MockInterviewSession[];
    const affiliates = (await db.affiliate.findMany({ include: { commissionTier: true }})) as unknown as Affiliate[];
    const featureRequests = (await db.featureRequest.findMany()) as unknown as FeatureRequest[];
    const blogPosts = (await db.blogPost.findMany()) as unknown as BlogPost[];
    
    // Fetch all wallets and transactions to calculate coin stats
    const allWallets = await db.wallet.findMany({
      include: { transactions: true }
    });
    
    const totalInCirculation = allWallets.reduce((sum, wallet) => sum + wallet.coins, 0);
    const allTransactions = allWallets.flatMap(w => w.transactions);
    const totalEarned = allTransactions.filter(t => t.type === 'credit' && t.currency === 'coins').reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = allTransactions.filter(t => t.type === 'debit' && t.currency === 'coins').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Top Earners & Spenders (Simplified)
    const userCoinChanges = allWallets.reduce((acc, wallet) => {
        const user = users.find(u => u.id === wallet.userId);
        if (!user) return acc;

        const earned = wallet.transactions.filter(t => t.type === 'credit' && t.currency === 'coins').reduce((sum, t) => sum + t.amount, 0);
        const spent = wallet.transactions.filter(t => t.type === 'debit' && t.currency === 'coins').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        acc[user.name] = { earned, spent };
        return acc;
    }, {} as Record<string, { earned: number, spent: number }>);

    const topEarners = Object.entries(userCoinChanges).sort((a, b) => b[1].earned - a[1].earned).slice(0, 5).map(([name, data]) => ({ name, value: data.earned }));
    const topSpenders = Object.entries(userCoinChanges).sort((a, b) => b[1].spent - a[1].spent).slice(0, 5).map(([name, data]) => ({ name, value: data.spent }));

    const spendingByCategory = allTransactions
      .filter(t => t.type === 'debit')
      .reduce((acc, t) => {
          let category = "General";
          if (t.description.toLowerCase().includes('appointment')) category = "Appointments";
          if (t.description.toLowerCase().includes('interview')) category = "Mock Interviews";
          
          acc[category] = (acc[category] || 0) + Math.abs(t.amount);
          return acc;
      }, {} as Record<string, number>);


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
      challenges,
      alumni: users as AlumniProfile[],
      mockInterviews,
      systemAlerts: [], // SystemAlerts are not in DB schema yet
      affiliates,
      featureRequests,
      blogPosts,
      coinStats: {
        totalInCirculation,
        totalEarned,
        totalSpent,
        topEarners,
        topSpenders,
        spendingByCategory: Object.entries(spendingByCategory).map(([name, value]) => ({name, value})),
      },
    };
  } catch (error) {
    console.error('[DashboardAction] Error fetching data from database:', error);
    // Return an empty/default state on error to prevent crashing dashboards
    return {
      users: [], tenants: [], resumeScans: [], communityPosts: [], jobApplications: [],
      alumni: [], mockInterviews: [], appointments: [], systemAlerts: [], promotions: [],
      activities: [], badges: [], challenges: [], affiliates: [], featureRequests: [], blogPosts: [],
      coinStats: { totalInCirculation: 0, totalEarned: 0, totalSpent: 0, topEarners: [], topSpenders: [], spendingByCategory: [] },
    };
  }
}

    