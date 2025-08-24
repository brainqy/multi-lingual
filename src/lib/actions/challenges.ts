
'use server';

import { db } from '@/lib/db';
import type { DailyChallenge } from '@/types';

/**
 * Fetches all daily challenges from the database.
 * @returns A promise that resolves to an array of DailyChallenge objects.
 */
export async function getChallenges(): Promise<DailyChallenge[]> {
  try {
    const challenges = await db.dailyChallenge.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return challenges as unknown as DailyChallenge[];
  } catch (error) {
    console.error('[ChallengeAction] Error fetching challenges:', error);
    return [];
  }
}
