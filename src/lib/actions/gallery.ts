
'use server';

import { db } from '@/lib/db';
import type { GalleryEvent, UserProfile } from '@/types';

/**
 * Fetches all gallery events for an admin/manager view.
 * @param tenantId Optional tenantId to scope events for managers.
 * @returns A promise that resolves to an array of GalleryEvent objects.
 */
export async function getAllGalleryEvents(tenantId?: string): Promise<GalleryEvent[]> {
  try {
    const whereClause: any = {};
    if (tenantId) {
      whereClause.OR = [{ tenantId }, { isPlatformGlobal: true }];
    }
    const events = await db.galleryEvent.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
    return events as unknown as GalleryEvent[];
  } catch (error) {
    console.error('[GalleryAction] Error fetching all events:', error);
    return [];
  }
}

/**
 * Fetches gallery events visible to a regular user.
 * It considers tenant-specific events and platform-wide events that are approved.
 * @param currentUser The user object for whom to fetch events.
 * @returns A promise that resolves to an array of GalleryEvent objects.
 */
export async function getVisibleGalleryEvents(currentUser: UserProfile): Promise<GalleryEvent[]> {
  try {
    if (!currentUser) return [];
    
    const whereClause: any = {
      approved: true,
      OR: [{ isPlatformGlobal: true }],
    };
    
    if (currentUser.tenantId) {
      whereClause.OR.push({ tenantId: currentUser.tenantId });
    }

    const events = await db.galleryEvent.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return events as unknown as GalleryEvent[];
  } catch (error) {
    console.error('[GalleryAction] Error fetching visible events:', error);
    return [];
  }
}

/**
 * Creates a new gallery event.
 * @param eventData The data for the new event.
 * @returns The newly created GalleryEvent object or null.
 */
export async function createGalleryEvent(eventData: Omit<GalleryEvent, 'id'>): Promise<GalleryEvent | null> {
  try {
    const newEvent = await db.galleryEvent.create({
      data: {
        ...eventData,
        date: new Date(eventData.date),
        imageUrls: eventData.imageUrls || [],
        attendeeUserIds: eventData.attendeeUserIds || [],
      },
    });
    return newEvent as unknown as GalleryEvent;
  } catch (error) {
    console.error('[GalleryAction] Error creating event:', error);
    return null;
  }
}

/**
 * Updates an existing gallery event.
 * @param eventId The ID of the event to update.
 * @param updateData The data to update.
 * @returns The updated GalleryEvent object or null.
 */
export async function updateGalleryEvent(eventId: string, updateData: Partial<Omit<GalleryEvent, 'id'>>): Promise<GalleryEvent | null> {
  try {
    const updatedEvent = await db.galleryEvent.update({
      where: { id: eventId },
      data: {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
    });
    return updatedEvent as unknown as GalleryEvent;
  } catch (error) {
    console.error(`[GalleryAction] Error updating event ${eventId}:`, error);
    return null;
  }
}

/**
 * Deletes a gallery event.
 * @param eventId The ID of the event to delete.
 * @returns A boolean indicating success.
 */
export async function deleteGalleryEvent(eventId: string): Promise<boolean> {
  try {
    await db.galleryEvent.delete({
      where: { id: eventId },
    });
    return true;
  } catch (error) {
    console.error(`[GalleryAction] Error deleting event ${eventId}:`, error);
    return false;
  }
}
