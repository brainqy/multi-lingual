
'use server';

import { db } from '@/lib/db';
import type { PromotionalContent } from '@/types';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches all promotional content items.
 * @returns A promise that resolves to an array of PromotionalContent objects.
 */
export async function getPromotionalContent(): Promise<PromotionalContent[]> {
  logAction('Fetching all promotional content');
  try {
    const contentItems = await db.promotionalContent.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return contentItems as unknown as PromotionalContent[];
  } catch (error) {
    logError('[PromoAction] Error fetching promotional content', error);
    return [];
  }
}

/**
 * Fetches only the active promotional content items.
 * @returns A promise that resolves to an array of active PromotionalContent objects.
 */
export async function getActivePromotionalContent(): Promise<PromotionalContent[]> {
  logAction('Fetching active promotional content');
  try {
    const activeContent = await db.promotionalContent.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return activeContent as unknown as PromotionalContent[];
  } catch (error) {
    logError('[PromoAction] Error fetching active promotional content', error);
    return [];
  }
}

/**
 * Creates a new promotional content item.
 * @param contentData Data for the new item.
 * @returns The newly created PromotionalContent object or null.
 */
export async function createPromotionalContent(contentData: Omit<PromotionalContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromotionalContent | null> {
  logAction('Creating promotional content', { title: contentData.title });
  try {
    const newItem = await db.promotionalContent.create({
      data: contentData,
    });
    return newItem as unknown as PromotionalContent;
  } catch (error) {
    logError('[PromoAction] Error creating promotional content', error, { title: contentData.title });
    return null;
  }
}

/**
 * Updates an existing promotional content item.
 * @param contentId The ID of the item to update.
 * @param updateData The data to update.
 * @returns The updated PromotionalContent object or null.
 */
export async function updatePromotionalContent(contentId: string, updateData: Partial<Omit<PromotionalContent, 'id'>>): Promise<PromotionalContent | null> {
  logAction('Updating promotional content', { contentId });
  try {
    const updatedItem = await db.promotionalContent.update({
      where: { id: contentId },
      data: updateData,
    });
    return updatedItem as unknown as PromotionalContent;
  } catch (error) {
    logError(`[PromoAction] Error updating promotional content ${contentId}`, error, { contentId });
    return null;
  }
}

/**
 * Deletes a promotional content item.
 * @param contentId The ID of the item to delete.
 * @returns A boolean indicating success.
 */
export async function deletePromotionalContent(contentId: string): Promise<boolean> {
  logAction('Deleting promotional content', { contentId });
  try {
    await db.promotionalContent.delete({
      where: { id: contentId },
    });
    return true;
  } catch (error) {
    logError(`[PromoAction] Error deleting promotional content ${contentId}`, error, { contentId });
    return false;
  }
}
