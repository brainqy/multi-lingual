
'use server';

import { db } from '@/lib/db';
import type { Affiliate, AffiliateClick, AffiliateSignup, AffiliateStatus, CommissionTier } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { createNotification } from '@/lib/actions/notifications';


/**
 * Fetches all affiliates, optionally scoped by tenant for managers.
 * @param tenantId Optional tenant ID. If provided, fetches affiliates of users in that tenant.
 * @returns A promise that resolves to an array of Affiliate objects.
 */
export async function getAffiliates(tenantId?: string): Promise<Affiliate[]> {
  logAction('Fetching affiliates', { tenantId });
  try {
    const whereClause: any = {};
    if (tenantId) {
      whereClause.user = { tenantId: tenantId };
    }
    const affiliates = await db.affiliate.findMany({
      where: whereClause,
      include: {
        commissionTier: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return affiliates as unknown as Affiliate[];
  } catch (error) {
    logError('[AffiliateAction] Error fetching affiliates', error, { tenantId });
    return [];
  }
}

/**
 * Fetches a single affiliate by their user ID.
 * @param userId The ID of the user.
 * @returns The Affiliate object or null if not found.
 */
export async function getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
    logAction('Fetching affiliate by user ID', { userId });
    try {
        const affiliate = await db.affiliate.findUnique({
            where: { userId },
            include: { commissionTier: true }
        });
        return affiliate as unknown as Affiliate | null;
    } catch (error) {
        logError(`[AffiliateAction] Error fetching affiliate for user ${userId}`, error, { userId });
        return null;
    }
}

/**
 * Creates a new affiliate application.
 * @param affiliateData Data for the new affiliate.
 * @returns The newly created Affiliate object or null.
 */
export async function createAffiliate(affiliateData: Omit<Affiliate, 'id' | 'totalEarned' | 'createdAt' | 'updatedAt' | 'commissionTier'>): Promise<Affiliate | null> {
    logAction('Creating affiliate', { userId: affiliateData.userId });
    try {
        const newAffiliate = await db.affiliate.create({
            data: affiliateData,
        });
        return newAffiliate as unknown as Affiliate;
    } catch (error) {
        logError('[AffiliateAction] Error creating affiliate', error, { userId: affiliateData.userId });
        return null;
    }
}

/**
 * Updates an affiliate's status.
 * @param affiliateId The ID of the affiliate to update.
 * @param status The new status.
 * @returns The updated Affiliate object or null.
 */
export async function updateAffiliateStatus(affiliateId: string, status: AffiliateStatus): Promise<Affiliate | null> {
    logAction('Updating affiliate status', { affiliateId, status });
    try {
        const updatedAffiliate = await db.affiliate.update({
            where: { id: affiliateId },
            data: { status },
            include: { commissionTier: true }
        });

        // Notify user on approval
        if (status === 'approved') {
            await createNotification({
                userId: updatedAffiliate.userId,
                type: 'system',
                content: "Congratulations! Your affiliate application has been approved. You can now start earning.",
                link: '/affiliates',
                isRead: false
            });
        }

        return updatedAffiliate as unknown as Affiliate;
    } catch (error) {
        logError(`[AffiliateAction] Error updating affiliate status for ${affiliateId}`, error, { affiliateId, status });
        return null;
    }
}

/**
 * Fetches signups for a specific affiliate.
 * @param affiliateId The ID of the affiliate.
 * @returns A promise resolving to an array of AffiliateSignup objects.
 */
export async function getAffiliateSignups(affiliateId: string): Promise<AffiliateSignup[]> {
    logAction('Fetching affiliate signups', { affiliateId });
    try {
        const signups = await db.affiliateSignup.findMany({
            where: { affiliateId },
            orderBy: { signupDate: 'desc' },
        });
        return signups as unknown as AffiliateSignup[];
    } catch (error) {
        logError(`[AffiliateAction] Error fetching signups for affiliate ${affiliateId}`, error, { affiliateId });
        return [];
    }
}


/**
 * Fetches clicks for a specific affiliate.
 * @param affiliateId The ID of the affiliate.
 * @returns A promise resolving to an array of AffiliateClick objects.
 */
export async function getAffiliateClicks(affiliateId: string): Promise<AffiliateClick[]> {
    logAction('Fetching affiliate clicks', { affiliateId });
    try {
        const clicks = await db.affiliateClick.findMany({
            where: { affiliateId },
            orderBy: { timestamp: 'desc' },
        });
        return clicks as unknown as AffiliateClick[];
    } catch (error) {
        logError(`[AffiliateAction] Error fetching clicks for affiliate ${affiliateId}`, error, { affiliateId });
        return [];
    }
}


/**
 * Fetches all commission tiers.
 * @returns A promise resolving to an array of CommissionTier objects.
 */
export async function getCommissionTiers(): Promise<CommissionTier[]> {
    logAction('Fetching commission tiers');
    try {
        const tiers = await db.commissionTier.findMany({
            orderBy: { milestoneRequirement: 'asc' }
        });
        return tiers as unknown as CommissionTier[];
    } catch(error) {
        logError('[AffiliateAction] Error fetching commission tiers', error);
        return [];
    }
}
