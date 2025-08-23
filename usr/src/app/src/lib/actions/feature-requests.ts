
'use server';

import { db } from '@/lib/db';
import type { FeatureRequest } from '@/types';

/**
 * Fetches all feature requests. Scoped by tenant for managers.
 * @param tenantId Optional tenant ID. If provided, fetches requests for that tenant.
 * @returns A promise that resolves to an array of FeatureRequest objects.
 */
export async function getFeatureRequests(tenantId?: string): Promise<FeatureRequest[]> {
  try {
    const whereClause: any = {};
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    const requests = await db.featureRequest.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
    });
    return requests as unknown as FeatureRequest[];
  } catch (error) {
    console.error('[FeatureRequestAction] Error fetching requests:', error);
    return [];
  }
}

/**
 * Creates a new feature request.
 * @param requestData The data for the new request.
 * @returns The newly created FeatureRequest object or null.
 */
export async function createFeatureRequest(requestData: Omit<FeatureRequest, 'id' | 'timestamp' | 'upvotes'>): Promise<FeatureRequest | null> {
  try {
    const newRequest = await db.featureRequest.create({
      data: {
        ...requestData,
        upvotes: 0,
      },
    });
    return newRequest as unknown as FeatureRequest;
  } catch (error) {
    console.error('[FeatureRequestAction] Error creating request:', error);
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
  try {
    const updatedRequest = await db.featureRequest.update({
      where: { id: requestId },
      data: updateData,
    });
    return updatedRequest as unknown as FeatureRequest;
  } catch (error) {
    console.error(`[FeatureRequestAction] Error updating request ${requestId}:`, error);
    return null;
  }
}

/**
 * Increments the upvote count for a feature request.
 * @param requestId The ID of the request to upvote.
 * @returns The updated FeatureRequest object or null.
 */
export async function upvoteFeatureRequest(requestId: string): Promise<FeatureRequest | null> {
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
        console.error(`[FeatureRequestAction] Error upvoting request ${requestId}:`, error);
        return null;
    }
}
