
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
import type { PracticeSession, LiveInterviewSession } from '@/types';

interface PracticeSessionListProps {
  practiceSessions: (PracticeSession | LiveInterviewSession)[];
  onCancelSession: (sessionId: string) => void;
  onRescheduleSession: (session: LiveInterviewSession) => void;
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

const SessionCard = ({ session, onCancel, onReschedule }: { session: PracticeSession | LiveInterviewSession, onCancel: (id: string) => void, onReschedule: (session: LiveInterviewSession) => void }) => {
  const router = useRouter();
  const sessionDate = parseISO('scheduledTime' in session ? session.scheduledTime : session.date);
  const now = new Date();
  let canJoin = false;
  let joinPath = '';

  const isLiveInterview = 'participants' in session;
  const category = isLiveInterview ? (session.title.includes("Practice Interview") ? "Practice with Friends" : "Live Interview") : session.category;

  const status = 'status' in session ? session.status.toUpperCase() : 'SCHEDULED';
  if (status === 'SCHEDULED' || status === 'IN-PROGRESS') {
    if (category === "Practice with AI") {
        canJoin = session.status !== 'completed';
        const queryParams = new URLSearchParams();
        if ('aiTopicOrRole' in session && session.aiTopicOrRole) queryParams.append('topic', session.aiTopicOrRole);
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
            <SessionDateTime date={'scheduledTime' in session ? session.scheduledTime : session.date} />
          </CardTitle>
          <span className={cn(
            "px-2 py-1 text-xs font-semibold rounded-full",
            status === 'SCHEDULED' || status === 'IN-PROGRESS' ? "bg-green-100 text-green-700" :
            status === 'COMPLETED' ? "bg-blue-100 text-blue-700" :
            "bg-red-100 text-red-700"
          )}>
            {status}
          </span>
        </div>
        <CardDescription className="text-sm">{category}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Badge variant="outline">{session.title}</Badge></div>
         {category === "Practice with AI" && 'aiNumQuestions' in session && (
          <>
            {session.aiNumQuestions && <p className="text-xs">Questions: {session.aiNumQuestions}</p>}
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {canJoin && (
          <Button variant="default" size="sm" onClick={() => router.push(joinPath)} className={cn(category === "Practice with AI" ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700", "text-white")}>
              {category === "Practice with AI" ? <BrainIcon className="mr-1 h-4 w-4"/> : <Video className="mr-1 h-4 w-4"/>}
              {category === "Practice with AI" ? "Start AI Interview" : "Join Interview"}
          </Button>
        )}
        {(status === 'SCHEDULED' || status === 'IN-PROGRESS') && (
          <>
            <Button variant="destructive" size="sm" onClick={() => onCancel(session.id)}>
              <XCircleIcon className="mr-1 h-4 w-4"/>Cancel
            </Button>
            {isLiveInterview && ( 
                 <Button variant="outline" size="sm" onClick={() => onReschedule(session as LiveInterviewSession)}>
                    <Calendar className="mr-1 h-4 w-4"/>Reschedule
                </Button>
            )}
          </>
        )}
        {status === 'COMPLETED' && (
           <Button variant="outline" size="sm"><Eye className="mr-1 h-4 w-4"/>View Report</Button>
        )}
        {status === 'CANCELLED' && (
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
      .filter(s => (s.status === 'SCHEDULED' || s.status === 'in-progress' || s.status === 'In-Progress') && isFuture(parseISO('scheduledTime' in s ? s.scheduledTime : s.date)))
      .sort((a, b) => compareAsc(parseISO('scheduledTime' in a ? a.scheduledTime : a.date), parseISO('scheduledTime' in b ? b.scheduledTime : b.date)));
  }, [practiceSessions]);

  const allUserSessions = useMemo(() => {
    if (!practiceSessions) return [];
    return [...practiceSessions].sort((a, b) => compareAsc(parseISO('scheduledTime' in b ? b.scheduledTime : b.date), parseISO('scheduledTime' in a ? a.scheduledTime : a.date)));
  }, [practiceSessions]);
  
  const cancelledSessions = useMemo(() => {
    if (!practiceSessions) return [];
    return practiceSessions
      .filter(s => s.status === 'CANCELLED' || s.status === 'Cancelled')
      .sort((a, b) => compareAsc(parseISO('scheduledTime' in b ? b.scheduledTime : b.date), parseISO('scheduledTime' in a ? a.scheduledTime : a.date)));
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
