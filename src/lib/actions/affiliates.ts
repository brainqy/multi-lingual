
'use server';

import { db } from '@/lib/db';
import type { Affiliate, AffiliateClick, AffiliateSignup, AffiliateStatus } from '@/types';

/**
 * Fetches all affiliates, optionally scoped by tenant for managers.
 * @param tenantId Optional tenant ID. If provided, fetches affiliates of users in that tenant.
 * @returns A promise that resolves to an array of Affiliate objects.
 */
export async function getAffiliates(tenantId?: string): Promise<Affiliate[]> {
  try {
    const whereClause: any = {};
    if (tenantId) {
      whereClause.user = { tenantId: tenantId };
    }
    const affiliates = await db.affiliate.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    return affiliates as unknown as Affiliate[];
  } catch (error) {
    console.error('[AffiliateAction] Error fetching affiliates:', error);
    return [];
  }
}

/**
 * Fetches a single affiliate by their user ID.
 * @param userId The ID of the user.
 * @returns The Affiliate object or null if not found.
 */
export async function getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
    try {
        const affiliate = await db.affiliate.findUnique({
            where: { userId },
        });
        return affiliate as unknown as Affiliate | null;
    } catch (error) {
        console.error(`[AffiliateAction] Error fetching affiliate for user ${userId}:`, error);
        return null;
    }
}

/**
 * Creates a new affiliate application.
 * @param affiliateData Data for the new affiliate.
 * @returns The newly created Affiliate object or null.
 */
export async function createAffiliate(affiliateData: Omit<Affiliate, 'id' | 'totalEarned' | 'createdAt' | 'updatedAt'>): Promise<Affiliate | null> {
    try {
        const newAffiliate = await db.affiliate.create({
            data: affiliateData,
        });
        return newAffiliate as unknown as Affiliate;
    } catch (error) {
        console.error('[AffiliateAction] Error creating affiliate:', error);
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
    try {
        const updatedAffiliate = await db.affiliate.update({
            where: { id: affiliateId },
            data: { status },
        });
        return updatedAffiliate as unknown as Affiliate;
    } catch (error) {
        console.error(`[AffiliateAction] Error updating affiliate status for ${affiliateId}:`, error);
        return null;
    }
}

/**
 * Fetches signups for a specific affiliate.
 * @param affiliateId The ID of the affiliate.
 * @returns A promise resolving to an array of AffiliateSignup objects.
 */
export async function getAffiliateSignups(affiliateId: string): Promise<AffiliateSignup[]> {
    try {
        const signups = await db.affiliateSignup.findMany({
            where: { affiliateId },
            orderBy: { signupDate: 'desc' },
        });
        return signups as unknown as AffiliateSignup[];
    } catch (error) {
        console.error(`[AffiliateAction] Error fetching signups for affiliate ${affiliateId}:`, error);
        return [];
    }
}


/**
 * Fetches clicks for a specific affiliate.
 * @param affiliateId The ID of the affiliate.
 * @returns A promise resolving to an array of AffiliateClick objects.
 */
export async function getAffiliateClicks(affiliateId: string): Promise<AffiliateClick[]> {
    try {
        const clicks = await db.affiliateClick.findMany({
            where: { affiliateId },
            orderBy: { timestamp: 'desc' },
        });
        return clicks as unknown as AffiliateClick[];
    } catch (error) {
        console.error(`[AffiliateAction] Error fetching clicks for affiliate ${affiliateId}:`, error);
        return [];
    }
}
