
'use server';

import { db } from '@/lib/db';
import type { DailyChallenge, UserProfile } from '@/types';
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
 * @param forceRefresh If true, will generate a new challenge even if a recent one exists.
 * @returns A promise that resolves to a DailyChallenge object or null.
 */
export async function getDynamicFlipChallenge(userId: string, forceRefresh = false): Promise<DailyChallenge | null> {
  logAction('[FlipChallenge] Start: Fetching dynamic flip challenge', { userId, forceRefresh });
  try {
    let user = await db.user.findUnique({
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

    if (!user) {
        logError('[FlipChallenge] User not found', {}, { userId });
        return null;
    }
    logAction('[FlipChallenge] Step: User data fetched successfully', { userId });

    // If forcing a refresh, clear the old challenge first
    if (forceRefresh && user.currentFlipChallenge) {
        logAction('[FlipChallenge] Step: Force refresh requested. Clearing existing challenge.', { userId });
        await updateUser(userId, {
            currentFlipChallenge: null,
            flipChallengeAssignedAt: null,
            flipChallengeProgressStart: null,
        });
        // Nullify user's challenge data to proceed with new generation
        user.currentFlipChallenge = null;
        user.flipChallengeAssignedAt = null;
    }


    // Check for existing, recent challenge
    if (user.currentFlipChallenge && user.flipChallengeAssignedAt) {
      logAction('[FlipChallenge] Step: User has an existing challenge. Checking its age.', { userId });
      const assignedDate = new Date(user.flipChallengeAssignedAt);
      const daysSinceAssigned = differenceInDays(new Date(), assignedDate);
      if (daysSinceAssigned < 7) {
        logAction('[FlipChallenge] End: Returning existing recent flip challenge', { userId, assignedDaysAgo: daysSinceAssigned });
        return user.currentFlipChallenge as unknown as DailyChallenge;
      }
       logAction('[FlipChallenge] Step: Existing challenge is older than 7 days. Proceeding to generate a new one.', { userId, daysSinceAssigned });
    } else {
        logAction('[FlipChallenge] Step: No existing challenge found for user. Proceeding to generate a new one.', { userId });
    }

    // Generate a new challenge if none exists or the old one is expired
    logAction('[FlipChallenge] Step: Generating new flip challenge for user', { userId });
    logAction('[FlipChallenge] Step: Fetching all possible flip challenges from DB', { userId });
    const allFlipChallenges = await db.dailyChallenge.findMany({
      where: { 
        type: 'flip',
        tasks: {
          not: Prisma.JsonNull,
        }
      },
    });
    logAction('[FlipChallenge] Step: Found total flip challenges in DB', { count: allFlipChallenges.length });
    
    // The logic to filter out completed tasks is removed to make them repeatable
    const allTasks = allFlipChallenges.flatMap(challenge =>
      (challenge.tasks as any[]).map(task => ({ ...task, parentChallengeId: challenge.id, xpReward: challenge.xpReward }))
    );
    logAction('[FlipChallenge] Step: Using all repeatable tasks for user', { userId, totalTasks: allTasks.length });


    if (allTasks.length < 2) {
      logAction('[FlipChallenge] End: Not enough tasks in the database to generate a flip challenge', { userId });
      return null;
    }
    
    const shuffledTasks = allTasks.sort(() => 0.5 - Math.random());
    const selectedTasks = shuffledTasks.slice(0, 2);
    logAction('[FlipChallenge] Step: Randomly selected tasks for the new challenge', { userId, tasks: selectedTasks.map(t => t.action) });
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
    logAction('[FlipChallenge] Step: New dynamic challenge object created', { userId, challenge: dynamicChallenge });
    
    // Capture baseline progress for the new tasks
    logAction('[FlipChallenge] Step: Capturing baseline progress for new tasks', { userId });
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
    logAction('[FlipChallenge] Step: Baseline progress captured', { userId, progressStart });

    // Save the new challenge and baseline progress to the user's profile
    logAction('[FlipChallenge] Step: Saving new challenge to user profile in DB', { userId });
    await updateUser(userId, {
      currentFlipChallenge: dynamicChallenge as any,
      flipChallengeAssignedAt: new Date().toISOString(),
      flipChallengeProgressStart: progressStart as any,
    });
    
    logAction('[FlipChallenge] End: Assigned new flip challenge to user', { userId, challengeId: dynamicChallenge.id, progressStart });
    return dynamicChallenge;

  } catch (error) {
    logError('[FlipChallenge] End: Error fetching dynamic flip challenge', error, { userId });
    return null;
  }
}
