
'use server';

import { db } from '@/lib/db';
import type { Announcement, UserProfile } from '@/types';

/**
 * Fetches announcements visible to the current user.
 * It considers tenant, role, and platform-wide announcements.
 * @param currentUser The user object for whom to fetch announcements.
 * @returns A promise that resolves to an array of Announcement objects.
 */
export async function getVisibleAnnouncements(currentUser: UserProfile): Promise<Announcement[]> {
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
        AND: [
          {
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
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return announcements as unknown as Announcement[];
  } catch (error) {
    console.error('[AnnouncementAction] Error fetching visible announcements:', error);
    return [];
  }
}

/**
 * Fetches all announcements for an admin/manager view.
 * @param tenantId Optional tenantId to scope announcements for managers.
 * @returns A promise that resolves to an array of all Announcement objects for the scope.
 */
export async function getAllAnnouncements(tenantId?: string): Promise<Announcement[]> {
  try {
    const whereClause: any = {};
    if (tenantId) {
        // Managers can see their tenant's announcements and platform-wide ones
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
    console.error('[AnnouncementAction] Error fetching all announcements:', error);
    return [];
  }
}


/**
 * Creates a new announcement.
 * @param announcementData The data for the new announcement.
 * @returns The newly created Announcement object or null if failed.
 */
export async function createAnnouncement(announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement | null> {
  try {
    const newAnnouncement = await db.announcement.create({
      data: announcementData,
    });
    return newAnnouncement as unknown as Announcement;
  } catch (error) {
    console.error('[AnnouncementAction] Error creating announcement:', error);
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
  try {
    const updatedAnnouncement = await db.announcement.update({
      where: { id: announcementId },
      data: updateData,
    });
    return updatedAnnouncement as unknown as Announcement;
  } catch (error) {
    console.error(`[AnnouncementAction] Error updating announcement ${announcementId}:`, error);
    return null;
  }
}

/**
 * Deletes an announcement.
 * @param announcementId The ID of the announcement to delete.
 * @returns A boolean indicating success.
 */
export async function deleteAnnouncement(announcementId: string): Promise<boolean> {
  try {
    await db.announcement.delete({
      where: { id: announcementId },
    });
    return true;
  } catch (error) {
    console.error(`[AnnouncementAction] Error deleting announcement ${announcementId}:`, error);
    return false;
  }
}
