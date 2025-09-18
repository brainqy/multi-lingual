
'use server';

import { db } from '@/lib/db';
import type { LiveInterviewSession, MockInterviewSession } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { Prisma, EmailTemplateType } from '@prisma/client';
import { headers } from 'next/headers';
import { sendEmail } from './send-email';
import { getUserByEmail } from '../data-services/users';
import { createNotification } from './notifications';

/**
 * Creates a new live interview session.
 * @param sessionData The data for the new session.
 * @returns The newly created LiveInterviewSession object or null.
 */
export async function createLiveInterviewSession(sessionData: Omit<LiveInterviewSession, 'id'>): Promise<LiveInterviewSession | null> {
  logAction('[LI_ACTION_CREATE] 1. Starting createLiveInterviewSession', { title: sessionData.title });
  try {
    const { interviewerScores, finalScore, ...restOfSessionData } = sessionData;
    logAction('[LI_ACTION_CREATE] 2. Destructured session data.');
    
    // Live interviews are stored as MockInterviewSession with a specific structure
    const dataForDb = {
      userId: restOfSessionData.participants.find(p => p.role === 'interviewer')?.userId || 'system',
      tenantId: restOfSessionData.tenantId,
      topic: restOfSessionData.title,
      description: `Live interview session scheduled for ${restOfSessionData.scheduledTime}`,
      status: 'in-progress' as const, // Represents a scheduled live interview
      createdAt: new Date(),
      // Storing live-interview specific data in JSON fields
      liveInterviewData: {
          participants: restOfSessionData.participants,
          scheduledTime: new Date(restOfSessionData.scheduledTime),
      } as any,
      questions: restOfSessionData.preSelectedQuestions ? restOfSessionData.preSelectedQuestions as any : Prisma.JsonNull,
      recordingReferences: Prisma.JsonNull,
      finalScore: Prisma.JsonNull,
    };
    logAction('[LI_ACTION_CREATE] 3. Prepared data for database insertion.', { data: Object.keys(dataForDb) });

    const newSession = await db.mockInterviewSession.create({
      data: dataForDb,
    });
    logAction('[LI_ACTION_CREATE] 4. Successfully created session in DB.', { newSessionId: newSession.id });

    // Send invitation email if it's a "Practice with a Friend" session
    const inviter = sessionData.participants.find(p => p.role === 'interviewer');
    const candidate = sessionData.participants.find(p => p.role === 'candidate');
    logAction('[LI_ACTION_CREATE] 5. Identified inviter and candidate for potential email.', { inviter: inviter?.name, candidate: candidate?.name });

    if (inviter && candidate && sessionData.title.includes('Practice Interview')) {
      logAction('[LI_ACTION_CREATE] 6. Condition for sending email met. Preparing email data.');
      const candidateUser = await getUserByEmail(candidate.name); // Email is stored in name field for invites
      const interviewLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/live-interview/${newSession.id}`;
      logAction('[LI_ACTION_CREATE] 7. Generated interview link.', { interviewLink });
      
      await sendEmail({
        tenantId: sessionData.tenantId,
        recipientEmail: candidate.name, // The email of the friend
        type: 'PRACTICE_INTERVIEW_INVITE',
        placeholders: {
          userName: candidateUser ? candidateUser.name : candidate.name.split('@')[0],
          inviterName: inviter.name,
          interviewLink: interviewLink,
        },
      });
      logAction('[LI_ACTION_CREATE] 8. `sendEmail` action called successfully.', { sessionId: newSession.id, to: candidate.name });
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
    logAction('[LI_ACTION_CREATE] 9. Adapted DB object to LiveInterviewSession type for client.');

    return liveSession;
  } catch (error) {
    logError('[LI_ACTION_CREATE] 10. CATCH BLOCK: Error creating session.', error, { title: sessionData.title });
    return null;
  }
}


/**
 * Fetches all live interview sessions a user is part of.
 * @param userId The ID of the user.
 * @returns A promise resolving to an array of LiveInterviewSession objects.
 */
export async function getLiveInterviewSessions(userId: string): Promise<LiveInterviewSession[]> {
  logAction('[LI_ACTION_GET_ALL] 1. Fetching live interview sessions for user', { userId });
  try {
    // Fetch all sessions that have liveInterviewData, then filter in code.
    const sessions = await db.mockInterviewSession.findMany({
      where: {
        liveInterviewData: {
          not: Prisma.JsonNull,
        }
      },
      orderBy: {
        createdAt: 'desc', 
      },
    });
    logAction('[LI_ACTION_GET_ALL] 2. Fetched all sessions with liveInterviewData from DB.', { count: sessions.length });

    const userSessions = sessions.filter(s => {
        const participants = (s.liveInterviewData as any)?.participants;
        return Array.isArray(participants) && participants.some(p => p.userId === userId);
    });
    logAction('[LI_ACTION_GET_ALL] 3. Filtered sessions for the current user.', { userSessionCount: userSessions.length });
    
    const mappedSessions = userSessions.map(s => ({
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
    logAction('[LI_ACTION_GET_ALL] 4. Mapped DB objects to LiveInterviewSession type.');

    return mappedSessions;
  } catch (error) {
    logError(`[LI_ACTION_GET_ALL] 5. CATCH BLOCK: Error fetching sessions for user ${userId}`, error, { userId });
    return [];
  }
}

/**
 * Fetches a single live interview session by its ID.
 * @param sessionId The ID of the session.
 * @returns The LiveInterviewSession object or null.
 */
export async function getLiveInterviewSessionById(sessionId: string): Promise<LiveInterviewSession | null> {
  logAction('[LI_ACTION_GET_BY_ID] 1. Fetching live interview session by ID', { sessionId });
  try {
    const session = await db.mockInterviewSession.findUnique({
      where: { id: sessionId },
    });
    logAction('[LI_ACTION_GET_BY_ID] 2. Fetched session from DB.', { sessionFound: !!session });

    if (!session || !session.liveInterviewData) {
      logAction('[LI_ACTION_GET_BY_ID] 3. Session not found or is not a live interview session.');
      return null;
    }
    
    const mappedSession = {
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
    logAction('[LI_ACTION_GET_BY_ID] 4. Mapped DB object to LiveInterviewSession type.');

    return mappedSession;

  } catch (error) {
    logError(`[LI_ACTION_GET_BY_ID] 5. CATCH BLOCK: Error fetching session ${sessionId}`, error, { sessionId });
    return null;
  }
}

/**
 * Updates a live interview session.
 * @param sessionId The ID of the session to update.
 * @param updateData The data to update.
 * @param currentUserId The user initiating the update, for notifications.
 * @returns The updated LiveInterviewSession or null.
 */
export async function updateLiveInterviewSession(sessionId: string, updateData: Partial<Omit<LiveInterviewSession, 'id'>>, currentUserId?: string): Promise<LiveInterviewSession | null> {
  logAction('[LI_ACTION_UPDATE] 1. Updating live interview session', { sessionId, updateFields: Object.keys(updateData) });
  try {
    const originalSession = await db.mockInterviewSession.findUnique({ where: { id: sessionId }});
    if (!originalSession || !originalSession.liveInterviewData) return null;

    const originalLiveInterviewData = originalSession.liveInterviewData as any;
    let newLiveInterviewData = { ...originalLiveInterviewData };
    
    if (updateData.scheduledTime) {
        newLiveInterviewData.scheduledTime = new Date(updateData.scheduledTime);
    }
    
    const dataForDb: any = {
      status: updateData.status === 'Completed' ? 'completed' : (updateData.status === 'Cancelled' ? 'cancelled' : 'in-progress'),
      recordingReferences: updateData.recordingReferences ? updateData.recordingReferences as any : undefined,
      interviewerScores: updateData.interviewerScores ? updateData.interviewerScores as any : undefined,
      finalScore: updateData.finalScore ? updateData.finalScore as any : undefined,
      liveInterviewData: newLiveInterviewData,
    };
    
    logAction('[LI_ACTION_UPDATE] 2. Prepared data for DB update.', { dataForDb });

    const updatedSession = await db.mockInterviewSession.update({
      where: { id: sessionId },
      data: dataForDb,
    });
    logAction('[LI_ACTION_UPDATE] 3. DB update successful.', { updatedSessionId: updatedSession.id });
    
    // Send notifications on status change
    if (updateData.status && currentUserId) {
        const currentUser = await db.user.findUnique({where: {id: currentUserId}});
        const participants = originalLiveInterviewData.participants as any[];
        const otherParticipants = participants.filter(p => p.userId !== currentUserId);

        for (const participant of otherParticipants) {
            let content = '';
            if (updateData.status === 'Cancelled') {
                content = `${currentUser?.name} cancelled your session: "${originalSession.topic}"`;
            } else if (updateData.scheduledTime && new Date(originalLiveInterviewData.scheduledTime).toISOString() !== new Date(updateData.scheduledTime).toISOString()) {
                content = `${currentUser?.name} has rescheduled your session: "${originalSession.topic}". Please review.`;
            }
            
            if (content) {
                await createNotification({
                    userId: participant.userId,
                    type: 'event',
                    content: content,
                    link: '/interview-prep',
                    isRead: false,
                });
            }
        }
    }

    const result = await getLiveInterviewSessionById(sessionId);
    logAction('[LI_ACTION_UPDATE] 4. Re-fetched updated session data to return.');
    return result;
  } catch (error) {
    logError(`[LI_ACTION_UPDATE] 5. CATCH BLOCK: Error updating session ${sessionId}`, error, { sessionId });
    return null;
  }
}
