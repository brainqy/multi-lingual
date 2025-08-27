
"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getActiveAwardsForNomination, createNomination } from "@/lib/actions/awards";
import { getUsers } from "@/lib/data-services/users";
import type { Award, AwardCategory, UserProfile } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award as AwardIcon, UserPlus, Send, Loader2, CalendarDays, ThumbsUp } from "lucide-react";
import { format, isWithinInterval, parseISO } from 'date-fns';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
  const [searchTerm, setSearchTerm] = useState("");

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
        fetchData(); // Refresh data to show new nomination
      }
    } catch (error: any) {
      toast({ title: "Nomination Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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
              There are no awards currently open for nomination. Check back later!
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
                const alreadyNominated = award.nominations?.some(n => n.nominatorId === currentUser?.id && n.nomineeId === currentUser?.id);
                return (
                  <Card key={award.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{award.title}</CardTitle>
                      <CardDescription>{award.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-4 w-4"/> Nomination Period: {format(parseISO(award.nominationStartDate), 'MMM d')} - {format(parseISO(award.nominationEndDate), 'MMM d, yyyy')}</p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => openNominationDialog(award)} disabled={!isNominating} className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" /> {isNominating ? 'Submit Nomination' : 'Nominations Closed'}
                      </Button>
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
    </div>
  );
}
