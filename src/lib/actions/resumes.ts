
'use server';

import { db } from '@/lib/db';
import type { ResumeProfile, ResumeScanHistoryItem } from '@/types';

/**
 * Fetches all resume profiles for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of ResumeProfile objects.
 */
export async function getResumeProfiles(userId: string): Promise<ResumeProfile[]> {
  try {
    const resumes = await db.resumeProfile.findMany({
      where: { userId },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return resumes as unknown as ResumeProfile[];
  } catch (error) {
    console.error(`[ResumeAction] Error fetching resume profiles for user ${userId}:`, error);
    return [];
  }
}

/**
 * Creates a new resume profile.
 * @param resumeData The data for the new resume profile.
 * @returns The newly created ResumeProfile object or null if failed.
 */
export async function createResumeProfile(resumeData: Omit<ResumeProfile, 'id' | 'createdAt' | 'updatedAt' | 'lastAnalyzed'>): Promise<ResumeProfile | null> {
  try {
    const newResume = await db.resumeProfile.create({
      data: resumeData,
    });
    return newResume as unknown as ResumeProfile;
  } catch (error) {
    console.error('[ResumeAction] Error creating resume profile:', error);
    return null;
  }
}

/**
 * Deletes a resume profile.
 * @param resumeId The ID of the resume to delete.
 * @returns A boolean indicating success.
 */
export async function deleteResumeProfile(resumeId: string): Promise<boolean> {
  try {
    await db.resumeProfile.delete({
      where: { id: resumeId },
    });
    return true;
  } catch (error) {
    console.error(`[ResumeAction] Error deleting resume profile ${resumeId}:`, error);
    return false;
  }
}

/**
 * Fetches all resume scan history for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of ResumeScanHistoryItem objects.
 */
export async function getScanHistory(userId: string): Promise<ResumeScanHistoryItem[]> {
  try {
    const history = await db.resumeScanHistory.findMany({
      where: { userId },
      orderBy: {
        scanDate: 'desc',
      },
    });
    return history as unknown as ResumeScanHistoryItem[];
  } catch (error) {
    console.error(`[ResumeAction] Error fetching scan history for user ${userId}:`, error);
    return [];
  }
}

/**
 * Creates a new resume scan history entry.
 * @param scanData The data for the new scan history entry.
 * @returns The newly created ResumeScanHistoryItem object or null if failed.
 */
export async function createScanHistory(scanData: Omit<ResumeScanHistoryItem, 'id' | 'scanDate'>): Promise<ResumeScanHistoryItem | null> {
  try {
    const newScan = await db.resumeScanHistory.create({
      data: scanData,
    });
    return newScan as unknown as ResumeScanHistoryItem;
  } catch (error) {
    console.error('[ResumeAction] Error creating scan history:', error);
    return null;
  }
}

/**
 * Updates a resume scan history entry (e.g., to bookmark it).
 * @param scanId The ID of the scan to update.
 * @param updateData The data to update.
 * @returns The updated ResumeScanHistoryItem or null if failed.
 */
export async function updateScanHistory(scanId: string, updateData: Partial<Omit<ResumeScanHistoryItem, 'id'>>): Promise<ResumeScanHistoryItem | null> {
    try {
        const updatedScan = await db.resumeScanHistory.update({
            where: { id: scanId },
            data: updateData,
        });
        return updatedScan as unknown as ResumeScanHistoryItem;
    } catch (error) {
        console.error(`[ResumeAction] Error updating scan history ${scanId}:`, error);
        return null;
    }
}


/**
 * Deletes a resume scan history entry.
 * @param scanId The ID of the scan to delete.
 * @returns A boolean indicating success.
 */
export async function deleteScanHistory(scanId: string): Promise<boolean> {
  try {
    await db.resumeScanHistory.delete({
      where: { id: scanId },
    });
    return true;
  } catch (error) {
    console.error(`[ResumeAction] Error deleting scan history ${scanId}:`, error);
    return false;
  }
}
