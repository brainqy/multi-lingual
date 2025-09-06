
'use server';

import { db } from '@/lib/db';
import type { Activity } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { getUserByEmail } from '../data-services/users';
import { headers } from 'next/headers';

/**
 * Fetches all activities, optionally scoped by user.
 * @param userId Optional user ID. If provided, fetches activities for that user.
 * @returns A promise that resolves to an array of Activity objects.
 */
export async function getActivities(userId?: string): Promise<Activity[]> {
  logAction('Fetching activities', { userId });
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
    logError('[ActivityAction] Error fetching activities', error, { userId });
    return [];
  }
}

/**
 * Creates a new activity log entry.
 * @param activityData Data for the new activity.
 * @returns The newly created Activity object or null.
 */
export async function createActivity(activityData: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity | null> {
    const { userId, ...restOfData } = activityData;
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id') || 'platform';
    logAction('Creating activity', { userId, description: restOfData.description, tenantId });
    try {
        const dataForDb: any = {
            ...restOfData,
            tenantId: tenantId,
        };

        if (userId) {
            dataForDb.user = {
                connect: { id: userId },
            };
        } else {
            // For system-level activities without a user, assign to the admin user.
            const adminUser = await getUserByEmail('admin@bhashasetu.com');
            if (adminUser) {
                dataForDb.user = {
                    connect: { id: adminUser.id },
                };
            } else {
                logError('[ActivityAction] Admin user not found for system activity', {}, {});
                // Fallback or handle error if admin user doesn't exist
                return null;
            }
        }

        const newActivity = await db.activity.create({
            data: dataForDb,
        });
        return newActivity as unknown as Activity;
    } catch (error) {
        logError('[ActivityAction] Error creating activity', error, { userId });
        return null;
    }
}
