
'use server';

import { db } from '@/lib/db';
import type { GalleryEvent, UserProfile } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { headers } from 'next/headers';

/**
 * Fetches all gallery events for an admin/manager view.
 * @returns A promise that resolves to an array of GalleryEvent objects.
 */
export async function getAllGalleryEvents(): Promise<GalleryEvent[]> {
  const headersList = headers();
  const tenantId = headersList.get('X-Tenant-Id');
  logAction('Fetching all gallery events', { tenantId });
  try {
    const whereClause: any = {};
    if (tenantId && tenantId !== 'platform') {
      whereClause.OR = [{ tenantId }, { isPlatformGlobal: true }];
    }
    const events = await db.galleryEvent.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
    return events as unknown as GalleryEvent[];
  } catch (error) {
    logError('[GalleryAction] Error fetching all events', error, { tenantId });
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
  logAction('Fetching visible gallery events', { userId: currentUser.id });
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
    logError('[GalleryAction] Error fetching visible events', error, { userId: currentUser.id });
    return [];
  }
}

/**
 * Creates a new gallery event.
 * @param eventData The data for the new event.
 * @returns The newly created GalleryEvent object or null.
 */
export async function createGalleryEvent(eventData: Omit<GalleryEvent, 'id'>): Promise<GalleryEvent | null> {
  logAction('Creating gallery event', { title: eventData.title, createdBy: eventData.createdByUserId });
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
    logError('[GalleryAction] Error creating event', error, { title: eventData.title });
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
  logAction('Updating gallery event', { eventId });
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
    logError(`[GalleryAction] Error updating event ${eventId}`, error, { eventId });
    return null;
  }
}

/**
 * Deletes a gallery event.
 * @param eventId The ID of the event to delete.
 * @returns A boolean indicating success.
 */
export async function deleteGalleryEvent(eventId: string): Promise<boolean> {
  logAction('Deleting gallery event', { eventId });
  try {
    await db.galleryEvent.delete({
      where: { id: eventId },
    });
    return true;
  } catch (error) {
    logError(`[GalleryAction] Error deleting event ${eventId}`, error, { eventId });
    return false;
  }
}

    