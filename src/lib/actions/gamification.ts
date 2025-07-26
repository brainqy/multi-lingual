
'use server';

import { db } from '@/lib/db';
import type { Badge, GamificationRule } from '@/types';

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
