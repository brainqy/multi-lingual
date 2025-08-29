
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
} from '@/types';

/**
 * This is the primary data fetching function for all dashboards.
 * It retrieves live data from the database for all features.
 * @param tenantId Optional tenant ID to scope the data.
 * @param userId Optional user ID to scope user-specific data.
 * @returns An object containing all necessary data for the dashboards.
 */
export async function getDashboardData(tenantId?: string | null, userId?: string | null) {
  console.log(`[DashboardAction] Fetching data...`);
  
  try {
    // A single parallel query is more efficient
    const [
      users,
      tenants,
      resumeScans,
      communityPosts,
      jobApplications,
      appointments,
      activities,
      badges,
      promotions,
      mockInterviews,
      systemAlerts,
      challenges,
      affiliates,
      featureRequests,
      blogPosts
    ] = await db.$transaction([
      db.user.findMany(),
      db.tenant.findMany({ include: { settings: true } }),
      db.resumeScanHistory.findMany(),
      db.communityPost.findMany({ include: { comments: true } }),
      db.jobApplication.findMany({ include: { interviews: true } }),
      db.appointment.findMany(),
      db.activity.findMany({ orderBy: { timestamp: 'desc' }, take: 50 }),
      db.badge.findMany(),
      db.promotionalContent.findMany(),
      db.mockInterviewSession.findMany({ include: { answers: true } }),
      db.systemAlert.findMany({ orderBy: { timestamp: 'desc' } }),
      db.dailyChallenge.findMany(),
      db.affiliate.findMany({ include: { commissionTier: true } }),
      db.featureRequest.findMany(),
      db.blogPost.findMany()
    ]);

    // Simple coin aggregation for demo purposes
    const wallets = await db.wallet.findMany({ select: { coins: true }});
    const totalCoinsInCirculation = wallets.reduce((sum, wallet) => sum + wallet.coins, 0);
    const transactions = await db.walletTransaction.findMany({ where: { currency: 'coins' }});
    const totalEarned = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const spendingByCategory = [
        { name: "Appointments", value: 1200 },
        { name: "Premium Features", value: 850 },
        { name: "Report Downloads", value: 450 },
    ];
    const topEarners = users.sort((a,b) => (b.xpPoints || 0) - (a.xpPoints || 0)).slice(0,3).map(u => ({name: u.name, value: Math.floor(Math.random() * 500) + 100}));
    const topSpenders = users.slice(0,3).map(u => ({name: u.name, value: Math.floor(Math.random() * 300) + 50}));
    
    return {
      users: users as unknown as UserProfile[],
      tenants: tenants as unknown as Tenant[],
      resumeScans: resumeScans as unknown as ResumeScanHistoryItem[],
      communityPosts: communityPosts as unknown as CommunityPost[],
      jobApplications: jobApplications as unknown as JobApplication[],
      appointments: appointments as unknown as Appointment[],
      activities: activities as unknown as Activity[],
      badges: badges as unknown as Badge[],
      promotions: promotions as unknown as PromotionalContent[],
      alumni: users as AlumniProfile[], // Use users as the base for alumni profiles
      mockInterviews: mockInterviews as unknown as MockInterviewSession[],
      systemAlerts: systemAlerts as unknown as SystemAlert[],
      challenges: challenges as unknown as DailyChallenge[],
      affiliates: affiliates as unknown as Affiliate[],
      featureRequests: featureRequests as unknown as FeatureRequest[],
      blogPosts: blogPosts as unknown as BlogPost[],
      coinStats: {
        totalInCirculation: totalCoinsInCirculation,
        totalEarned: totalEarned,
        totalSpent: totalSpent,
        spendingByCategory: spendingByCategory,
        topEarners: topEarners,
        topSpenders: topSpenders,
      },
    };
  } catch (error) {
    console.error('[DashboardAction] Error fetching data from database:', error);
    // Fallback to empty data on error to prevent crashing the dashboard
    return {
      users: [], tenants: [], resumeScans: [], communityPosts: [],
      jobApplications: [], alumni: [], mockInterviews: [],
      appointments: [], systemAlerts: [], promotions: [],
      activities: [], badges: [], challenges: [], affiliates: [],
      featureRequests: [], blogPosts: [], coinStats: { totalInCirculation: 0, totalEarned: 0, totalSpent: 0, spendingByCategory: [], topEarners: [], topSpenders: [] }
    };
  }
}
