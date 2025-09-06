
'use server';

import { db } from '@/lib/db';
import type { ResumeProfile, ResumeScanHistoryItem } from '@/types';
import { checkAndAwardBadges } from './gamification';
import { logAction, logError } from '@/lib/logger';
import { headers } from 'next/headers';

/**
 * Fetches all resume profiles for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of ResumeProfile objects.
 */
export async function getResumeProfiles(userId: string): Promise<ResumeProfile[]> {
  logAction('Fetching resume profiles', { userId });
  try {
    const resumes = await db.resumeProfile.findMany({
      where: { userId },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return resumes as unknown as ResumeProfile[];
  } catch (error) {
    logError(`[ResumeAction] Error fetching resume profiles for user ${userId}`, error, { userId });
    return [];
  }
}

/**
 * Creates a new resume profile.
 * @param resumeData The data for the new resume profile.
 * @returns The newly created ResumeProfile object or null if failed.
 */
export async function createResumeProfile(resumeData: Omit<ResumeProfile, 'id' | 'createdAt' | 'updatedAt' | 'lastAnalyzed'>): Promise<ResumeProfile | null> {
  const headersList = headers();
  const tenantId = headersList.get('X-Tenant-Id') || 'platform';
  logAction('Creating resume profile', { userId: resumeData.userId, name: resumeData.name });
  try {
    const newResume = await db.resumeProfile.create({
      data: {
        ...resumeData,
        tenantId,
      },
    });
    return newResume as unknown as ResumeProfile;
  } catch (error) {
    logError('[ResumeAction] Error creating resume profile', error, { userId: resumeData.userId });
    return null;
  }
}

/**
 * Updates an existing resume profile.
 * @param resumeId The ID of the resume to update.
 * @param resumeData The data to update.
 * @returns The updated ResumeProfile object or null if failed.
 */
export async function updateResumeProfile(resumeId: string, resumeData: Partial<Omit<ResumeProfile, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ResumeProfile | null> {
    logAction('Updating resume profile', { resumeId });
    try {
        const updatedResume = await db.resumeProfile.update({
            where: { id: resumeId },
            data: resumeData,
        });
        return updatedResume as unknown as ResumeProfile;
    } catch (error) {
        logError(`[ResumeAction] Error updating resume profile ${resumeId}`, error, { resumeId });
        return null;
    }
}


/**
 * Deletes a resume profile.
 * @param resumeId The ID of the resume to delete.
 * @returns A boolean indicating success.
 */
export async function deleteResumeProfile(resumeId: string): Promise<boolean> {
  logAction('Deleting resume profile', { resumeId });
  try {
    await db.resumeProfile.delete({
      where: { id: resumeId },
    });
    return true;
  } catch (error) {
    logError(`[ResumeAction] Error deleting resume profile ${resumeId}`, error, { resumeId });
    return false;
  }
}

/**
 * Fetches all resume scan history for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of ResumeScanHistoryItem objects.
 */
export async function getScanHistory(userId: string): Promise<ResumeScanHistoryItem[]> {
  logAction('Fetching scan history', { userId });
  try {
    const history = await db.resumeScanHistory.findMany({
      where: { userId },
      orderBy: {
        scanDate: 'desc',
      },
    });
    return history as unknown as ResumeScanHistoryItem[];
  } catch (error) {
    logError(`[ResumeAction] Error fetching scan history for user ${userId}`, error, { userId });
    return [];
  }
}

/**
 * Creates a new resume scan history entry.
 * @param scanData The data for the new scan history entry.
 * @returns The newly created ResumeScanHistoryItem object or null if failed.
 */
export async function createScanHistory(scanData: Omit<ResumeScanHistoryItem, 'id' | 'scanDate'>): Promise<ResumeScanHistoryItem | null> {
  const headersList = headers();
  const tenantId = headersList.get('X-Tenant-Id') || 'platform';
  logAction('Creating scan history entry', { userId: scanData.userId, jobTitle: scanData.jobTitle });
  try {
    const newScan = await db.resumeScanHistory.create({
      data: {
        ...scanData,
        tenantId,
      },
    });
    
    // Award badges after action
    await checkAndAwardBadges(scanData.userId);
    
    return newScan as unknown as ResumeScanHistoryItem;
  } catch (error) {
    logError('[ResumeAction] Error creating scan history', error, { userId: scanData.userId });
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
    logAction('Updating scan history', { scanId });
    try {
        const updatedScan = await db.resumeScanHistory.update({
            where: { id: scanId },
            data: updateData,
        });
        return updatedScan as unknown as ResumeScanHistoryItem;
    } catch (error) {
        logError(`[ResumeAction] Error updating scan history ${scanId}`, error, { scanId });
        return null;
    }
}


/**
 * Deletes a resume scan history entry.
 * @param scanId The ID of the scan to delete.
 * @returns A boolean indicating success.
 */
export async function deleteScanHistory(scanId: string): Promise<boolean> {
  logAction('Deleting scan history', { scanId });
  try {
    await db.resumeScanHistory.delete({
      where: { id: scanId },
    });
    return true;
  } catch (error) {
    logError(`[ResumeAction] Error deleting scan history ${scanId}`, error, { scanId });
    return false;
  }
}
