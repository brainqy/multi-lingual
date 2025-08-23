
'use server';

import { db } from '@/lib/db';
import type { MockInterviewSession } from '@/types';

/**
 * Creates a new mock interview session in the database.
 * @param sessionData The data for the new session.
 * @returns The newly created MockInterviewSession object or null if failed.
 */
export async function createMockInterviewSession(sessionData: Omit<MockInterviewSession, 'id' | 'questions' | 'answers' | 'overallFeedback' | 'overallScore' | 'recordingReferences'>): Promise<MockInterviewSession | null> {
  try {
    const newSession = await db.mockInterviewSession.create({
      data: {
        ...sessionData,
        // Ensure Prisma optional fields are handled correctly
        jobDescription: sessionData.jobDescription || null,
        timerPerQuestion: sessionData.timerPerQuestion || null,
        difficulty: sessionData.difficulty || null,
        questionCategories: sessionData.questionCategories || [],
      },
    });
    return newSession as unknown as MockInterviewSession;
  } catch (error) {
    console.error('[InterviewsAction] Error creating mock interview session:', error);
    return null;
  }
}

/**
 * Fetches all mock interview sessions for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of MockInterviewSession objects.
 */
export async function getMockInterviewSessions(userId: string): Promise<MockInterviewSession[]> {
    try {
        const sessions = await db.mockInterviewSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { answers: true } // Include answers if needed
        });
        return sessions as unknown as MockInterviewSession[];
    } catch (error) {
        console.error(`[InterviewsAction] Error fetching sessions for user ${userId}:`, error);
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
    try {
        const updatedSession = await db.mockInterviewSession.update({
            where: { id: sessionId },
            data: {
                ...updateData,
                // Handle JSON fields if they are updated
                questions: updateData.questions ? { set: updateData.questions as any } : undefined,
                answers: updateData.answers ? { set: updateData.answers as any } : undefined,
                overallFeedback: updateData.overallFeedback ? updateData.overallFeedback as any : undefined,
                recordingReferences: updateData.recordingReferences ? { set: updateData.recordingReferences as any } : undefined,
            },
        });
        return updatedSession as unknown as MockInterviewSession;
    } catch (error) {
        console.error(`[InterviewsAction] Error updating session ${sessionId}:`, error);
        return null;
    }
}
