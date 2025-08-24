
'use server';

import { db } from '@/lib/db';
import type { Badge, GamificationRule, UserProfile } from '@/types';
import { updateUser } from '@/lib/data-services/users';
import { createActivity } from '@/lib/actions/activities';


/**
 * Checks a user's profile against all available badges and awards any new ones they have earned.
 * This function uses a scalable approach to parse trigger conditions.
 * @param userId The ID of the user to check.
 * @returns A promise that resolves to an array of newly awarded badges.
 */
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        // Include related data needed for checks
        _count: {
          select: { resumeScans: true },
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
        
        // Scalable condition engine
        const [conditionKey, requiredValueStr] = badge.triggerCondition.split('_');
        const requiredValue = parseInt(requiredValueStr, 10);

        if (!isNaN(requiredValue)) {
            switch (conditionKey) {
                case 'daily': // Handles daily_streak_3, daily_streak_7 etc.
                    if ((user.dailyStreak || 0) >= requiredValue) {
                        criteriaMet = true;
                    }
                    break;
                case 'resume': // Handles resume_scans_5, resume_scans_10 etc.
                    if ((user._count.resumeScans || 0) >= requiredValue) {
                        criteriaMet = true;
                    }
                    break;
                // Add more cases here for connections, posts, etc.
                // e.g., case 'connections': if(user.connections.length >= requiredValue) criteriaMet = true; break;
            }
        } else if (badge.triggerCondition === 'profile_completion_100') {
            // Handle non-numeric conditions separately
            // In a real app, profile completion would be calculated and stored or passed in.
            // For now, we'll assume a mock value. A full implementation would require a function.
            // const profileCompletion = calculateProfileCompletion(user); 
            // if (profileCompletion >= 100) criteriaMet = true;
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
