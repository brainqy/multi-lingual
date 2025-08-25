
'use server';

import { db } from '@/lib/db';
import type { Badge, DailyChallenge, GamificationRule, UserProfile } from '@/types';
import { updateUser } from '@/lib/data-services/users';
import { createActivity } from './activities';
import { getChallenges } from './challenges';

/**
 * Checks a user's activity against active Flip Challenge tasks and awards XP if a task is completed.
 * @param userId The ID of the user to check.
 * @returns The user profile, potentially updated with new XP.
 */
export async function checkChallengeProgressAndAwardXP(userId: string): Promise<UserProfile | null> {
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

    if (!user) return null;

    const challenges = await getChallenges();
    const flipChallenges = challenges.filter(c => c.type === 'flip');
    if (flipChallenges.length === 0) return user;

    let totalXpGained = 0;

    for (const challenge of flipChallenges) {
        if (!challenge.tasks) continue;

        for (const task of challenge.tasks) {
            let currentCount = 0;
            switch (task.action) {
                case 'analyze_resume':
                    currentCount = user._count.resumeScanHistories;
                    break;
                case 'add_job_application':
                    currentCount = user._count.jobApplications;
                    break;
                case 'community_post':
                    currentCount = user._count.communityPosts;
                    break;
                case 'community_comment':
                    currentCount = user._count.communityComments;
                    break;
                case 'refer':
                    currentCount = user.referralHistory.filter(r => r.status === 'Signed Up' || r.status === 'Reward Earned').length;
                    break;
                case 'book_appointment':
                    currentCount = user._count.appointmentsAsRequester;
                    break;
            }

            // This logic is simplistic. A real app would need to track which tasks have already been rewarded
            // to prevent awarding XP multiple times for the same task completion (e.g., on the 4th, 5th scan etc.)
            // For this demo, we assume if the count equals the target, they just hit it.
            if (currentCount === task.target) {
                if (challenge.xpReward) {
                    totalXpGained += challenge.xpReward;
                    await createActivity({
                        userId: user.id,
                        tenantId: user.tenantId,
                        description: `Task complete! You earned ${challenge.xpReward} XP for '${challenge.title}'.`
                    });
                }
            }
        }
    }

    if (totalXpGained > 0) {
        const updatedUser = await updateUser(userId, { xpPoints: (user.xpPoints || 0) + totalXpGained });
        return updatedUser;
    }

    return user as unknown as UserProfile;
}


/**
 * Checks a user's profile against all available badges and awards any new ones they have earned.
 * @param userId The ID of the user to check.
 * @returns A promise that resolves to an array of newly awarded badges.
 */
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  try {
    // First, check for any task completions and award XP
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
                    if ((user.dailyStreak || 0) >= requiredValue) {
                        criteriaMet = true;
                    }
                    break;
                case 'resume':
                    if ((user._count.resumeScanHistories || 0) >= requiredValue) {
                        criteriaMet = true;
                    }
                    break;
            }
        } else if (badge.triggerCondition === 'profile_completion_100') {
            // Mocking profile completion for now
        }

        if (criteriaMet) {
          earnedBadgeIds.add(badge.id);
          newlyAwardedBadges.push(badge);
          await createActivity({
            userId: user.id,
            tenantId: user.tenantId,
            description: `Earned a new badge: "${badge.name}"!`
          });
        }
      }
    }

    if (newlyAwardedBadges.length > 0) {
      const totalXpReward = newlyAwardedBadges.reduce((sum, badge) => sum + (badge.xpReward || 0), 0);
      const totalStreakFreezeReward = newlyAwardedBadges.reduce((sum, badge) => sum + (badge.streakFreezeReward || 0), 0);
      await updateUser(userId, { 
        earnedBadges: Array.from(earnedBadgeIds),
        xpPoints: (user.xpPoints || 0) + totalXpReward,
        streakFreezes: (user.streakFreezes || 0) + totalStreakFreezeReward,
      });
    }

    return newlyAwardedBadges;

  } catch (error) {
    console.error(`[GamificationAction] Error checking/awarding badges for user ${userId}:`, error);
    return [];
  }
}


/**
 * Fetches all badges from the database.
 * @returns A promise that resolves to an array of Badge objects.
 */
export async function getBadges(): Promise<Badge[]> {
  try {
    const badges = await db.badge.findMany({
      orderBy: { name: 'asc' },
    });
    return badges as unknown as Badge[];
  } catch (error) {
    console.error('[GamificationAction] Error fetching badges:', error);
    return [];
  }
}

/**
 * Creates a new badge.
 * @param badgeData The data for the new badge.
 * @returns The newly created Badge object or null if failed.
 */
export async function createBadge(badgeData: Omit<Badge, 'id'>): Promise<Badge | null> {
  try {
    const newBadge = await db.badge.create({
      data: badgeData,
    });
    return newBadge as unknown as Badge;
  } catch (error) {
    console.error('[GamificationAction] Error creating badge:', error);
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
  try {
    const updatedBadge = await db.badge.update({
      where: { id: badgeId },
      data: updateData,
    });
    return updatedBadge as unknown as Badge;
  } catch (error) {
    console.error(`[GamificationAction] Error updating badge ${badgeId}:`, error);
    return null;
  }
}

/**
 * Deletes a badge.
 * @param badgeId The ID of the badge to delete.
 * @returns A boolean indicating success.
 */
export async function deleteBadge(badgeId: string): Promise<boolean> {
  try {
    await db.badge.delete({
      where: { id: badgeId },
    });
    return true;
  } catch (error) {
    console.error(`[GamificationAction] Error deleting badge ${badgeId}:`, error);
    return false;
  }
}

/**
 * Fetches all gamification rules (XP rules) from the database.
 * @returns A promise that resolves to an array of GamificationRule objects.
 */
export async function getGamificationRules(): Promise<GamificationRule[]> {
  try {
    const rules = await db.gamificationRule.findMany({
      orderBy: { actionId: 'asc' },
    });
    return rules as unknown as GamificationRule[];
  } catch (error) {
    console.error('[GamificationAction] Error fetching gamification rules:', error);
    return [];
  }
}

/**
 * Creates a new gamification rule.
 * @param ruleData The data for the new rule.
 * @returns The newly created GamificationRule object or null if failed.
 */
export async function createGamificationRule(ruleData: GamificationRule): Promise<GamificationRule | null> {
  try {
    const newRule = await db.gamificationRule.create({
      data: ruleData,
    });
    return newRule as unknown as GamificationRule;
  } catch (error) {
    console.error('[GamificationAction] Error creating gamification rule:', error);
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
  try {
    const updatedRule = await db.gamificationRule.update({
      where: { actionId },
      data: updateData,
    });
    return updatedRule as unknown as GamificationRule;
  } catch (error) {
    console.error(`[GamificationAction] Error updating gamification rule ${actionId}:`, error);
    return null;
  }
}

/**
 * Deletes a gamification rule.
 * @param actionId The actionId of the rule to delete.
 * @returns A boolean indicating success.
 */
export async function deleteGamificationRule(actionId: string): Promise<boolean> {
  try {
    await db.gamificationRule.delete({
      where: { actionId },
    });
    return true;
  } catch (error) {
    console.error(`[GamificationAction] Error deleting gamification rule ${actionId}:`, error);
    return false;
  }
}
