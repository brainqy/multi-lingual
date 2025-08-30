
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ListChecks, Clock, UserCheck, Search, Loader2 } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { LiveInterviewSession } from "@/types";
import { getLiveInterviewSessions } from "@/lib/actions/live-interviews";
import { useAuth } from "@/hooks/use-auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function InterviewQueuePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LiveInterviewSession['status']>('all');
  const [allSessions, setAllSessions] = useState<LiveInterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const sessions = await getLiveInterviewSessions(user.id);
    setAllSessions(sessions);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  const filteredSessions = useMemo(() => {
    return allSessions.filter(session => {
      const matchesSearch = searchTerm.trim() === '' ||
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allSessions, searchTerm, statusFilter]);

  const getStatusVariant = (status: LiveInterviewSession['status']) => {
    switch(status) {
      case 'Scheduled': return 'secondary';
      case 'In-Progress': return 'default';
      case 'Completed': return 'default';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <ListChecks className="h-8 w-8" /> Interview Queue & Status
      </h1>
      <CardDescription>
        Monitor upcoming, ongoing, and completed live interview sessions.
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Session Overview</CardTitle>
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or participant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In-Progress">In-Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-muted rounded-lg text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No interview sessions match your criteria or none are scheduled yet.
              </p>
            </div>
          ) : (
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map(session => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.title}</TableCell>
                    <TableCell className="text-xs">{session.participants.map(p => p.name).join(', ')}</TableCell>
                    <TableCell className="text-xs">{formatDistanceToNow(parseISO(session.scheduledTime), { addSuffix: true })}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusVariant(session.status)}>{session.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button size="sm" variant="outline" asChild>
                          <Link href={`/live-interview/${session.id}`}>
                            {session.status === 'In-Progress' ? 'Join' : 'View Details'}
                          </Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
