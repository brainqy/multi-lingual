
'use server';

import { db } from '@/lib/db';
import type { GalleryEvent, UserProfile } from '@/types';

/**
 * Fetches gallery events visible to the current user.
 * It considers tenant-specific events and platform-wide events.
 * @param currentUser The user object for whom to fetch events.
 * @returns A promise that resolves to an array of GalleryEvent objects.
 */
export async function getGalleryEvents(currentUser: UserProfile): Promise<GalleryEvent[]> {
  try {
    if (!currentUser) {
      return [];
    }
    
    const whereClause: any = {
      approved: true, // Only show approved events in the public gallery
      OR: [
        { isPlatformGlobal: true },
      ],
    };
    
    // If the user belongs to a tenant, also include events for that tenant
    if (currentUser.tenantId) {
      whereClause.OR.push({ tenantId: currentUser.tenantId });
    }

    const events = await db.galleryEvent.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
    });

    return events as unknown as GalleryEvent[];
  } catch (error) {
    console.error('[GalleryAction] Error fetching gallery events:', error);
    return [];
  }
}
