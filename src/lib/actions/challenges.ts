
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

/**
 * Fetches a dynamic flip challenge for a user, consisting of 2 random uncompleted tasks.
 * @param userId The ID of the user.
 * @returns A promise that resolves to a DailyChallenge object or null.
 */
export async function getDynamicFlipChallenge(userId: string): Promise<DailyChallenge | null> {
  logAction('Fetching dynamic flip challenge', { userId });
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { completedFlipTaskIds: true },
    });

    const completedTaskIds = user?.completedFlipTaskIds || [];

    const allFlipChallenges = await db.dailyChallenge.findMany({
      where: {
        type: 'flip',
        tasks: {
          some: {} // Ensure tasks array is not empty
        }
      },
    });

    // Flatten all tasks from all flip challenges into a single array
    const allTasks = allFlipChallenges.flatMap(challenge =>
      (challenge.tasks as any[]).map(task => ({ ...task, parentChallengeId: challenge.id, xpReward: challenge.xpReward }))
    );

    // Filter out tasks the user has already completed
    const uncompletedTasks = allTasks.filter(task => !completedTaskIds.includes(task.action)); // Assuming task.action is unique id for task type

    if (uncompletedTasks.length < 2) {
      logAction('Not enough uncompleted tasks to generate a flip challenge', { userId });
      return null;
    }
    
    // Shuffle and pick 2 random tasks
    const shuffledTasks = uncompletedTasks.sort(() => 0.5 - Math.random());
    const selectedTasks = shuffledTasks.slice(0, 2);
    
    const combinedXp = selectedTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0) / 2; // Average the XP

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

    return dynamicChallenge;

  } catch (error) {
    logError('[ChallengeAction] Error fetching dynamic flip challenge', error, { userId });
    return null;
  }
}
