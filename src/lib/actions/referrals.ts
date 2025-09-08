
'use server';

import { db } from '@/lib/db';
import type { ReferralHistoryItem, UserProfile } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { createNotification } from './notifications';

/**
 * Fetches the referral history for a specific user.
 * @param userId The ID of the user whose referral history is to be fetched.
 * @returns A promise that resolves to an array of ReferralHistoryItem objects.
 */
export async function getReferralHistory(userId: string): Promise<ReferralHistoryItem[]> {
  logAction('Fetching referral history', { userId });
  try {
    const history = await db.referralHistory.findMany({
      where: { referrerUserId: userId },
      orderBy: { referralDate: 'desc' },
    });
    return history as unknown as ReferralHistoryItem[];
  } catch (error) {
    logError(`[ReferralAction] Error fetching referral history for user ${userId}`, error, { userId });
    return [];
  }
}

/**
 * Creates a referral history item and notifies the referrer.
 * This would typically be called during the signup process if a referral code is used.
 * @param referrerUserId The user who made the referral.
 * @param referredUser The new user who signed up.
 */
export async function createReferral(referrerUserId: string, referredUser: UserProfile) {
  const tenantId = referredUser.tenantId;
  logAction('Creating referral record', { referrerUserId, referredUserId: referredUser.id, tenantId });
  try {
    await db.referralHistory.create({
      data: {
        referrerUserId,
        referredEmailOrName: referredUser.name || referredUser.email,
        status: 'Signed Up',
        referralDate: new Date(),
        tenantId: tenantId,
      },
    });

    await createNotification({
      userId: referrerUserId,
      type: 'system',
      content: `Success! ${referredUser.name || referredUser.email} has signed up using your referral code.`,
      link: '/referrals',
      isRead: false,
    });
  } catch (error) {
    logError('[ReferralAction] Error creating referral', error, { referrerUserId });
  }
}
