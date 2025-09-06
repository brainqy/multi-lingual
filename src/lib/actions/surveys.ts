
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
export async function createSurvey(surveyData: Omit<Survey, 'id' | 'createdAt' | 'tenantId'>): Promise<Survey | null> {
  try {
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id') || 'platform';

    const dataForDb: any = {
      ...surveyData,
      steps: surveyData.steps as any, // Cast steps to any to satisfy Prisma's JsonValue type
      tenantId: tenantId,
    };
    
    const newSurvey = await db.survey.create({
      data: dataForDb,
    });
    return newSurvey as unknown as Survey;
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
export async function createSurveyResponse(responseData: Omit<SurveyResponse, 'id' | 'responseDate' | 'tenantId'>): Promise<SurveyResponse | null> {
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
