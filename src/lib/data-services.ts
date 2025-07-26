
"use client";

import type { JobOpening, UserProfile } from '@/types';
import { db } from '@/lib/db'; // Import db client

const useMockDb = process.env.USE_MOCK_DB === 'true';

// This is a server action file for interacting with the database.
// All functions are marked as server-side and will not run on the client.

/**
 * Fetches all job openings, respecting tenant boundaries.
 * In a multi-tenant app, you'd pass a tenantId here. For simplicity, we show all.
 * @returns A promise that resolves to an array of JobOpening objects.
 */
export async function getJobOpenings(): Promise<JobOpening[]> {
  'use server';
  if (useMockDb) {
    // This part is now just for fallback or specific testing
    return []; 
  }
  
  try {
    const openings = await db.jobOpening.findMany({
      orderBy: {
        datePosted: 'desc',
      },
    });
    return openings as unknown as JobOpening[];
  } catch (error) {
    console.error('[DataService] Error fetching job openings from DB:', error);
    return [];
  }
}

/**
 * Adds a new job opening to the database.
 * @param jobData The data for the new job opening.
 * @param currentUser The user who is posting the job.
 * @returns The newly created JobOpening object or null if failed.
 */
export async function addJobOpening(
  jobData: Omit<JobOpening, 'id' | 'datePosted' | 'postedByAlumniId' | 'alumniName' | 'tenantId'>,
  currentUser: Pick<UserProfile, 'id' | 'name' | 'tenantId'>
): Promise<JobOpening | null> {
  'use server';
  if (useMockDb) {
    return null;
  }

  const newOpeningData = {
    ...jobData,
    datePosted: new Date(),
    postedByAlumniId: currentUser.id,
    alumniName: currentUser.name,
    tenantId: currentUser.tenantId,
  };

  try {
    const newOpening = await db.jobOpening.create({
      data: newOpeningData,
    });
    return newOpening as unknown as JobOpening;
  } catch (error) {
    console.error('[DataService] Error creating job opening in DB:', error);
    return null;
  }
}
