
'use server';

import { db } from '@/lib/db';
import type { Notification } from '@/types';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches notifications for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of Notification objects.
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  logAction('Fetching notifications', { userId });
  try {
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return notifications as unknown as Notification[];
  } catch (error) {
    logError(`[NotificationAction] Error fetching notifications for user ${userId}`, error, { userId });
    return [];
  }
}

/**
 * Creates a new notification.
 * @param notificationData The data for the new notification.
 * @returns The newly created Notification object or null.
 */
export async function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification | null> {
  logAction('Creating notification', { userId: notificationData.userId, type: notificationData.type });
  try {
    const newNotification = await db.notification.create({
      data: notificationData,
    });
    return newNotification as unknown as Notification;
  } catch (error) {
    logError('[NotificationAction] Error creating notification', error, { userId: notificationData.userId });
    return null;
  }
}

/**
 * Marks all unread notifications for a user as read.
 * @param userId The ID of the user.
 * @returns A boolean indicating success.
 */
export async function markNotificationsAsRead(userId: string): Promise<boolean> {
  logAction('Marking notifications as read', { userId });
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
    logError(`[NotificationAction] Error marking notifications as read for user ${userId}`, error, { userId });
    return false;
  }
}
