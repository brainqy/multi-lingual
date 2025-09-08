
'use server';

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { JobApplication, Interview, JobOpening, UserProfile } from '@/types';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches all job openings from the database, filtered by the tenant of the current user.
 * @returns A promise that resolves to an array of JobOpening objects.
 */
export async function getJobOpenings(currentUserId: string): Promise<JobOpening[]> {
  try {
    const user = await db.user.findUnique({ where: { id: currentUserId }});
    if (!user) return [];
    const tenantId = user.tenantId;

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
    console.error("Error in getJobOpenings:", error);
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
  const tenantId = currentUser.tenantId;

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
    console.error("Error in addJobOpening:", error, { jobData });
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
        interviews: true,
      },
      orderBy: {
        dateApplied: 'desc',
      },
    });
    return applications as unknown as JobApplication[];
  } catch (error) {
    console.error(`Error in getUserJobApplications for user ${userId}:`, error);
    return [];
  }
}

/**
 * Creates a new job application, including any associated interviews.
 * @param applicationData The data for the new job application.
 * @returns The newly created JobApplication object or null if failed.
 */
export async function createJobApplication(applicationData: Omit<JobApplication, 'id'>): Promise<JobApplication | null> {
  try {
    const { interviews, ...restOfData } = applicationData;

    const newApplication = await db.jobApplication.create({
      data: {
        ...restOfData,
        dateApplied: new Date(restOfData.dateApplied), 
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
    return newApplication as unknown as JobApplication;
  } catch (error) {
    logError('[JobsAction][createJobApplication] failed.', error, { applicationData });
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
    try {
        const { interviews, ...restOfUpdateData } = updateData;

        const updatedApplication = await db.$transaction(async (prisma) => {
            const appUpdate = await prisma.jobApplication.update({
                where: { id: applicationId },
                data: {
                    ...restOfUpdateData,
                    dateApplied: restOfUpdateData.dateApplied ? new Date(restOfUpdateData.dateApplied) : undefined,
                    notes: restOfUpdateData.notes || undefined,
                },
                include: { interviews: true }
            });
            
            if (interviews) {
                const existingInterviewIds = new Set(appUpdate.interviews.map(i => i.id));
                const incomingInterviewIds = new Set(interviews.filter(i => !i.id.startsWith('int-')).map(i => i.id));

                const interviewsToDelete = Array.from(existingInterviewIds).filter(id => !incomingInterviewIds.has(id));
                if (interviewsToDelete.length > 0) {
                    await prisma.interview.deleteMany({
                        where: { id: { in: interviewsToDelete } },
                    });
                }

                for (const interview of interviews) {
                    const interviewData = {
                        date: new Date(interview.date),
                        type: interview.type,
                        interviewer: interview.interviewer,
                        notes: interview.notes,
                        jobApplicationId: applicationId,
                    };
                    if (interview.id.startsWith('int-')) { 
                        await prisma.interview.create({ data: interviewData });
                    } else { 
                        await prisma.interview.update({
                            where: { id: interview.id },
                            data: interviewData
                        });
                    }
                }
            }
            
            return await prisma.jobApplication.findUnique({
                where: { id: applicationId },
                include: { interviews: true },
            });
        });
        
        return updatedApplication as unknown as JobApplication;
    } catch (error) {
        logError(`[JobsAction][updateJobApplication] for application ${applicationId} failed.`, error);
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
    // Delete related interviews first
    await db.interview.deleteMany({
      where: { jobApplicationId: applicationId },
    });
    // Then delete the application
    await db.jobApplication.delete({
      where: { id: applicationId },
    });
    return true;
  } catch (error) {
    logError(`[JobsAction][deleteJobApplication] for application ${applicationId} failed.`, error);
    return false;
  }
}
