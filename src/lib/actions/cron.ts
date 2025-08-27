
'use server';

import { db } from '@/lib/db';
import { checkAndAwardBadges } from './gamification';
import { logAction, logError } from '@/lib/logger';
import { cleanTrash } from './trash';

/**
 * Iterates through all users and awards any badges they are eligible for.
 * This is useful for catching achievements that might be missed by real-time checks.
 * @returns An object with the count of users checked and badges awarded.
 */
async function awardBadgesToAllUsers(): Promise<{ checked: number; awarded: number }> {
  logAction('[CRON] Starting sub-job: awardBadgesToAllUsers');
  try {
    const users = await db.user.findMany({ select: { id: true } });
    let totalBadgesAwarded = 0;

    for (const user of users) {
      const newlyAwardedBadges = await checkAndAwardBadges(user.id);
      totalBadgesAwarded += newlyAwardedBadges.length;
    }

    logAction('[CRON] Finished sub-job: awardBadgesToAllUsers', { userCount: users.length, totalBadgesAwarded });
    return { checked: users.length, awarded: totalBadgesAwarded };
  } catch (error) {
    logError('[CRON] Error in awardBadgesToAllUsers', error);
    return { checked: 0, awarded: 0 };
  }
}

/**
 * Master cron job handler that runs all daily scheduled tasks.
 * @returns A summary of all jobs that were run.
 */
export async function runDailyCronJobs() {
  logAction('[CRON] Starting daily cron jobs master handler');
  
  const trashResult = await cleanTrash();
  const badgeResult = await awardBadgesToAllUsers();

  const summary = {
    cleanTrash: {
      success: trashResult.success,
      deletedCount: trashResult.count,
      error: trashResult.error,
    },
    awardBadges: badgeResult,
  };

  logAction('[CRON] Finished daily cron jobs master handler', { summary });
  return summary;
}
