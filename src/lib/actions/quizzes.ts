
'use server';

import { db } from '@/lib/db';
import type { MockInterviewSession } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { Prisma } from '@prisma/client';

/**
 * Fetches all quizzes created by a specific user.
 * In this schema, quizzes are stored as MockInterviewSession records.
 * @param userId The ID of the user who created the quizzes.
 * @returns A promise that resolves to an array of MockInterviewSession objects.
 */
export async function getCreatedQuizzes(userId: string): Promise<MockInterviewSession[]> {
  logAction('Fetching created quizzes', { userId });
  try {
    const quizzes = await db.mockInterviewSession.findMany({
      where: {
        // You might add another filter here if you have a way to distinguish
        // quizzes from regular mock interview sessions, e.g., a specific tag or status.
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        answers: true,
      },
    });
    // Filter quizzes that are owned by the user or are system-level (no userId)
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
export async function updateQuiz(quizId: string, quizData: Omit<MockInterviewSession, 'id'>, isNew: boolean): Promise<MockInterviewSession | null> {
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
