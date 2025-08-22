
'use server';

import { db } from '@/lib/db';
import type { JobApplication, Interview, JobOpening, UserProfile, JobApplicationStatus } from '@/types';
import { Prisma, type PrismaClient } from '@prisma/client';

/**
 * Fetches all job openings from the database.
 * @returns A promise that resolves to an array of JobOpening objects.
 */
export async function getJobOpenings(): Promise<JobOpening[]> {
  try {
    const openings = await db.jobOpening.findMany({
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
 * Adds a new job opening to the database.
 * @param jobData The data for the new job opening.
 * @param currentUser The user who is posting the job.
 * @returns The newly created JobOpening object or null if failed.
 */
export async function addJobOpening(
  jobData: Omit<JobOpening, 'id' | 'datePosted' | 'postedByAlumniId' | 'alumniName' | 'tenantId'>,
  currentUser: Pick<UserProfile, 'id' | 'name' | 'tenantId'>
): Promise<JobOpening | null> {
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
export async function createJobApplication(applicationData: Omit<JobApplication, 'id'>): Promise<JobApplication | null> {
  try {
    const { interviews, ...restOfData } = applicationData;
    const newApplication = await db.jobApplication.create({
      data: {
        ...restOfData,
        notes: applicationData.notes || [],
        interviews: interviews && interviews.length > 0 ? {
          create: interviews.map(i => ({
            date: i.date,
            type: i.type,
            interviewer: i.interviewer,
            interviewerEmail: i.interviewerEmail,
            interviewerMobile: i.interviewerMobile,
            notes: i.notes || [],
          }))
        } : undefined,
      },
      include: {
        interviews: true,
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
export async function updateJobApplication(applicationId: string, updateData: Partial<Omit<JobApplication, 'id'>>): Promise<JobApplication | null> {
    try {
        const { interviews, ...restOfUpdateData } = updateData;
        
        const updatedApp = await db.$transaction(async (prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
            await prisma.jobApplication.update({
                where: { id: applicationId },
                data: {
                    ...restOfUpdateData,
                    notes: restOfUpdateData.notes ? { set: restOfUpdateData.notes } : undefined,
                },
            });

            if (interviews !== undefined) {
                await prisma.interview.deleteMany({
                    where: { jobApplicationId: applicationId },
                });

                if (interviews.length > 0) {
                    await prisma.interview.createMany({
                        data: interviews.map(({ id, ...i }) => ({ // Destructure to exclude id
                            ...i,
                            jobApplicationId: applicationId,
                        })),
                    });
                }
            }

            return prisma.jobApplication.findUnique({
              where: { id: applicationId },
              include: { interviews: true },
            });
        });
        
        return updatedApp as unknown as JobApplication;
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
    await db.$transaction(async (prisma) => {
        await prisma.interview.deleteMany({ where: { jobApplicationId: applicationId }});
        await prisma.jobApplication.delete({ where: { id: applicationId } });
    });
    return true;
  } catch (error) {
    console.error(`[JobAction] Error deleting job application ${applicationId}:`, error);
    return false;
  }
}
