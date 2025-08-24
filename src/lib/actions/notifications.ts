
'use server';

import { db } from '@/lib/db';
import type { Notification } from '@/types';

/**
 * Fetches notifications for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of Notification objects.
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to the 20 most recent notifications
    });
    return notifications as unknown as Notification[];
  } catch (error) {
    console.error(`[NotificationAction] Error fetching notifications for user ${userId}:`, error);
    return [];
  }
}

/**
 * Creates a new notification.
 * @param notificationData The data for the new notification.
 * @returns The newly created Notification object or null.
 */
export async function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification | null> {
  try {
    const newNotification = await db.notification.create({
      data: notificationData,
    });
    return newNotification as unknown as Notification;
  } catch (error) {
    console.error('[NotificationAction] Error creating notification:', error);
    return null;
  }
}

/**
 * Marks all unread notifications for a user as read.
 * @param userId The ID of the user.
 * @returns A boolean indicating success.
 */
export async function markNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    await db.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    return true;
  } catch (error) {
    console.error(`[NotificationAction] Error marking notifications as read for user ${userId}:`, error);
    return false;
  }
}
