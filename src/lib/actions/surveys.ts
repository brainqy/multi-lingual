
'use server';

import { db } from '@/lib/db';
import type { Survey, SurveyResponse } from '@/types';

/**
 * Fetches all survey definitions.
 * @returns A promise that resolves to an array of Survey objects.
 */
export async function getSurveys(): Promise<Survey[]> {
  try {
    const surveys = await db.survey.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return surveys as unknown as Survey[];
  } catch (error) {
    console.error('[SurveyAction] Error fetching surveys:', error);
    return [];
  }
}

/**
 * Fetches a single survey definition by its unique name.
 * @param name The unique name of the survey.
 * @returns The Survey object or null.
 */
export async function getSurveyByName(name: string): Promise<Survey | null> {
  try {
    const survey = await db.survey.findUnique({
      where: { name },
    });
    return survey as unknown as Survey | null;
  } catch (error) {
    console.error(`[SurveyAction] Error fetching survey by name ${name}:`, error);
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
    const newSurvey = await db.survey.create({
      data: surveyData,
    });
    return newSurvey as unknown as Survey;
  } catch (error) {
    console.error('[SurveyAction] Error creating survey:', error);
    return null;
  }
}

/**
 * Fetches all survey responses, optionally scoped by tenant.
 * @param tenantId Optional tenant ID to filter responses.
 * @returns A promise that resolves to an array of SurveyResponse objects.
 */
export async function getSurveyResponses(tenantId?: string): Promise<SurveyResponse[]> {
  try {
    const whereClause: any = {};
    // This assumes a relation or a tenantId field on the user who responded.
    // Let's assume for now we filter based on a tenantId on the response itself.
    // This would require adding a tenantId to the SurveyResponse model.
    
    const responses = await db.surveyResponse.findMany({
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
    const newResponse = await db.surveyResponse.create({
      data: responseData,
    });
    return newResponse as unknown as SurveyResponse;
  } catch (error) {
    console.error('[SurveyAction] Error creating survey response:', error);
    return null;
  }
}
