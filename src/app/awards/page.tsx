
"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getActiveAwardsForNomination, createNomination, getNomineesForAward, castVote } from "@/lib/actions/awards";
import { getUsers } from "@/lib/data-services/users";
import type { Award, AwardCategory, UserProfile, Nomination } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award as AwardIcon, UserPlus, Send, Loader2, CalendarDays, ThumbsUp, Crown } from "lucide-react";
import { format, isWithinInterval, parseISO } from 'date-fns';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const nominationSchema = z.object({
  nomineeId: z.string().min(1, "You must select a nominee."),
  justification: z.string().min(20, "Justification must be at least 20 characters.").max(1000, "Justification is too long."),
});
type NominationFormData = z.infer<typeof nominationSchema>;

export default function AwardsPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [groupedAwards, setGroupedAwards] = useState<Record<string, (Award & { category: AwardCategory })[]>>({});
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isNominationDialogOpen, setIsNominationDialogOpen] = useState(false);
  const [awardToNominate, setAwardToNominate] = useState<Award | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isVotingDialogOpen, setIsVotingDialogOpen] = useState(false);
  const [awardToVote, setAwardToVote] = useState<Award | null>(null);
  const [nominees, setNominees] = useState<Nomination[]>([]);

  const { control, handleSubmit, reset } = useForm<NominationFormData>({
    resolver: zodResolver(nominationSchema),
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [awards, users] = await Promise.all([
      getActiveAwardsForNomination(),
      getUsers(),
    ]);
    const grouped = awards.reduce((acc, award) => {
      const categoryName = award.category.name;
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(award);
      return acc;
    }, {} as Record<string, (Award & { category: AwardCategory })[]>);
    setGroupedAwards(grouped);
    setAllUsers(users);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openNominationDialog = (award: Award) => {
    setAwardToNominate(award);
    reset({ nomineeId: '', justification: '' });
    setIsNominationDialogOpen(true);
  };
  
  const openVotingDialog = async (award: Award) => {
    setAwardToVote(award);
    const awardNominees = await getNomineesForAward(award.id);
    setNominees(awardNominees);
    setIsVotingDialogOpen(true);
  };

  const onNominationSubmit = async (data: NominationFormData) => {
    if (!currentUser || !awardToNominate) return;
    setIsSubmitting(true);
    try {
      const result = await createNomination({
        awardId: awardToNominate.id,
        nomineeId: data.nomineeId,
        nominatorId: currentUser.id,
        justification: data.justification,
      });
      if (result) {
        toast({ title: "Nomination Submitted!", description: "Thank you for recognizing a deserving member of our community." });
        setIsNominationDialogOpen(false);
        fetchData(); 
      }
    } catch (error: any) {
      toast({ title: "Nomination Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVote = async (nomineeId: string) => {
    if (!currentUser || !awardToVote) return;
    const result = await castVote({
      awardId: awardToVote.id,
      nomineeId: nomineeId,
      voterId: currentUser.id,
    });
    if (result.success) {
      toast({ title: "Vote Cast!", description: result.message });
      setIsVotingDialogOpen(false);
      fetchData();
    } else {
      toast({ title: "Voting Failed", description: result.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <AwardIcon className="h-8 w-8" /> Awards & Recognition
      </h1>
      <CardDescription>
        Nominate deserving alumni for their outstanding achievements and contributions.
      </CardDescription>

      {Object.keys(groupedAwards).length === 0 ? (
        <Card className="text-center py-16">
          <CardHeader>
            <AwardIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Active Awards</CardTitle>
            <CardDescription>
              There are no awards currently open for nomination or voting. Check back later!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        Object.entries(groupedAwards).map(([categoryName, awards]) => (
          <div key={categoryName}>
            <h2 className="text-2xl font-semibold mb-4 text-primary">{categoryName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {awards.map(award => {
                const now = new Date();
                const isNominating = award.status === 'Nominating' && isWithinInterval(now, { start: parseISO(award.nominationStartDate), end: parseISO(award.nominationEndDate) });
                const isVoting = award.status === 'Voting' && isWithinInterval(now, { start: parseISO(award.votingStartDate), end: parseISO(award.votingEndDate) });
                const isCompleted = award.status === 'Completed' || (award.votingEndDate && isPast(parseISO(award.votingEndDate)));
                
                if (isCompleted && award.winner) {
                  return (
                     <Card key={award.id} className="flex flex-col bg-amber-50 border-amber-300 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700"><Crown className="h-5 w-5"/>{award.title}</CardTitle>
                        <CardDescription>Winner Announced!</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
                        <Avatar className="h-20 w-20 mb-3 border-2 border-amber-500">
                           <AvatarImage src={award.winner.profilePictureUrl} alt={award.winner.name} />
                           <AvatarFallback>{award.winner.name.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <p className="text-lg font-bold text-amber-800">{award.winner.name}</p>
                        <p className="text-sm text-muted-foreground">{award.winner.currentJobTitle}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="link" className="w-full text-amber-700">View Accolades</Button>
                      </CardFooter>
                    </Card>
                  );
                }

                return (
                  <Card key={award.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{award.title}</CardTitle>
                      <CardDescription>{award.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-4 w-4"/> Nomination: {format(parseISO(award.nominationStartDate), 'MMM d')} - {format(parseISO(award.nominationEndDate), 'MMM d')}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-4 w-4"/> Voting: {format(parseISO(award.votingStartDate), 'MMM d')} - {format(parseISO(award.votingEndDate), 'MMM d, yyyy')}</p>
                    </CardContent>
                    <CardFooter>
                      {isNominating && <Button onClick={() => openNominationDialog(award)} className="w-full"><UserPlus className="mr-2 h-4 w-4" /> Submit Nomination</Button>}
                      {isVoting && <Button onClick={() => openVotingDialog(award)} className="w-full bg-primary hover:bg-primary/90"><ThumbsUp className="mr-2 h-4 w-4"/> View Nominees & Vote</Button>}
                      {!isNominating && !isVoting && <Button disabled className="w-full">{isCompleted ? 'Voting Ended' : 'Coming Soon'}</Button>}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}

      <Dialog open={isNominationDialogOpen} onOpenChange={setIsNominationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nominate for: {awardToNominate?.title}</DialogTitle>
            <DialogDescription>Select a user and provide a justification for your nomination.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onNominationSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="nomineeId">Nominee</Label>
              <Controller
                name="nomineeId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a user to nominate..." /></SelectTrigger>
                    <SelectContent>
                      {allUsers.filter(u => u.id !== currentUser?.id).map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="justification">Justification</Label>
              <Controller
                name="justification"
                control={control}
                render={({ field }) => <Textarea id="justification" {...field} rows={5} placeholder="Explain why this person deserves the award..." />}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                <Send className="mr-2 h-4 w-4"/> Submit Nomination
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isVotingDialogOpen} onOpenChange={setIsVotingDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Vote for: {awardToVote?.title}</DialogTitle>
            <DialogDescription>Review the nominees and cast your vote. You can only vote once.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] my-4">
            <div className="space-y-4 pr-4">
              {nominees.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No nominations were submitted for this award.</p>
              ) : (
                nominees.map(nomination => (
                  <Card key={nomination.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={nomination.nominee.profilePictureUrl} />
                          <AvatarFallback>{nomination.nominee.name.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{nomination.nominee.name}</p>
                          <p className="text-xs text-muted-foreground">{nomination.justification.substring(0, 50)}...</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleVote(nomination.nomineeId)}>
                        <ThumbsUp className="mr-2 h-4 w-4"/> Vote
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
