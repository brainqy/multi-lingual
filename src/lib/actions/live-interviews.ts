
'use server';

import { db } from '@/lib/db';
import type { LiveInterviewSession } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { Prisma } from '@prisma/client';

/**
 * Creates a new live interview session.
 * @param sessionData The data for the new session.
 * @returns The newly created LiveInterviewSession object or null.
 */
export async function createLiveInterviewSession(sessionData: Omit<LiveInterviewSession, 'id'>): Promise<LiveInterviewSession | null> {
  logAction('Creating live interview session', { title: sessionData.title });
  try {
    const { interviewerScores, ...restOfSessionData } = sessionData;
    const newSession = await db.mockInterviewSession.create({
      data: {
        userId: restOfSessionData.participants[0]?.userId, // Assuming the first participant is the owner
        topic: restOfSessionData.title,
        status: 'in-progress',
        createdAt: new Date(restOfSessionData.scheduledTime), // Use createdAt instead of scheduledTime
        // Ensure Prisma optional JSON fields are handled
        questions: restOfSessionData.preSelectedQuestions ? restOfSessionData.preSelectedQuestions as any : Prisma.JsonNull,
        recordingReferences: Prisma.JsonNull,
        finalScore: Prisma.JsonNull,
      },
    });
    // This is a simplified representation. The full LiveInterviewSession type has more fields
    // that are not directly on the MockInterviewSession model.
    return {
      ...newSession,
      ...restOfSessionData,
    } as unknown as LiveInterviewSession;
  } catch (error) {
    logError('[LiveInterviewAction] Error creating session', error, { title: sessionData.title });
    return null;
  }
}

/**
 * Fetches all live interview sessions a user is part of.
 * @param userId The ID of the user.
 * @returns A promise resolving to an array of LiveInterviewSession objects.
 */
export async function getLiveInterviewSessions(userId: string): Promise<LiveInterviewSession[]> {
  logAction('Fetching live interview sessions for user', { userId });
  try {
    const sessions = await db.mockInterviewSession.findMany({
      where: {
        userId: userId,
        // Add a filter to distinguish live sessions if necessary, e.g. a specific tag in topic
      },
      orderBy: {
        createdAt: 'desc', 
      },
    });
    // This requires mapping the MockInterviewSession model to the LiveInterviewSession type
    return sessions.map(s => ({
      ...s,
      title: s.topic,
      scheduledTime: s.createdAt.toISOString(),
      participants: [{ userId: s.userId, name: 'User', role: 'interviewer' }], // Placeholder participants
    })) as unknown as LiveInterviewSession[];
  } catch (error) {
    logError(`[LiveInterviewAction] Error fetching sessions for user ${userId}`, error, { userId });
    return [];
  }
}

/**
 * Fetches a single live interview session by its ID.
 * @param sessionId The ID of the session.
 * @returns The LiveInterviewSession object or null.
 */
export async function getLiveInterviewSessionById(sessionId: string): Promise<LiveInterviewSession | null> {
  logAction('Fetching live interview session by ID', { sessionId });
  try {
    const session = await db.mockInterviewSession.findUnique({
      where: { id: sessionId },
    });
    // This requires mapping
    return session as unknown as LiveInterviewSession;
  } catch (error) {
    logError(`[LiveInterviewAction] Error fetching session ${sessionId}`, error, { sessionId });
    return null;
  }
}

/**
 * Updates a live interview session.
 * @param sessionId The ID of the session to update.
 * @param updateData The data to update.
 * @returns The updated LiveInterviewSession or null.
 */
export async function updateLiveInterviewSession(sessionId: string, updateData: Partial<Omit<LiveInterviewSession, 'id'>>): Promise<LiveInterviewSession | null> {
  logAction('Updating live interview session', { sessionId });
  try {
    const { scheduledTime, interviewerScores, ...restUpdateData } = updateData;
    const updatedSession = await db.mockInterviewSession.update({
      where: { id: sessionId },
      data: {
        topic: restUpdateData.title,
        status: restUpdateData.status,
        createdAt: scheduledTime ? new Date(scheduledTime) : undefined, // Use createdAt for updates
        // Handle JSON fields
        questions: updateData.preSelectedQuestions ? updateData.preSelectedQuestions as any : undefined,
        recordingReferences: updateData.recordingReferences ? updateData.recordingReferences as any : undefined,
        finalScore: updateData.finalScore ? updateData.finalScore as any : undefined,
      },
    });
    return updatedSession as unknown as LiveInterviewSession;
  } catch (error) {
    logError(`[LiveInterviewAction] Error updating session ${sessionId}`, error, { sessionId });
    return null;
  }
}
