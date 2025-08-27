
'use server';

import { db } from '@/lib/db';
import type { DailyChallenge, UserProfile, ChallengeAction } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { differenceInDays } from 'date-fns';
import { updateUser } from '@/lib/data-services/users';
import { Prisma } from '@prisma/client';

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

/**
 * Fetches a dynamic flip challenge for a user.
 * If the user has an active challenge assigned less than 7 days ago, it returns that.
 * Otherwise, it generates a new one, saves it to the user's profile, and returns it.
 * @param userId The ID of the user.
 * @returns A promise that resolves to a DailyChallenge object or null.
 */
export async function getDynamicFlipChallenge(userId: string): Promise<DailyChallenge | null> {
  logAction('Fetching dynamic flip challenge', { userId });
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        completedFlipTaskIds: true,
        currentFlipChallenge: true,
        flipChallengeAssignedAt: true,
        _count: {
          select: {
            resumeScanHistories: true,
            jobApplications: true,
            communityPosts: true,
            communityComments: true,
            appointmentsAsRequester: true,
          },
        },
        referralHistory: { where: { status: { in: ['Signed Up', 'Reward Earned'] } } },
      },
    });

    if (!user) return null;

    // Check for existing, recent challenge
    if (user.currentFlipChallenge && user.flipChallengeAssignedAt) {
      const assignedDate = new Date(user.flipChallengeAssignedAt);
      const daysSinceAssigned = differenceInDays(new Date(), assignedDate);
      if (daysSinceAssigned < 7) {
        logAction('Returning existing flip challenge', { userId, assignedDaysAgo: daysSinceAssigned });
        return user.currentFlipChallenge as unknown as DailyChallenge;
      }
    }

    // Generate a new challenge if none exists or the old one is expired
    logAction('Generating new flip challenge for user', { userId });
    const completedTaskIds = user?.completedFlipTaskIds || [];
    const allFlipChallenges = await db.dailyChallenge.findMany({
      where: { 
        type: 'flip',
        tasks: {
          not: Prisma.JsonNull, // Correctly check that the tasks field is not null
        }
      },
    });
    
    const allTasks = allFlipChallenges.flatMap(challenge =>
      (challenge.tasks as any[]).map(task => ({ ...task, parentChallengeId: challenge.id, xpReward: challenge.xpReward }))
    );
    const uncompletedTasks = allTasks.filter(task => !completedTaskIds.includes(task.action));

    if (uncompletedTasks.length < 2) {
      logAction('Not enough uncompleted tasks to generate a flip challenge', { userId });
      return null;
    }
    
    const shuffledTasks = uncompletedTasks.sort(() => 0.5 - Math.random());
    const selectedTasks = shuffledTasks.slice(0, 2);
    const combinedXp = selectedTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0) / 2;

    const dynamicChallenge: DailyChallenge = {
      id: `dynamic-${Date.now()}`,
      type: 'flip',
      title: "Today's Flip Challenge",
      description: "Complete these two tasks from across the platform to earn a reward!",
      xpReward: Math.round(combinedXp),
      tasks: selectedTasks.map(task => ({
        description: task.description,
        action: task.action,
        target: task.target,
      })),
    };
    
    // Capture baseline progress for the new tasks
    const progressStart: Record<string, number> = {};
    for (const task of dynamicChallenge.tasks!) {
        switch (task.action) {
          case 'analyze_resume': progressStart[task.action] = user._count.resumeScanHistories; break;
          case 'add_job_application': progressStart[task.action] = user._count.jobApplications; break;
          case 'community_post': progressStart[task.action] = user._count.communityPosts; break;
          case 'community_comment': progressStart[task.action] = user._count.communityComments; break;
          case 'refer': progressStart[task.action] = user.referralHistory.length; break;
          case 'book_appointment': progressStart[task.action] = user._count.appointmentsAsRequester; break;
        }
    }

    // Save the new challenge and baseline progress to the user's profile
    await updateUser(userId, {
      currentFlipChallenge: dynamicChallenge as any,
      flipChallengeAssignedAt: new Date().toISOString(),
      flipChallengeProgressStart: progressStart as any,
    });
    
    logAction('Assigned new flip challenge to user', { userId, challengeId: dynamicChallenge.id, progressStart });
    return dynamicChallenge;

  } catch (error) {
    logError('[ChallengeAction] Error fetching dynamic flip challenge', error, { userId });
    return null;
  }
}
