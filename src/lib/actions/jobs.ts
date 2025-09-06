
'use server';

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { JobApplication, Interview, JobOpening, UserProfile } from '@/types';
import { headers } from 'next/headers';

/**
 * Fetches all job openings from the database, filtered by the tenant from the request headers.
 * @returns A promise that resolves to an array of JobOpening objects.
 */
export async function getJobOpenings(): Promise<JobOpening[]> {
  try {
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id');

    const whereClause: Prisma.JobOpeningWhereInput = {};
    if (tenantId && tenantId !== 'platform') {
      whereClause.OR = [
        { tenantId: tenantId },
        { tenantId: 'platform' }
      ];
    }

    const openings = await db.jobOpening.findMany({
      where: whereClause,
      orderBy: {
        datePosted: 'desc',
      },
    });
    return openings as unknown as JobOpening[];
  } catch (error) {
    console.error('[JobAction] Error fetching job openings:', error);
    return [];
  }
}

/**
 * Adds a new job opening to the database within the current tenant context.
 * @param jobData The data for the new job opening.
 * @param currentUser The user who is posting the job.
 * @returns The newly created JobOpening object or null if failed.
 */
export async function addJobOpening(
  jobData: Omit<JobOpening, 'id' | 'datePosted' | 'postedByAlumniId' | 'alumniName' | 'tenantId'>,
  currentUser: Pick<UserProfile, 'id' | 'name' | 'tenantId'>
): Promise<JobOpening | null> {
  const headersList = headers();
  const tenantId = headersList.get('X-Tenant-Id') || currentUser.tenantId;

  const newOpeningData = {
    ...jobData,
    datePosted: new Date(),
    postedByAlumniId: currentUser.id,
    alumniName: currentUser.name,
    tenantId: tenantId,
  };

  try {
    const newOpening = await db.jobOpening.create({
      data: newOpeningData,
    });
    return newOpening as unknown as JobOpening;
  } catch (error) {
    console.error('[JobAction] Error creating job opening:', error);
    return null;
  }
}

/**
 * Fetches all job applications for a specific user.
 * @param userId The ID of the user whose applications are to be fetched.
 * @returns A promise that resolves to an array of JobApplication objects.
 */
export async function getUserJobApplications(userId: string): Promise<JobApplication[]> {
  try {
    const applications = await db.jobApplication.findMany({
      where: { userId },
      include: {
        interviews: true, // Include related interviews
      },
      orderBy: {
        dateApplied: 'desc',
      },
    });
    return applications as unknown as JobApplication[];
  } catch (error) {
    console.error(`[JobAction] Error fetching job applications for user ${userId}:`, error);
    return [];
  }
}

/**
 * Creates a new job application.
 * @param applicationData The data for the new job application.
 * @returns The newly created JobApplication object or null if failed.
 */
export async function createJobApplication(applicationData: Omit<JobApplication, 'id' | 'interviews'>): Promise<JobApplication | null> {
  try {
    const newApplication = await db.jobApplication.create({
      data: {
        ...applicationData,
        notes: applicationData.notes || [],
      },
    });
    return newApplication as unknown as JobApplication;
  } catch (error) {
    console.error('[JobAction] Error creating job application:', error);
    return null;
  }
}

/**
 * Updates an existing job application.
 * @param applicationId The ID of the application to update.
 * @param updateData The data to update.
 * @returns The updated JobApplication object or null if failed.
 */
export async function updateJobApplication(applicationId: string, updateData: Partial<Omit<JobApplication, 'id' | 'interviews'>> & { interviews?: Interview[] }): Promise<JobApplication | null> {
    try {
        const { interviews, ...restOfUpdateData } = updateData;

        // Prisma requires a specific structure for updating related records.
        // This example handles updating the main record. A more complex transaction
        // would be needed to create/update/delete interviews simultaneously.
        // For simplicity here, we'll just update the main application data.
        const updatedApplication = await db.jobApplication.update({
            where: { id: applicationId },
            data: {
                ...restOfUpdateData,
                notes: restOfUpdateData.notes || undefined,
            },
            include: {
                interviews: true,
            }
        });

        // Handle interview updates separately if provided
        if (interviews) {
            // This is a simplified approach. A real app might need to handle
            // creation, deletion, and updates of interviews within a transaction.
            await db.interview.deleteMany({ where: { jobApplicationId: applicationId }});
            if (interviews.length > 0) {
                await db.interview.createMany({
                    data: interviews.map(i => ({...i, jobApplicationId: applicationId}))
                });
            }
        }
        
        const finalApplication = await db.jobApplication.findUnique({
            where: { id: applicationId },
            include: { interviews: true },
        });

        return finalApplication as unknown as JobApplication;
    } catch (error) {
        console.error(`[JobAction] Error updating job application ${applicationId}:`, error);
        return null;
    }
}

/**
 * Deletes a job application.
 * @param applicationId The ID of the application to delete.
 * @returns A boolean indicating success.
 */
export async function deleteJobApplication(applicationId: string): Promise<boolean> {
  try {
    // Prisma will cascade delete related interviews if the schema is set up for it.
    await db.jobApplication.delete({
      where: { id: applicationId },
    });
    return true;
  } catch (error) {
    console.error(`[JobAction] Error deleting job application ${applicationId}:`, error);
    return false;
  }
}

    