
'use server';

import { db } from '@/lib/db';
import type { InterviewQuestion } from '@/types';
import { Prisma } from '@prisma/client';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches all interview questions from the database.
 * @returns A promise that resolves to an array of InterviewQuestion objects.
 */
export async function getInterviewQuestions(): Promise<InterviewQuestion[]> {
  logAction('Fetching interview questions');
  try {
    const questions = await db.interviewQuestion.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return questions as unknown as InterviewQuestion[];
  } catch (error) {
    logError('[QuestionAction] Error fetching interview questions', error);
    return [];
  }
}

/**
 * Creates a new interview question.
 * @param questionData The data for the new question.
 * @returns The newly created InterviewQuestion object or null if failed.
 */
export async function createInterviewQuestion(questionData: Omit<InterviewQuestion, 'id'>): Promise<InterviewQuestion | null> {
  logAction('Creating interview question', { text: questionData.questionText.substring(0, 50) });
  try {
    const newQuestion = await db.interviewQuestion.create({
      data: {
        ...questionData,
        mcqOptions: questionData.mcqOptions || Prisma.JsonNull,
        userRatings: Prisma.JsonNull,
        userComments: Prisma.JsonNull,
        bookmarkedBy: [],
        tags: questionData.tags || [],
        createdAt: new Date().toISOString(),
      },
    });
    return newQuestion as unknown as InterviewQuestion;
  } catch (error) {
    logError('[QuestionAction] Error creating interview question', error, { questionText: questionData.questionText });
    return null;
  }
}

/**
 * Updates an existing interview question.
 * @param questionId The ID of the question to update.
 * @param updateData The data to update.
 * @returns The updated InterviewQuestion object or null if failed.
 */
export async function updateInterviewQuestion(questionId: string, updateData: Partial<Omit<InterviewQuestion, 'id'>>): Promise<InterviewQuestion | null> {
  logAction('Updating interview question', { questionId });
  try {
    const updatedQuestion = await db.interviewQuestion.update({
      where: { id: questionId },
      data: {
        ...updateData,
        mcqOptions: updateData.mcqOptions ? (updateData.mcqOptions as any) : Prisma.JsonNull,
        userRatings: updateData.userRatings ? (updateData.userRatings as any) : Prisma.JsonNull,
        userComments: updateData.userComments ? (updateData.userComments as any) : Prisma.JsonNull,
        tags: updateData.tags || [],
      },
    });
    return updatedQuestion as unknown as InterviewQuestion;
  } catch (error) {
    logError(`[QuestionAction] Error updating interview question ${questionId}`, error, { questionId });
    return null;
  }
}

/**
 * Deletes an interview question.
 * @param questionId The ID of the question to delete.
 * @returns A boolean indicating success.
 */
export async function deleteInterviewQuestion(questionId: string): Promise<boolean> {
  logAction('Deleting interview question', { questionId });
  try {
    await db.interviewQuestion.delete({
      where: { id: questionId },
    });
    return true;
  } catch (error) {
    logError(`[QuestionAction] Error deleting interview question ${questionId}`, error, { questionId });
    return false;
  }
}

/**
 * Toggles a bookmark on an interview question for a user.
 * @param questionId The ID of the question.
 * @param userId The ID of the user.
 * @returns The updated InterviewQuestion or null on failure.
 */
export async function toggleBookmarkQuestion(questionId: string, userId: string): Promise<InterviewQuestion | null> {
    logAction('Toggling bookmark on question', { questionId, userId });
    try {
        const question = await db.interviewQuestion.findUnique({ where: { id: questionId } });
        if (!question) return null;
        
        const bookmarkedBy = (question.bookmarkedBy as string[]) || [];
        const isBookmarked = bookmarkedBy.includes(userId);
        
        const newBookmarkedBy = isBookmarked
            ? bookmarkedBy.filter(id => id !== userId)
            : [...bookmarkedBy, userId];

        const updatedQuestion = await db.interviewQuestion.update({
            where: { id: questionId },
            data: { bookmarkedBy: newBookmarkedBy },
        });
        return updatedQuestion as unknown as InterviewQuestion;

    } catch (error) {
        logError(`[QuestionAction] Error toggling bookmark for question ${questionId}`, error, { questionId, userId });
        return null;
    }
}
