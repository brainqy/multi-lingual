
'use server';

import { db } from '@/lib/db';
import type { Badge, GamificationRule, UserProfile } from '@/types';
import { updateUser } from '@/lib/data-services/users';
import { createActivity } from './activities';
import { getChallenges } from './challenges';
import { logAction, logError } from '@/lib/logger';
import { addXp } from './wallet';
import { createNotification } from './notifications';
import { Prisma } from '@prisma/client';

/**
 * Checks a user's activity against active Flip Challenge tasks. If all tasks for a challenge
 * are complete and haven't been rewarded yet, it awards the XP for that challenge.
 * @param userId The ID of the user to check.
 * @returns The user profile, potentially updated with new XP.
 */
export async function checkChallengeProgressAndAwardXP(userId: string): Promise<UserProfile | null> {
    logAction('Checking challenge progress for XP award', { userId });
    const user = await db.user.findUnique({
        where: { id: userId },
        include: {
            _count: {
                select: {
                    resumeScanHistories: true,
                    jobApplications: true,
                    communityPosts: true,
                    communityComments: true,
                    appointmentsAsRequester: true,
                },
            },
            referralHistory: true,
        },
    });

    if (!user) {
        logError(`[GamificationAction] User not found for challenge check`, {}, { userId });
        return null;
    }

    const challenges = await getChallenges();
    const flipChallenges = challenges.filter(c => c.type === 'flip');
    if (flipChallenges.length === 0) {
        return user as unknown as UserProfile;
    }

    let totalXpGained = 0;
    const completedChallengeIds = new Set(user.completedChallengeIds || []);
    let newChallengesCompleted = false;
    let finalUpdatedUser: UserProfile | null = user as unknown as UserProfile;

    for (const challenge of flipChallenges) {
        if (!challenge.tasks || completedChallengeIds.has(challenge.id)) {
            continue;
        }

        let allTasksCompleted = true;
        for (const task of challenge.tasks) {
            let currentCount = 0;
            switch (task.action) {
                case 'analyze_resume': currentCount = user._count.resumeScanHistories; break;
                case 'add_job_application': currentCount = user._count.jobApplications; break;
                case 'community_post': currentCount = user._count.communityPosts; break;
                case 'community_comment': currentCount = user._count.communityComments; break;
                case 'refer': currentCount = user.referralHistory.filter(r => r.status === 'Signed Up' || r.status === 'Reward Earned').length; break;
                case 'book_appointment': currentCount = user._count.appointmentsAsRequester; break;
            }
            if (currentCount < task.target) {
                allTasksCompleted = false;
                break;
            }
        }

        if (allTasksCompleted) {
            if (challenge.xpReward) {
                const updatedUserWithXp = await addXp(userId, challenge.xpReward, `Flip Challenge: ${challenge.title}`);
                if (updatedUserWithXp) {
                    finalUpdatedUser = updatedUserWithXp;
                    completedChallengeIds.add(challenge.id);
                    newChallengesCompleted = true;
                    await createActivity({
                        userId: user.id,
                        tenantId: user.tenantId,
                        description: `Flip Challenge complete! You earned ${challenge.xpReward} XP for '${challenge.title}'.`
                    });
                    await createNotification({
                        userId: user.id,
                        type: 'system',
                        content: `Challenge Complete! You earned ${challenge.xpReward} XP for "${challenge.title}".`,
                        link: '/daily-interview-challenge',
                        isRead: false,
                    });
                }
            }
        }
    }

    if (newChallengesCompleted) {
        // Clear the completed challenge and mark it as done
        const finalUserWithCompletion = await updateUser(userId, { 
            completedChallengeIds: Array.from(completedChallengeIds),
            currentFlipChallenge: null, // Clear the challenge so a new one can be assigned
            flipChallengeAssignedAt: null,
        });
        return finalUserWithCompletion || finalUpdatedUser;
    }


    return finalUpdatedUser;
}


/**
 * Checks a user's profile against all available badges and awards any new ones they have earned.
 * @param userId The ID of the user to check.
 * @returns A promise that resolves to an array of newly awarded badges.
 */
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  logAction('Checking for and awarding badges', { userId });
  try {
    const userWithTaskXP = await checkChallengeProgressAndAwardXP(userId);
    if (!userWithTaskXP) return [];
    
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { resumeScanHistories: true },
        },
      },
    });
    if (!user) return [];
    
    const allBadges = await getBadges();
    if (!allBadges) return [];
    
    const earnedBadgeIds = new Set(user.earnedBadges || []);
    const newlyAwardedBadges: Badge[] = [];

    for (const badge of allBadges) {
      if (!earnedBadgeIds.has(badge.id) && badge.triggerCondition) {
        let criteriaMet = false;
        
        const [conditionKey, requiredValueStr] = badge.triggerCondition.split('_');
        const requiredValue = parseInt(requiredValueStr, 10);

        if (!isNaN(requiredValue)) {
            switch (conditionKey) {
                case 'daily':
                    if ((user.dailyStreak || 0) >= requiredValue) criteriaMet = true;
                    break;
                case 'resume':
                    if ((user._count.resumeScanHistories || 0) >= requiredValue) criteriaMet = true;
                    break;
            }
        }

        if (criteriaMet) {
          earnedBadgeIds.add(badge.id);
          newlyAwardedBadges.push(badge);
          await createActivity({
            userId: user.id,
            tenantId: user.tenantId,
            description: `Earned a new badge: "${badge.name}"!`
          });
          if (badge.streakFreezeReward && badge.streakFreezeReward > 0) {
            await createActivity({
              userId: user.id,
              tenantId: user.tenantId,
              description: `Earned ${badge.streakFreezeReward} streak freeze(s) from the "${badge.name}" badge.`,
            });
          }
          await createNotification({
              userId: user.id,
              type: 'system',
              content: `Badge Unlocked! You've earned the "${badge.name}" badge.`,
              link: '/gamification',
              isRead: false,
          });
        }
      }
    }

    if (newlyAwardedBadges.length > 0) {
      logAction('Awarding new badges', { userId, count: newlyAwardedBadges.length, badges: newlyAwardedBadges.map(b => b.name) });
      const totalXpReward = newlyAwardedBadges.reduce((sum, badge) => sum + (badge.xpReward || 0), 0);
      const totalStreakFreezeReward = newlyAwardedBadges.reduce((sum, badge) => sum + (badge.streakFreezeReward || 0), 0);

      if(totalXpReward > 0) {
        await addXp(userId, totalXpReward, "XP reward from new badges");
      }
      
      await updateUser(userId, { 
        earnedBadges: Array.from(earnedBadgeIds),
        streakFreezes: (user.streakFreezes || 0) + totalStreakFreezeReward,
      });
    }

    return newlyAwardedBadges;

  } catch (error) {
    logError(`[GamificationAction] Error checking/awarding badges for user ${userId}`, error, { userId });
    return [];
  }
}


/**
 * Fetches all badges from the database.
 * @returns A promise that resolves to an array of Badge objects.
 */
export async function getBadges(): Promise<Badge[]> {
  logAction('Fetching all badges');
  try {
    const badges = await db.badge.findMany({
      orderBy: { name: 'asc' },
    });
    return badges as unknown as Badge[];
  } catch (error) {
    logError('[GamificationAction] Error fetching badges', error);
    return [];
  }
}

/**
 * Creates a new badge.
 * @param badgeData The data for the new badge.
 * @returns The newly created Badge object or null if failed.
 */
export async function createBadge(badgeData: Omit<Badge, 'id'>): Promise<Badge | null> {
  logAction('Creating new badge', { name: badgeData.name });
  try {
    // Manually generate a unique ID to satisfy the generated Prisma client type
    const dataForDb = {
        id: `badge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: badgeData.name,
        description: badgeData.description,
        icon: badgeData.icon,
        xpReward: badgeData.xpReward,
        triggerCondition: badgeData.triggerCondition,
        streakFreezeReward: badgeData.streakFreezeReward,
    };
    const newBadge = await db.badge.create({
      data: dataForDb,
    });
    return newBadge as unknown as Badge;
  } catch (error) {
    logError('[GamificationAction] Error creating badge', error, { name: badgeData.name });
    return null;
  }
}

/**
 * Updates an existing badge.
 * @param badgeId The ID of the badge to update.
 * @param updateData The data to update.
 * @returns The updated Badge object or null if failed.
 */
export async function updateBadge(badgeId: string, updateData: Partial<Omit<Badge, 'id'>>): Promise<Badge | null> {
  logAction('Updating badge', { badgeId });
  try {
    const updatedBadge = await db.badge.update({
      where: { id: badgeId },
      data: updateData,
    });
    return updatedBadge as unknown as Badge;
  } catch (error) {
    logError(`[GamificationAction] Error updating badge ${badgeId}`, error, { badgeId });
    return null;
  }
}

/**
 * Deletes a badge.
 * @param badgeId The ID of the badge to delete.
 * @returns A boolean indicating success.
 */
export async function deleteBadge(badgeId: string): Promise<boolean> {
  logAction('Deleting badge', { badgeId });
  try {
    await db.badge.delete({
      where: { id: badgeId },
    });
    return true;
  } catch (error) {
    logError(`[GamificationAction] Error deleting badge ${badgeId}`, error, { badgeId });
    return false;
  }
}

/**
 * Fetches all gamification rules (XP rules) from the database.
 * @returns A promise that resolves to an array of GamificationRule objects.
 */
export async function getGamificationRules(): Promise<GamificationRule[]> {
  logAction('Fetching gamification rules');
  try {
    const rules = await db.gamificationRule.findMany({
      orderBy: { actionId: 'asc' },
    });
    return rules as unknown as GamificationRule[];
  } catch (error) {
    logError('[GamificationAction] Error fetching gamification rules', error);
    return [];
  }
}

/**
 * Creates a new gamification rule.
 * @param ruleData The data for the new rule.
 * @returns The newly created GamificationRule object or null if failed.
 */
export async function createGamificationRule(ruleData: GamificationRule): Promise<GamificationRule | null> {
  logAction('Creating gamification rule', { actionId: ruleData.actionId });
  try {
    const newRule = await db.gamificationRule.create({
      data: ruleData,
    });
    return newRule as unknown as GamificationRule;
  } catch (error) {
    logError('[GamificationAction] Error creating gamification rule', error, { actionId: ruleData.actionId });
    return null;
  }
}

/**
 * Updates an existing gamification rule.
 * @param actionId The actionId of the rule to update.
 * @param updateData The data to update.
 * @returns The updated GamificationRule object or null if failed.
 */
export async function updateGamificationRule(actionId: string, updateData: Partial<Omit<GamificationRule, 'actionId'>>): Promise<GamificationRule | null> {
  logAction('Updating gamification rule', { actionId });
  try {
    const updatedRule = await db.gamificationRule.update({
      where: { actionId },
      data: updateData,
    });
    return updatedRule as unknown as GamificationRule;
  } catch (error) {
    logError(`[GamificationAction] Error updating gamification rule ${actionId}`, error, { actionId });
    return null;
  }
}

/**
 * Deletes a gamification rule.
 * @param actionId The actionId of the rule to delete.
 * @returns A boolean indicating success.
 */
export async function deleteGamificationRule(actionId: string): Promise<boolean> {
  logAction('Deleting gamification rule', { actionId });
  try {
    await db.gamificationRule.delete({
      where: { actionId },
    });
    return true;
  } catch (error) {
    logError(`[GamificationAction] Error deleting gamification rule ${actionId}`, error, { actionId });
    return false;
  }
}
