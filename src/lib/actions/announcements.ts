
'use server';

import { db } from '@/lib/db';
import type { Announcement, UserProfile } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { headers } from 'next/headers';

/**
 * Fetches announcements visible to the current user.
 * It considers tenant, role, and platform-wide announcements.
 * @param currentUser The user object for whom to fetch announcements.
 * @returns A promise that resolves to an array of Announcement objects.
 */
export async function getVisibleAnnouncements(currentUser: UserProfile): Promise<Announcement[]> {
  logAction('Fetching visible announcements', { userId: currentUser.id, tenantId: currentUser.tenantId });
  try {
    if (!currentUser) {
      return [];
    }
    const now = new Date();

    const announcements = await db.announcement.findMany({
      where: {
        status: 'Published',
        startDate: { lte: now },
        OR: [
          { endDate: { gte: now } },
          { endDate: null },
        ],
        AND: { // This is the corrected structure
          OR: [
            { audience: 'All Users' },
            {
              audience: 'Specific Tenant',
              audienceTarget: currentUser.tenantId,
            },
            {
              audience: 'Specific Role',
              audienceTarget: currentUser.role,
            },
          ],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return announcements as unknown as Announcement[];
  } catch (error) {
    logError('[AnnouncementAction] Error fetching visible announcements', error, { userId: currentUser.id });
    return [];
  }
}

/**
 * Fetches all announcements for an admin/manager view.
 * @param tenantId Optional tenantId to scope announcements for managers.
 * @returns A promise that resolves to an array of all Announcement objects for the scope.
 */
export async function getAllAnnouncements(tenantId?: string): Promise<Announcement[]> {
  logAction('Fetching all announcements', { tenantId });
  try {
    const whereClause: any = {};
    if (tenantId) {
        whereClause.OR = [
            { tenantId: tenantId },
            { audience: 'All Users' } 
        ];
    }
    
    const announcements = await db.announcement.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return announcements as unknown as Announcement[];
  } catch (error) {
    logError('[AnnouncementAction] Error fetching all announcements', error, { tenantId });
    return [];
  }
}


/**
 * Creates a new announcement.
 * @param announcementData The data for the new announcement.
 * @returns The newly created Announcement object or null if failed.
 */
export async function createAnnouncement(announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>): Promise<Announcement | null> {
  const headersList = headers();
  const tenantId = headersList.get('X-Tenant-Id') || 'platform';
  logAction('Creating announcement', { title: announcementData.title, createdBy: announcementData.createdBy, tenantId });
  try {
    const dataForDb = {
      ...announcementData,
      tenantId: announcementData.audience === 'Specific Tenant' ? announcementData.audienceTarget : tenantId,
    };
    const newAnnouncement = await db.announcement.create({
      data: dataForDb,
    });
    return newAnnouncement as unknown as Announcement;
  } catch (error) {
    logError('[AnnouncementAction] Error creating announcement', error, { title: announcementData.title });
    return null;
  }
}

/**
 * Updates an existing announcement.
 * @param announcementId The ID of the announcement to update.
 * @param updateData The data to update.
 * @returns The updated Announcement object or null if failed.
 */
export async function updateAnnouncement(announcementId: string, updateData: Partial<Omit<Announcement, 'id'>>): Promise<Announcement | null> {
  logAction('Updating announcement', { announcementId });
  try {
    const updatedAnnouncement = await db.announcement.update({
      where: { id: announcementId },
      data: updateData,
    });
    return updatedAnnouncement as unknown as Announcement;
  } catch (error) {
    logError(`[AnnouncementAction] Error updating announcement ${announcementId}`, error, { announcementId });
    return null;
  }
}

/**
 * Deletes an announcement.
 * @param announcementId The ID of the announcement to delete.
 * @returns A boolean indicating success.
 */
export async function deleteAnnouncement(announcementId: string): Promise<boolean> {
  logAction('Deleting announcement', { announcementId });
  try {
    await db.announcement.delete({
      where: { id: announcementId },
    });
    return true;
  } catch (error) {
    logError(`[AnnouncementAction] Error deleting announcement ${announcementId}`, error, { announcementId });
    return false;
  }
}
