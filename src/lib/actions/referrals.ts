
'use server';

import { db } from '@/lib/db';
import type { ReferralHistoryItem } from '@/types';

/**
 * Fetches the referral history for a specific user.
 * @param userId The ID of the user whose referral history is to be fetched.
 * @returns A promise that resolves to an array of ReferralHistoryItem objects.
 */
export async function getReferralHistory(userId: string): Promise<ReferralHistoryItem[]> {
  try {
    const history = await db.referralHistory.findMany({
      where: { referrerUserId: userId },
      orderBy: { referralDate: 'desc' },
    });
    return history as unknown as ReferralHistoryItem[];
  } catch (error) {
    console.error(`[ReferralAction] Error fetching referral history for user ${userId}:`, error);
    return [];
  }
}
