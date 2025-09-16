
'use server';

import { db } from '@/lib/db';
import type { LiveInterviewSession, MockInterviewSession } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { sendEmail } from './send-email';
import { EmailTemplateType } from '@prisma/client';
import { getUserByEmail } from '../data-services/users';

/**
 * Creates a new live interview session.
 * @param sessionData The data for the new session.
 * @returns The newly created LiveInterviewSession object or null.
 */
export async function createLiveInterviewSession(sessionData: Omit<LiveInterviewSession, 'id'>): Promise<LiveInterviewSession | null> {
  logAction('Creating live interview session', { title: sessionData.title });
  try {
    const { interviewerScores, finalScore, ...restOfSessionData } = sessionData;
    
    // Live interviews are stored as MockInterviewSession with a specific structure
    const newSession = await db.mockInterviewSession.create({
      data: {
        userId: restOfSessionData.participants.find(p => p.role === 'interviewer')?.userId || 'system',
        tenantId: restOfSessionData.tenantId,
        topic: restOfSessionData.title,
        description: `Live interview session scheduled for ${restOfSessionData.scheduledTime}`,
        status: 'in-progress', // Represents a scheduled live interview
        createdAt: new Date(),
        // Storing live-interview specific data in JSON fields
        liveInterviewData: {
            participants: restOfSessionData.participants,
            scheduledTime: new Date(restOfSessionData.scheduledTime),
        } as any,
        questions: restOfSessionData.preSelectedQuestions ? restOfSessionData.preSelectedQuestions as any : Prisma.JsonNull,
        recordingReferences: Prisma.JsonNull,
        interviewerScores: Prisma.JsonNull,
      },
    });

    // Send invitation email if it's a "Practice with a Friend" session
    const inviter = sessionData.participants.find(p => p.role === 'interviewer');
    const candidate = sessionData.participants.find(p => p.role === 'candidate');

    if (inviter && candidate && sessionData.title.includes('Practice Interview')) {
      const candidateUser = await getUserByEmail(candidate.name); // Email is stored in name field for invites
      const interviewLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/live-interview/${newSession.id}`;
      
      await sendEmail({
        tenantId: sessionData.tenantId,
        recipientEmail: candidate.name, // The email of the friend
        type: EmailTemplateType.PRACTICE_INTERVIEW_INVITE,
        placeholders: {
          userName: candidateUser ? candidateUser.name : candidate.name.split('@')[0],
          inviterName: inviter.name,
          interviewLink: interviewLink,
        },
      });
      logAction('Sent practice interview invitation email', { sessionId: newSession.id, to: candidate.name });
    }

    // Adapt the returned object to match the LiveInterviewSession structure for the client
    const liveSession: LiveInterviewSession = {
        id: newSession.id,
        tenantId: newSession.tenantId,
        title: newSession.topic,
        status: 'Scheduled',
        participants: (newSession.liveInterviewData as any)?.participants || [],
        scheduledTime: (newSession.liveInterviewData as any)?.scheduledTime || newSession.createdAt.toISOString(),
        preSelectedQuestions: (newSession.questions as any) || [],
    };

    return liveSession;
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
        liveInterviewData: {
          path: '$.participants[*].userId',
          array_contains: userId
        }
      },
      orderBy: {
        createdAt: 'desc', 
      },
    });
    
    return sessions.map(s => ({
        id: s.id,
        tenantId: s.tenantId,
        title: s.topic,
        status: s.status === 'completed' ? 'Completed' : (s.liveInterviewData as any)?.scheduledTime && new Date((s.liveInterviewData as any).scheduledTime) < new Date() ? 'In-Progress' : 'Scheduled',
        participants: (s.liveInterviewData as any)?.participants || [],
        scheduledTime: (s.liveInterviewData as any)?.scheduledTime || s.createdAt.toISOString(),
        preSelectedQuestions: (s.questions as any) || [],
        recordingReferences: (s.recordingReferences as any) || [],
        interviewerScores: (s.interviewerScores as any) || [],
        finalScore: (s.finalScore as any),
    })) as LiveInterviewSession[];
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
    if (!session || !session.liveInterviewData) return null;

    return {
        id: session.id,
        tenantId: session.tenantId,
        title: session.topic,
        status: session.status === 'completed' ? 'Completed' : 'In-Progress',
        participants: (session.liveInterviewData as any)?.participants || [],
        scheduledTime: (session.liveInterviewData as any)?.scheduledTime || session.createdAt.toISOString(),
        preSelectedQuestions: (session.questions as any) || [],
        recordingReferences: (session.recordingReferences as any) || [],
        interviewerScores: (session.interviewerScores as any) || [],
        finalScore: (session.finalScore as any),
    } as LiveInterviewSession;

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
        status: updateData.status === 'Completed' ? 'completed' : undefined,
        recordingReferences: updateData.recordingReferences ? updateData.recordingReferences as any : undefined,
        interviewerScores: updateData.interviewerScores ? updateData.interviewerScores as any : undefined,
        finalScore: updateData.finalScore ? updateData.finalScore as any : undefined,
      },
    });
    return await getLiveInterviewSessionById(sessionId);
  } catch (error) {
    logError(`[LiveInterviewAction] Error updating session ${sessionId}`, error, { sessionId });
    return null;
  }
}
