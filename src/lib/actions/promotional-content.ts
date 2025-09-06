
'use server';

import { db } from '@/lib/db';
import type { PromotionalContent, UserProfile, UserRole } from '@/types';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches all promotional content items for the admin view.
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
 * Fetches active promotional content items relevant to the current user.
 * It filters based on the user's tenant and role.
 * @param currentUser The profile of the user viewing the content.
 * @returns A promise that resolves to an array of active PromotionalContent objects.
 */
export async function getActivePromotionalContent(currentUser: UserProfile): Promise<PromotionalContent[]> {
  logAction('Fetching active promotional content for user', { userId: currentUser.id });
  try {
    const activeContent = await db.promotionalContent.findMany({
      where: {
        isActive: true,
        OR: [
          // Content for all users
          { audience: 'All Users' },
          // Content for the user's specific tenant
          {
            audience: 'Specific Tenant',
            audienceTarget: currentUser.tenantId,
          },
          // Content for the user's specific role
          {
            audience: 'Specific Role',
            audienceTarget: currentUser.role,
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return activeContent as unknown as PromotionalContent[];
  } catch (error) {
    logError('[PromoAction] Error fetching active promotional content', error, { userId: currentUser.id });
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
    const dataForDb: any = { ...contentData };
    if (dataForDb.audience === 'All Users') {
      dataForDb.audienceTarget = null;
    }
    
    const newItem = await db.promotionalContent.create({
      data: dataForDb,
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
    // Destructure to remove the 'id' and other non-updatable fields if they're present in updateData from the form
    const { id, createdAt, updatedAt, ...restOfUpdateData } = updateData as any;

    const dataForDb: any = { ...restOfUpdateData };
    if (dataForDb.audience === 'All Users') {
      dataForDb.audienceTarget = null;
    }

    const updatedItem = await db.promotionalContent.update({
      where: { id: contentId },
      data: dataForDb,
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
