
'use server';

import { db } from '@/lib/db';
import type { MockInterviewSession } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { Prisma } from '@prisma/client';

/**
 * Creates a new mock interview session in the database.
 * @param sessionData The data for the new session.
 * @returns The newly created MockInterviewSession object or null if failed.
 */
export async function createMockInterviewSession(sessionData: Omit<MockInterviewSession, 'id' | 'questions' | 'answers' | 'overallFeedback' | 'overallScore' | 'recordingReferences'>): Promise<MockInterviewSession | null> {
  logAction('Creating mock interview session', { userId: sessionData.userId, topic: sessionData.topic });
  try {
    const { interviewerScores, ...restOfSessionData } = sessionData;
    const newSession = await db.mockInterviewSession.create({
      data: {
        ...restOfSessionData,
        // Ensure Prisma optional fields are handled correctly
        jobDescription: sessionData.jobDescription || null,
        timerPerQuestion: sessionData.timerPerQuestion || null,
        difficulty: sessionData.difficulty || null,
        questionCategories: sessionData.questionCategories || [],
        finalScore: (sessionData.finalScore as any) || Prisma.JsonNull,
      },
    });
    return newSession as unknown as MockInterviewSession;
  } catch (error) {
    logError('[InterviewsAction] Error creating mock interview session', error, { userId: sessionData.userId });
    return null;
  }
}

/**
 * Fetches all mock interview sessions for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of MockInterviewSession objects.
 */
export async function getMockInterviewSessions(userId: string): Promise<MockInterviewSession[]> {
    logAction('Fetching mock interview sessions', { userId });
    try {
        const sessions = await db.mockInterviewSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { answers: true, interviewerScores: true }
        });
        return sessions as unknown as MockInterviewSession[];
    } catch (error) {
        logError(`[InterviewsAction] Error fetching sessions for user ${userId}`, error, { userId });
        return [];
    }
}

/**
 * Updates a mock interview session, e.g., to add questions, feedback or answers.
 * @param sessionId The ID of the session to update.
 * @param updateData The data to update.
 * @returns The updated MockInterviewSession or null.
 */
export async function updateMockInterviewSession(sessionId: string, updateData: Partial<Omit<MockInterviewSession, 'id'>>): Promise<MockInterviewSession | null> {
    logAction('Updating mock interview session', { sessionId });
    try {
        const { interviewerScores, ...restOfUpdateData } = updateData;
        const updatedSession = await db.mockInterviewSession.update({
            where: { id: sessionId },
            data: {
                ...restOfUpdateData,
                // Handle JSON fields if they are updated
                questions: updateData.questions ? (updateData.questions as any) : undefined,
                answers: updateData.answers ? (updateData.answers as any) : undefined,
                overallFeedback: updateData.overallFeedback ? (updateData.overallFeedback as any) : undefined,
                recordingReferences: updateData.recordingReferences ? (updateData.recordingReferences as any) : undefined,
                finalScore: updateData.finalScore ? (updateData.finalScore as any) : undefined,
            },
        });
        return updatedSession as unknown as MockInterviewSession;
    } catch (error) {
        logError(`[InterviewsAction] Error updating session ${sessionId}`, error, { sessionId });
        return null;
    }
}
