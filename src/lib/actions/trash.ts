
'use server';

import { db } from '@/lib/db';
import type { SoftDeletedItem, UserStatus } from '@/types';
import { Prisma } from '@prisma/client';
import { logAction, logError } from '@/lib/logger';
import { subDays } from 'date-fns';

type ItemType = 'User' | 'PromoCode' | 'Announcement' | 'GalleryEvent' | 'ResumeTemplate';

const getModelForType = (type: ItemType): Prisma.ModelName => {
    switch (type) {
        case 'User': return 'User';
        case 'PromoCode': return 'PromoCode';
        case 'Announcement': return 'Announcement';
        case 'GalleryEvent': return 'GalleryEvent';
        case 'ResumeTemplate': return 'ResumeTemplate';
        default: throw new Error(`Invalid item type: ${type}`);
    }
};

/**
 * Fetches all soft-deleted items from various models.
 * @returns A promise that resolves to an array of SoftDeletedItem objects.
 */
export async function getTrashItems(): Promise<SoftDeletedItem[]> {
  logAction('Fetching trash items');
  try {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const items: SoftDeletedItem[] = [];

    // Fetch soft-deleted users
    const users = await db.user.findMany({ where: { status: 'PENDING_DELETION' } });
    items.push(...users.map(u => ({ id: u.id, name: u.name || u.email, type: 'User' as const, deletedAt: u.updatedAt })));

    // Fetch soft-deleted promo codes
    const promoCodes = await db.promoCode.findMany({ where: { deletedAt: { not: null } } });
    items.push(...promoCodes.map(p => ({ id: p.id, name: p.code, type: 'PromoCode' as const, deletedAt: p.deletedAt! })));

    // Fetch soft-deleted announcements
    const announcements = await db.announcement.findMany({ where: { deletedAt: { not: null } } });
    items.push(...announcements.map(a => ({ id: a.id, name: a.title, type: 'Announcement' as const, deletedAt: a.deletedAt! })));
    
    // Fetch soft-deleted gallery events
    const galleryEvents = await db.galleryEvent.findMany({ where: { deletedAt: { not: null } } });
    items.push(...galleryEvents.map(g => ({ id: g.id, name: g.title, type: 'GalleryEvent' as const, deletedAt: g.deletedAt! })));

    // Fetch soft-deleted resume templates
    const resumeTemplates = await db.resumeTemplate.findMany({ where: { deletedAt: { not: null } } });
    items.push(...resumeTemplates.map(r => ({ id: r.id, name: r.name, type: 'ResumeTemplate' as const, deletedAt: r.deletedAt! })));

    return items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  } catch (error) {
    logError('[TrashAction] Error fetching trash items', error);
    return [];
  }
}

/**
 * Restores a soft-deleted item.
 * @param itemId The ID of the item to restore.
 * @param itemType The type of the item.
 * @returns A success or error object.
 */
export async function restoreItem(itemId: string, itemType: ItemType): Promise<{ success: boolean; error?: string }> {
  logAction('Restoring item', { itemId, itemType });
  try {
    if (itemType === 'User') {
      await db.user.update({
        where: { id: itemId, status: 'PENDING_DELETION' },
        data: { status: 'active' },
      });
    } else {
      const modelName = getModelForType(itemType).toLowerCase() as 'promoCode' | 'announcement' | 'galleryEvent' | 'resumeTemplate';
      await (db[modelName] as any).update({
        where: { id: itemId },
        data: { deletedAt: null },
      });
    }
    return { success: true };
  } catch (error) {
    logError(`[TrashAction] Error restoring item ${itemId}`, error, { itemId, itemType });
    return { success: false, error: 'Failed to restore the item.' };
  }
}

/**
 * Permanently deletes a soft-deleted item.
 * @param itemId The ID of the item to delete.
 * @param itemType The type of the item.
 * @returns A success or error object.
 */
export async function hardDeleteItem(itemId: string, itemType: ItemType): Promise<{ success: boolean; error?: string }> {
  logAction('Permanently deleting item', { itemId, itemType });
  try {
    const modelName = getModelForType(itemType).toLowerCase() as 'user' | 'promoCode' | 'announcement' | 'galleryEvent' | 'resumeTemplate';
    await (db[modelName] as any).delete({
        where: { id: itemId },
    });
    return { success: true };
  } catch (error) {
    logError(`[TrashAction] Error permanently deleting item ${itemId}`, error, { itemId, itemType });
    return { success: false, error: 'Failed to permanently delete the item.' };
  }
}

/**
 * Permanently deletes all items soft-deleted more than 30 days ago.
 * @returns A success or error object with the count of deleted items.
 */
export async function cleanTrash(): Promise<{ success: boolean; count: number; error?: string }> {
  logAction('Cleaning trash');
  const thirtyDaysAgo = subDays(new Date(), 30);
  let deletedCount = 0;

  try {
    // Users
    const usersResult = await db.user.deleteMany({ where: { status: 'PENDING_DELETION', updatedAt: { lt: thirtyDaysAgo } } });
    deletedCount += usersResult.count;
    
    // Other models
    const models: ('promoCode' | 'announcement' | 'galleryEvent' | 'resumeTemplate')[] = ['promoCode', 'announcement', 'galleryEvent', 'resumeTemplate'];
    for (const model of models) {
      const result = await (db[model] as any).deleteMany({
        where: { deletedAt: { not: null, lt: thirtyDaysAgo } }
      });
      deletedCount += result.count;
    }

    logAction('Trash cleaned successfully', { deletedCount });
    return { success: true, count: deletedCount };
  } catch (error) {
    logError('[TrashAction] Error cleaning trash', error);
    return { success: false, count: 0, error: 'An error occurred while cleaning the trash.' };
  }
}
