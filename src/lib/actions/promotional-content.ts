
'use server';

import { db } from '@/lib/db';
import type { PromotionalContent, UserProfile } from '@/types';
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
    const dataForDb: any = {
      isActive: contentData.isActive,
      title: contentData.title,
      description: contentData.description,
      imageUrl: contentData.imageUrl,
      imageAlt: contentData.imageAlt,
      imageHint: contentData.imageHint,
      buttonText: contentData.buttonText,
      buttonLink: contentData.buttonLink,
      gradientFrom: contentData.gradientFrom,
      gradientVia: contentData.gradientVia,
      gradientTo: contentData.gradientTo,
      audience: contentData.audience,
      audienceTarget: contentData.audience === 'All Users' ? null : contentData.audienceTarget,
    };
    
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
    // Construct a clean data object with only the fields that are part of the model.
    // This prevents passing invalid fields like 'id', 'createdAt', etc., in the data payload.
    const dataForDb: Partial<PromotionalContent> = {
      isActive: updateData.isActive,
      title: updateData.title,
      description: updateData.description,
      imageUrl: updateData.imageUrl,
      imageAlt: updateData.imageAlt,
      imageHint: updateData.imageHint,
      buttonText: updateData.buttonText,
      buttonLink: updateData.buttonLink,
      gradientFrom: updateData.gradientFrom,
      gradientVia: updateData.gradientVia,
      gradientTo: updateData.gradientTo,
      audience: updateData.audience,
      // Set audienceTarget to null if audience is 'All Users', otherwise use the provided value.
      audienceTarget: updateData.audience === 'All Users' ? null : updateData.audienceTarget,
    };


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
