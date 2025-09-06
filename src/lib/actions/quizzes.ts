
'use server';

import { db } from '@/lib/db';
import type { MockInterviewSession } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';

/**
 * Fetches all quizzes created by a specific user or system quizzes.
 * In this schema, quizzes are stored as MockInterviewSession records.
 * @param userId The ID of the user who created the quizzes.
 * @returns A promise that resolves to an array of MockInterviewSession objects.
 */
export async function getCreatedQuizzes(userId: string): Promise<MockInterviewSession[]> {
  logAction('Fetching created quizzes', { userId });
  try {
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id');

    const quizzes = await db.mockInterviewSession.findMany({
      where: {
        // This can be expanded if quizzes need tenant-scoping
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        answers: true,
      },
    });
    // Filter quizzes that are owned by the user or are system-level
    // and those that have questions (are quizzes)
    const userQuizzes = quizzes.filter(q => (q.userId === userId || !q.userId) && q.questions && (q.questions as any[]).length > 0);
    return userQuizzes as unknown as MockInterviewSession[];
  } catch (error) {
    logError(`[QuizzesAction] Error fetching quizzes for user ${userId}`, error, { userId });
    return [];
  }
}

/**
 * Creates or updates a quiz (MockInterviewSession).
 * @param quizId The ID of the quiz to update, or a temporary ID for creation.
 * @param quizData The data for the quiz.
 * @param isNew Whether to create a new quiz.
 * @returns The created/updated MockInterviewSession object or null.
 */
export async function updateQuiz(quizId: string, quizData: Omit<MockInterviewSession, 'id' | 'tenantId'>, isNew: boolean): Promise<MockInterviewSession | null> {
    const headersList = headers();
    const tenantId = headersList.get('X-Tenant-Id') || 'platform';
    logAction(isNew ? 'Creating quiz' : 'Updating quiz', { quizId });
    try {
        const dataForDb = {
            userId: quizData.userId,
            topic: quizData.topic,
            description: quizData.description || null,
            status: quizData.status,
            createdAt: new Date(quizData.createdAt),
            questions: quizData.questions as any,
            answers: quizData.answers as any,
            difficulty: quizData.difficulty || null,
            tenantId: tenantId
        };

        if (isNew) {
            const newQuiz = await db.mockInterviewSession.create({
                data: dataForDb,
            });
            return newQuiz as unknown as MockInterviewSession;
        } else {
            const updatedQuiz = await db.mockInterviewSession.update({
                where: { id: quizId },
                data: dataForDb,
            });
            return updatedQuiz as unknown as MockInterviewSession;
        }
    } catch (error) {
        logError(`[QuizzesAction] Error saving quiz ${quizId}`, error, { isNew });
        return null;
    }
}
