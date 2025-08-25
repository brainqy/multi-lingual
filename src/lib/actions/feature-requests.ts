
'use server';

import { db } from '@/lib/db';
import type { FeatureRequest } from '@/types';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches all feature requests.
 * @returns A promise that resolves to an array of FeatureRequest objects.
 */
export async function getFeatureRequests(): Promise<FeatureRequest[]> {
  logAction('Fetching feature requests');
  try {
    const requests = await db.featureRequest.findMany({
      orderBy: { timestamp: 'desc' },
    });
    return requests as unknown as FeatureRequest[];
  } catch (error) {
    logError('[FeatureRequestAction] Error fetching requests', error);
    return [];
  }
}

/**
 * Creates a new feature request.
 * @param requestData The data for the new request.
 * @returns The newly created FeatureRequest object or null.
 */
export async function createFeatureRequest(requestData: Omit<FeatureRequest, 'id' | 'timestamp' | 'upvotes'>): Promise<FeatureRequest | null> {
  logAction('Creating feature request', { userId: requestData.userId, title: requestData.title });
  try {
    const newRequest = await db.featureRequest.create({
      data: {
        ...requestData,
        upvotes: 0,
      },
    });
    return newRequest as unknown as FeatureRequest;
  } catch (error) {
    logError('[FeatureRequestAction] Error creating request', error, { userId: requestData.userId });
    return null;
  }
}

/**
 * Updates a feature request.
 * @param requestId The ID of the request to update.
 * @param updateData The data to update.
 * @returns The updated FeatureRequest object or null.
 */
export async function updateFeatureRequest(requestId: string, updateData: Partial<Omit<FeatureRequest, 'id'>>): Promise<FeatureRequest | null> {
  logAction('Updating feature request', { requestId });
  try {
    const updatedRequest = await db.featureRequest.update({
      where: { id: requestId },
      data: updateData,
    });
    return updatedRequest as unknown as FeatureRequest;
  } catch (error) {
    logError(`[FeatureRequestAction] Error updating request ${requestId}`, error, { requestId });
    return null;
  }
}

/**
 * Increments the upvote count for a feature request.
 * @param requestId The ID of the request to upvote.
 * @returns The updated FeatureRequest object or null.
 */
export async function upvoteFeatureRequest(requestId: string): Promise<FeatureRequest | null> {
    logAction('Upvoting feature request', { requestId });
    try {
        const updatedRequest = await db.featureRequest.update({
            where: { id: requestId },
            data: {
                upvotes: {
                    increment: 1,
                },
            },
        });
        return updatedRequest as unknown as FeatureRequest;
    } catch (error) {
        logError(`[FeatureRequestAction] Error upvoting request ${requestId}`, error, { requestId });
        return null;
    }
}
