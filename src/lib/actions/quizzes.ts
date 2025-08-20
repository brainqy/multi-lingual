
'use server';

import { db } from '@/lib/db';
import type { MockInterviewSession } from '@/types';

/**
 * Fetches all quizzes created by a specific user.
 * In this schema, quizzes are stored as MockInterviewSession records.
 * @param userId The ID of the user who created the quizzes.
 * @returns A promise that resolves to an array of MockInterviewSession objects.
 */
export async function getCreatedQuizzes(userId: string): Promise<MockInterviewSession[]> {
  try {
    const quizzes = await db.mockInterviewSession.findMany({
      where: {
        userId: userId,
        // You might add another filter here if you have a way to distinguish
        // quizzes from regular mock interview sessions, e.g., a specific tag or status.
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        // We include answers just in case, though for quiz definitions they are often empty
        answers: true,
      },
    });
    return quizzes as unknown as MockInterviewSession[];
  } catch (error) {
    console.error(`[QuizzesAction] Error fetching quizzes for user ${userId}:`, error);
    return [];
  }
}
