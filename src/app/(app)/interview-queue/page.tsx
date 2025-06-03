
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ListChecks, Clock, UserCheck, Search } from "lucide-react";
import { sampleLiveInterviewSessions } from "@/lib/sample-data"; // Assuming you have this
import { formatDistanceToNow, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function InterviewQueuePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const interviews = sampleLiveInterviewSessions.filter(
    session => 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ); // Example filtering

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <ListChecks className="h-8 w-8" /> Interview Queue & Status
      </h1>
      <CardDescription>
        Monitor upcoming, ongoing, and completed live interview sessions. This feature is under development.
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Session Overview</CardTitle>
           <div className="mt-2">
            <Input
              placeholder="Search by title or participant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-muted rounded-lg text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No interview sessions match your criteria or none are scheduled yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map(session => (
                <Card key={session.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <Badge 
                        variant={
                          session.status === 'Scheduled' ? 'info' :
                          session.status === 'InProgress' ? 'warning' :
                          session.status === 'Completed' ? 'success' :
                          'outline'
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Scheduled: {formatDistanceToNow(parseISO(session.scheduledTime), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1 pb-3">
                    <p className="flex items-center gap-1"><UserCheck className="h-4 w-4 text-muted-foreground"/>Participants: {session.participants.map(p => p.name).join(', ')}</p>
                    {session.interviewTopics && session.interviewTopics.length > 0 && (
                      <p className="text-xs text-muted-foreground">Topics: {session.interviewTopics.join(', ')}</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/live-interview/${session.id}`}> {/* Placeholder link */}
                        View Details
                      </Link>
                    </Button>
                    {session.status === 'Scheduled' && session.meetingLink && (
                        <Button size="sm" variant="default" className="ml-2 bg-primary hover:bg-primary/80" asChild>
                            <Link href={session.meetingLink} target="_blank">Join Now</Link>
                        </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
