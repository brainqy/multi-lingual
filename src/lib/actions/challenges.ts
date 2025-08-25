
'use server';

import { db } from '@/lib/db';
import type { DailyChallenge } from '@/types';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches all daily challenges from the database.
 * @returns A promise that resolves to an array of DailyChallenge objects.
 */
export async function getChallenges(): Promise<DailyChallenge[]> {
  logAction('Fetching challenges');
  try {
    const challenges = await db.dailyChallenge.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return challenges as unknown as DailyChallenge[];
  } catch (error) {
    logError('[ChallengeAction] Error fetching challenges', error);
    return [];
  }
}
