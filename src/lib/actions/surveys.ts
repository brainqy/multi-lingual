
'use server';

import { db } from '@/lib/db';
import type { Survey, SurveyResponse } from '@/types';
import { headers } from 'next/headers';

/**
 * Fetches all survey definitions.
 * @returns A promise that resolves to an array of Survey objects.
 */
export async function getSurveys(): Promise<Survey[]> {
  try {
    const surveys = await db.survey.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // The 'steps' field is a JSON object like { "set": [...] }. We need to extract the array.
    return surveys.map(s => ({
      ...s,
      steps: (s.steps as any)?.set || [],
    })) as unknown as Survey[];
  } catch (error) {
    console.error('[SurveyAction] Error fetching surveys:', error);
    return [];
  }
}

/**
 * Fetches a single survey definition by its unique name and parses its steps.
 * @param name The unique name of the survey.
 * @returns The Survey object or null.
 */
export async function getSurveyByName(name: string): Promise<Survey | null> {
  try {
    const survey = await db.survey.findUnique({
      where: { name },
    });
    if (survey && survey.steps) {
      // The 'steps' field is a JSON object like { "set": [...] }. We need to extract the array.
      return { ...survey, steps: (survey.steps as any)?.set || [] } as unknown as Survey;
    }
    return survey as unknown as Survey | null;
  } catch (error) {
    console.error(`[SurveyAction] Error fetching survey by name ${name}:`, error);
    return null;
  }
}

/**
 * Fetches the next available survey for a user that they haven't completed.
 * @param userId The ID of the user.
 * @returns The Survey object or null if all surveys are completed or none exist.
 */
export async function getSurveyForUser(userId: string): Promise<Survey | null> {
    try {
        const allSurveys = await db.survey.findMany({
            orderBy: { createdAt: 'asc' } // Start with the oldest survey
        });

        const userResponses = await db.surveyResponse.findMany({
            where: { userId },
            select: { surveyId: true }
        });

        const completedSurveyIds = new Set(userResponses.map(res => res.surveyId));

        for (const survey of allSurveys) {
            if (!completedSurveyIds.has(survey.name)) {
                if (survey.steps) {
                    // The 'steps' field is a JSON object like { "set": [...] }. We need to extract the array.
                    return { ...survey, steps: (survey.steps as any)?.set || [] } as unknown as Survey;
                }
                return survey as unknown as Survey; // Return the first survey not completed
            }
        }

        return null; // User has completed all available surveys
    } catch (error) {
        console.error(`[SurveyAction] Error fetching next survey for user ${userId}:`, error);
        return null;
    }
}

/**
 * Creates a new survey definition.
 * @param surveyData The data for the new survey.
 * @returns The newly created Survey object or null.
 */
export async function createSurvey(surveyData: Omit<Survey, 'id' | 'createdAt'>): Promise<Survey | null> {
  try {
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id') || 'platform';

    // Wrap the steps array in the { "set": [...] } object structure to match the seed data.
    const dataForDb: any = {
      ...surveyData,
      steps: { set: surveyData.steps },
      tenantId: tenantId,
    };
    
    const newSurvey = await db.survey.create({
      data: dataForDb,
    });
    // Parse it back on return to be consistent
    return { ...newSurvey, steps: (newSurvey.steps as any)?.set || [] } as unknown as Survey;
  } catch (error) {
    console.error('[SurveyAction] Error creating survey:', error);
    return null;
  }
}


/**
 * Fetches all survey responses, optionally scoped by tenant.
 * @returns A promise that resolves to an array of SurveyResponse objects.
 */
export async function getSurveyResponses(): Promise<SurveyResponse[]> {
  try {
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id');

    const whereClause: any = {};
    if (tenantId && tenantId !== 'platform') {
      whereClause.tenantId = tenantId;
    }
    
    const responses = await db.surveyResponse.findMany({
      where: whereClause,
      orderBy: { responseDate: 'desc' },
    });
    return responses as unknown as SurveyResponse[];
  } catch (error) {
    console.error('[SurveyAction] Error fetching survey responses:', error);
    return [];
  }
}

/**
 * Creates a new survey response.
 * @param responseData The data for the new response.
 * @returns The newly created SurveyResponse object or null.
 */
export async function createSurveyResponse(responseData: Omit<SurveyResponse, 'id' | 'responseDate'>): Promise<SurveyResponse | null> {
  try {
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id') || 'platform';

    const dataForDb: any = {
        ...responseData,
        data: responseData.data as any,
        tenantId: tenantId,
    };
    
    const newResponse = await db.surveyResponse.create({
      data: dataForDb,
    });
    return newResponse as unknown as SurveyResponse;
  } catch (error) {
    console.error('[SurveyAction] Error creating survey response:', error);
    return null;
  }
}
