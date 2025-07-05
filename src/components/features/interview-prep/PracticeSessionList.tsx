
"use client";

import type React from 'react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Edit3, XCircle as XCircleIcon, Calendar, Eye, Brain as BrainIcon } from 'lucide-react';
import { format, parseISO, isFuture, isPast, differenceInMinutes, compareAsc } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import type { PracticeSession } from '@/types';

interface PracticeSessionListProps {
  practiceSessions: PracticeSession[];
  onCancelSession: (sessionId: string) => void;
  onRescheduleSession: (sessionId: string) => void;
}

const SessionDateTime = ({ date: isoDateString }: { date: string }) => {
    if (!isoDateString) {
        return <span>Date not set</span>;
    }
    try {
        const sessionDate = parseISO(isoDateString);
        const datePart = format(sessionDate, "MMM dd, yyyy");
        const timePart = format(sessionDate, "p");
        return <span>{`${datePart} - ${timePart}`}</span>;
    } catch (e) {
        console.error("[SessionDateTime] Error formatting date:", isoDateString, e);
        return <span>Invalid Date</span>;
    }
};

const SessionCard = ({ session, onCancel, onReschedule }: { session: PracticeSession, onCancel: (id: string) => void, onReschedule: (id: string) => void }) => {
  const router = useRouter();
  const sessionDate = parseISO(session.date);
  const now = new Date();
  let canJoin = false;
  let joinPath = '';

  if (session.status === 'SCHEDULED') {
    if (session.category === "Practice with AI") {
      canJoin = true; 
      const queryParams = new URLSearchParams();
      if(session.aiTopicOrRole) queryParams.append('topic', session.aiTopicOrRole);
      if(session.aiJobDescription) queryParams.append('jobDescription', session.aiJobDescription);
      if(session.aiNumQuestions) queryParams.append('numQuestions', String(session.aiNumQuestions));
      if(session.aiDifficulty) queryParams.append('difficulty', session.aiDifficulty);
      if(session.aiTimerPerQuestion) queryParams.append('timerPerQuestion', String(session.aiTimerPerQuestion));
      if(session.aiQuestionCategories && session.aiQuestionCategories.length > 0) queryParams.append('categories', session.aiQuestionCategories.join(','));
      queryParams.append('autoFullScreen', 'true'); 
      queryParams.append('sourceSessionId', session.id); 
      joinPath = `/ai-mock-interview?${queryParams.toString()}`;
    } else { 
        const isFutureSession = isFuture(sessionDate);
        const isRecentPast = isPast(sessionDate) && differenceInMinutes(now, sessionDate) <= 60;
        canJoin = isFutureSession || isRecentPast;
        joinPath = `/live-interview/${session.id}`;
    }
  }

  return (
    <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <SessionDateTime date={session.date} />
          </CardTitle>
          <span className={cn(
            "px-2 py-1 text-xs font-semibold rounded-full",
            session.status === 'SCHEDULED' ? "bg-green-100 text-green-700" :
            session.status === 'COMPLETED' ? "bg-blue-100 text-blue-700" :
            "bg-red-100 text-red-700"
          )}>
            {session.status}
          </span>
        </div>
        <CardDescription className="text-sm">{session.category}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-1"><Badge variant="outline">{session.type}</Badge></p>
        {session.category === "Practice with AI" && (
          <>
            {session.aiNumQuestions && <p className="text-xs">Questions: {session.aiNumQuestions}</p>}
            {session.aiDifficulty && <p className="text-xs">Difficulty: {session.aiDifficulty.charAt(0).toUpperCase() + session.aiDifficulty.slice(1)}</p>}
            {session.aiTimerPerQuestion && session.aiTimerPerQuestion > 0 && <p className="text-xs">Timer: {session.aiTimerPerQuestion}s/question</p>}
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {canJoin && (
          <Button variant="default" size="sm" onClick={() => router.push(joinPath)} className={cn(session.category === "Practice with AI" ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700", "text-white")}>
              {session.category === "Practice with AI" ? <BrainIcon className="mr-1 h-4 w-4"/> : <Video className="mr-1 h-4 w-4"/>}
              {session.category === "Practice with AI" ? "Start AI Interview" : "Join Interview"}
          </Button>
        )}
        {session.status === 'SCHEDULED' && (
          <>
            <Button variant="destructive" size="sm" onClick={() => onCancel(session.id)}>
              <XCircleIcon className="mr-1 h-4 w-4"/>Cancel
            </Button>
            {session.category !== "Practice with AI" && ( 
                 <Button variant="outline" size="sm" onClick={() => onReschedule(session.id)}>
                    <Calendar className="mr-1 h-4 w-4"/>Reschedule
                </Button>
            )}
          </>
        )}
        {session.status === 'COMPLETED' && (
           <Button variant="outline" size="sm"><Eye className="mr-1 h-4 w-4"/>View Report</Button>
        )}
        {session.status === 'CANCELLED' && (
           <p className="text-xs text-red-500">This session was cancelled.</p>
        )}
      </CardFooter>
    </Card>
  );
};


export default function PracticeSessionList({ practiceSessions, onCancelSession, onRescheduleSession }: PracticeSessionListProps) {
  const upcomingSessions = useMemo(() => {
    if (!practiceSessions) return [];
    return practiceSessions
      .filter(s => s.status === 'SCHEDULED' && isFuture(parseISO(s.date)))
      .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
  }, [practiceSessions]);

  const allUserSessions = useMemo(() => {
    if (!practiceSessions) return [];
    return [...practiceSessions].sort((a, b) => compareAsc(parseISO(b.date), parseISO(a.date)));
  }, [practiceSessions]);
  
  const cancelledSessions = useMemo(() => {
    if (!practiceSessions) return [];
    return practiceSessions
      .filter(s => s.status === 'CANCELLED')
      .sort((a, b) => compareAsc(parseISO(b.date), parseISO(a.date)));
  }, [practiceSessions]);

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">UPCOMING PRACTICE INTERVIEWS</h2>
        {upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.map(session => <SessionCard key={session.id} session={session} onCancel={onCancelSession} onReschedule={onRescheduleSession} />)}
          </div>
        ) : (
          <Card className="text-center py-10"><CardContent><Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3"/><p className="text-muted-foreground">No upcoming practice sessions scheduled.</p></CardContent></Card>
        )}
      </TabsContent>
      <TabsContent value="all" className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">ALL PRACTICE INTERVIEWS</h2>
        {allUserSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allUserSessions.map(session => <SessionCard key={session.id} session={session} onCancel={onCancelSession} onReschedule={onRescheduleSession} />)}
          </div>
        ) : (
          <Card className="text-center py-10"><CardContent><p className="text-muted-foreground">No practice sessions found.</p></CardContent></Card>
        )}
      </TabsContent>
      <TabsContent value="cancelled" className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">CANCELLED INTERVIEWS</h2>
        {cancelledSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cancelledSessions.map(session => <SessionCard key={session.id} session={session} onCancel={onCancelSession} onReschedule={onRescheduleSession} />)}
          </div>
        ) : (
          <Card className="text-center py-10"><CardContent><XCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3"/><p className="text-muted-foreground">No cancelled interviews found.</p></CardContent></Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
