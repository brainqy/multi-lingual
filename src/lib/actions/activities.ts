
'use server';

import { db } from '@/lib/db';
import type { Activity } from '@/types';

/**
 * Fetches all activities, optionally scoped by user.
 * @param userId Optional user ID. If provided, fetches activities for that user.
 * @returns A promise that resolves to an array of Activity objects.
 */
export async function getActivities(userId?: string): Promise<Activity[]> {
  try {
    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }
    const activities = await db.activity.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 50, // Limit to recent 50 activities for performance
    });
    return activities as unknown as Activity[];
  } catch (error) {
    console.error('[ActivityAction] Error fetching activities:', error);
    return [];
  }
}

/**
 * Creates a new activity log entry.
 * @param activityData Data for the new activity.
 * @returns The newly created Activity object or null.
 */
export async function createActivity(activityData: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity | null> {
    try {
        const newActivity = await db.activity.create({
            data: activityData,
        });
        return newActivity as unknown as Activity;
    } catch (error) {
        console.error('[ActivityAction] Error creating activity:', error);
        return null;
    }
}
