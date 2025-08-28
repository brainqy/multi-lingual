
'use server';

import { db } from '@/lib/db';
import { checkAndAwardBadges } from './gamification';
import { logAction, logError } from '@/lib/logger';
import { cleanTrash } from './trash';

/**
 * Checks and updates the status of awards based on their dates.
 * - Nominating -> Voting
 * - Voting -> Completed
 * @returns An object with the count of awards transitioned.
 */
async function transitionAwardStatuses(): Promise<{ toVoting: number; toCompleted: number }> {
  logAction('[CRON] Starting sub-job: transitionAwardStatuses');
  const now = new Date();
  let toVotingCount = 0;
  let toCompletedCount = 0;

  try {
    // Transition from Nominating to Voting
    const awardsToStartVoting = await db.award.findMany({
      where: { status: 'Nominating', nominationEndDate: { lt: now }, votingStartDate: { lte: now } },
    });
    for (const award of awardsToStartVoting) {
      await db.award.update({ where: { id: award.id }, data: { status: 'Voting' } });
      toVotingCount++;
      logAction('[CRON] Award transitioned to Voting', { awardId: award.id, title: award.title });
    }

    // Transition from Voting to Completed
    const awardsToComplete = await db.award.findMany({
      where: { status: 'Voting', votingEndDate: { lt: now } },
    });
    for (const award of awardsToComplete) {
      await db.award.update({ where: { id: award.id }, data: { status: 'Completed' } });
      toCompletedCount++;
      logAction('[CRON] Award transitioned to Completed', { awardId: award.id, title: award.title });
    }
    
    logAction('[CRON] Finished sub-job: transitionAwardStatuses', { toVoting: toVotingCount, toCompleted: toCompletedCount });
    return { toVoting: toVotingCount, toCompleted: toCompletedCount };
  } catch (error) {
    logError('[CRON] Error in transitionAwardStatuses', error);
    return { toVoting: 0, toCompleted: 0 };
  }
}

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
  const awardResult = await transitionAwardStatuses();
  const badgeResult = await awardBadgesToAllUsers();

  const summary = {
    cleanTrash: {
      success: trashResult.success,
      deletedCount: trashResult.count,
      error: trashResult.error,
    },
    transitionAwards: awardResult,
    awardBadges: badgeResult,
  };

  logAction('[CRON] Finished daily cron jobs master handler', { summary });
  return summary;
}
