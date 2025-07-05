
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Edit3, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import type { MockInterviewSession, UserProfile } from '@/types';

interface CreatedQuizzesListProps {
  createdQuizzes: MockInterviewSession[];
  currentUser: UserProfile;
}

export default function CreatedQuizzesList({ createdQuizzes, currentUser }: CreatedQuizzesListProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 6;

  const paginatedQuizzes = useMemo(() => {
    const userQuizzes = createdQuizzes.filter(q => q.userId === 'system' || q.userId === currentUser.id);
    const startIndex = (currentPage - 1) * quizzesPerPage;
    return userQuizzes.slice(startIndex, startIndex + quizzesPerPage);
  }, [createdQuizzes, currentPage, currentUser.id]);

  const totalQuizPages = useMemo(() => {
    const userQuizzes = createdQuizzes.filter(q => q.userId === 'system' || q.userId === currentUser.id);
    return Math.ceil(userQuizzes.length / quizzesPerPage);
  }, [createdQuizzes, currentUser.id]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/>Created Quizzes</CardTitle>
          <CardDescription>Manage your custom quizzes or start one.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {paginatedQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedQuizzes.map(quiz => (
              <Card key={quiz.id} className="bg-secondary/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{quiz.topic}</CardTitle>
                  <CardDescription className="text-xs truncate">{quiz.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground pb-3">
                  <p>Questions: {quiz.questions.length}</p>
                  <p>Difficulty: {quiz.difficulty || 'N/A'}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button size="sm" variant="default" onClick={() => router.push(`/interview-prep/quiz?quizId=${quiz.id}`)}>
                      <Play className="mr-1 h-4 w-4"/>Start Quiz
                  </Button>
                  {(quiz.userId === currentUser.id || currentUser.role === 'admin') && (
                    <Button size="sm" variant="outline" onClick={() => router.push(`/interview-prep/quiz/edit?quizId=${quiz.id}`)}>
                      <Edit3 className="mr-1 h-4 w-4"/>Edit
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No quizzes created yet. Create one from the Question Bank below!</p>
        )}
      </CardContent>
      {totalQuizPages > 1 && (
        <CardFooter className="border-t pt-4 flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalQuizPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalQuizPages, p + 1))}
            disabled={currentPage === totalQuizPages}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
