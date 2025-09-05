
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
    const newSession = await db.mockInterviewSession.create({
      data: {
        ...sessionData,
        scheduledTime: new Date(sessionData.scheduledTime),
        // Ensure Prisma optional JSON fields are handled
        participants: sessionData.participants as any,
        preSelectedQuestions: sessionData.preSelectedQuestions ? sessionData.preSelectedQuestions as any : Prisma.JsonNull,
        recordingReferences: [],
        interviewerScores: [],
        finalScore: Prisma.JsonNull,
      },
    });
    return newSession as unknown as LiveInterviewSession;
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
        participants: {
          path: '$[*].userId',
          array_contains: userId,
        },
      },
      orderBy: {
        scheduledTime: 'desc',
      },
    });
    return sessions as unknown as LiveInterviewSession[];
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
    const updatedSession = await db.mockInterviewSession.update({
      where: { id: sessionId },
      data: {
        ...updateData,
        scheduledTime: updateData.scheduledTime ? new Date(updateData.scheduledTime) : undefined,
        // Handle JSON fields
        participants: updateData.participants ? updateData.participants as any : undefined,
        preSelectedQuestions: updateData.preSelectedQuestions ? updateData.preSelectedQuestions as any : undefined,
        recordingReferences: updateData.recordingReferences ? updateData.recordingReferences as any : undefined,
        interviewerScores: updateData.interviewerScores ? updateData.interviewerScores as any : undefined,
        finalScore: updateData.finalScore ? updateData.finalScore as any : undefined,
      },
    });
    return updatedSession as unknown as LiveInterviewSession;
  } catch (error) {
    logError(`[LiveInterviewAction] Error updating session ${sessionId}`, error, { sessionId });
    return null;
  }
}
