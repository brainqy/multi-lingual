
'use server';

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { JobApplication, Interview, JobOpening, UserProfile } from '@/types';
import { headers } from 'next/headers';

const log = (message: string, ...args: any[]) => console.log(`[JobsAction] ${message}`, ...args);
const logError = (message: string, ...args: any[]) => console.error(`[JobsAction] ${message}`, ...args);

/**
 * Fetches all job openings from the database, filtered by the tenant from the request headers.
 * @returns A promise that resolves to an array of JobOpening objects.
 */
export async function getJobOpenings(): Promise<JobOpening[]> {
  log("getJobOpenings called.");
  try {
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id');
    log("getJobOpenings: resolved tenantId from headers:", tenantId);

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
    log("getJobOpenings successful.", { count: openings.length });
    return openings as unknown as JobOpening[];
  } catch (error) {
    logError("Error in getJobOpenings:", error);
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
  jobData: Omit<JobOpening, 'id' | 'datePosted' | 'postedByAlumniId' | 'alumniName'>,
  currentUser: Pick<UserProfile, 'id' | 'name' | 'tenantId'>
): Promise<JobOpening | null> {
  log("addJobOpening called.", { jobTitle: jobData.title, currentUser: currentUser.id });
  const headersList = headers();
  const tenantId = headersList.get('X-Tenant-Id') || currentUser.tenantId;
  log("addJobOpening: resolved tenantId:", tenantId);

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
    log("addJobOpening successful.", { newOpeningId: newOpening.id });
    return newOpening as unknown as JobOpening;
  } catch (error) {
    logError("Error in addJobOpening:", error, { jobData });
    return null;
  }
}

/**
 * Fetches all job applications for a specific user.
 * @param userId The ID of the user whose applications are to be fetched.
 * @returns A promise that resolves to an array of JobApplication objects.
 */
export async function getUserJobApplications(userId: string): Promise<JobApplication[]> {
  log("getUserJobApplications called.", { userId });
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
    log("getUserJobApplications successful.", { userId, count: applications.length });
    return applications as unknown as JobApplication[];
  } catch (error) {
    logError(`Error in getUserJobApplications for user ${userId}:`, error);
    return [];
  }
}

/**
 * Creates a new job application, including any associated interviews.
 * @param applicationData The data for the new job application.
 * @returns The newly created JobApplication object or null if failed.
 */
export async function createJobApplication(applicationData: Omit<JobApplication, 'id' | 'tenantId'>): Promise<JobApplication | null> {
  log("createJobApplication called.", { userId: applicationData.userId, jobTitle: applicationData.jobTitle });
  try {
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id') || 'platform';
    log("createJobApplication: resolved tenantId:", tenantId);
    const { interviews, ...restOfData } = applicationData;

    const newApplication = await db.jobApplication.create({
      data: {
        ...restOfData,
        tenantId,
        notes: applicationData.notes || [],
        interviews: interviews && interviews.length > 0 ? {
          create: interviews.map(i => ({
            date: new Date(i.date),
            type: i.type,
            interviewer: i.interviewer,
            notes: i.notes,
          }))
        } : undefined,
      },
      include: {
        interviews: true,
      },
    });
    log("createJobApplication successful.", { newApplicationId: newApplication.id });
    return newApplication as unknown as JobApplication;
  } catch (error) {
    logError("Error in createJobApplication:", error, { applicationData });
    return null;
  }
}

/**
 * Updates an existing job application, including its interviews.
 * @param applicationId The ID of the application to update.
 * @param updateData The data to update.
 * @returns The updated JobApplication object or null if failed.
 */
export async function updateJobApplication(applicationId: string, updateData: Partial<Omit<JobApplication, 'id'>>): Promise<JobApplication | null> {
    log("updateJobApplication called.", { applicationId, updateData });
    try {
        const { interviews, ...restOfUpdateData } = updateData;

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
        log("updateJobApplication: updated main application data.", { applicationId });
        
        if (interviews) {
            log("updateJobApplication: handling interview updates.", { applicationId, newInterviewCount: interviews.length });
            // This is a simplified approach. A real app might need to handle
            // creation, deletion, and updates of interviews within a transaction.
            await db.interview.deleteMany({ where: { jobApplicationId: applicationId }});
            log("updateJobApplication: deleted old interviews.", { applicationId });
            if (interviews.length > 0) {
                await db.interview.createMany({
                    data: interviews.map(i => ({
                        date: new Date(i.date),
                        type: i.type,
                        interviewer: i.interviewer,
                        notes: i.notes,
                        jobApplicationId: applicationId
                    }))
                });
                log("updateJobApplication: created new interviews.", { applicationId, count: interviews.length });
            }
        }
        
        const finalApplication = await db.jobApplication.findUnique({
            where: { id: applicationId },
            include: { interviews: true },
        });
        
        log("updateJobApplication successful.", { finalApplication });
        return finalApplication as unknown as JobApplication;
    } catch (error) {
        logError(`Error in updateJobApplication for application ${applicationId}:`, error);
        return null;
    }
}

/**
 * Deletes a job application.
 * @param applicationId The ID of the application to delete.
 * @returns A boolean indicating success.
 */
export async function deleteJobApplication(applicationId: string): Promise<boolean> {
  log("deleteJobApplication called.", { applicationId });
  try {
    await db.jobApplication.delete({
      where: { id: applicationId },
    });
    log("deleteJobApplication successful.", { applicationId });
    return true;
  } catch (error) {
    logError(`Error in deleteJobApplication for application ${applicationId}:`, error);
    return false;
  }
}
