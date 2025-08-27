
"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit3, Trash2, Award as AwardIcon, Loader2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Award, AwardCategory } from "@/types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DatePicker } from "@/components/ui/date-picker";
import { getAwardCategories, createAwardCategory, updateAwardCategory, deleteAwardCategory, getAwards, createAward, updateAward, deleteAward, tallyVotesAndDeclareWinner } from "@/lib/actions/awards";
import { useAuth } from "@/hooks/use-auth";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { Badge } from "@/components/ui/badge";
import { isPast, parseISO } from 'date-fns';

const awardCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().optional(),
});

const awardSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(10, "Description is required."),
  categoryId: z.string().min(1, "Category is required."),
  nominationStartDate: z.date(),
  nominationEndDate: z.date(),
  votingStartDate: z.date(),
  votingEndDate: z.date(),
  status: z.enum(['Draft', 'Nominating', 'Voting', 'Completed']),
});

type AwardCategoryFormData = z.infer<typeof awardCategorySchema>;
type AwardFormData = z.infer<typeof awardSchema>;

export default function AwardsManagementPage() {
  const { user: currentUser } = useAuth();
  const [categories, setCategories] = useState<AwardCategory[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AwardCategory | null>(null);
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const { toast } = useToast();

  const { control: categoryControl, handleSubmit: handleCategorySubmit, reset: resetCategoryForm } = useForm<AwardCategoryFormData>({
    resolver: zodResolver(awardCategorySchema),
  });
  const { control: awardControl, handleSubmit: handleAwardSubmit, reset: resetAwardForm } = useForm<AwardFormData>({
    resolver: zodResolver(awardSchema),
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [fetchedCategories, fetchedAwards] = await Promise.all([getAwardCategories(), getAwards()]);
    setCategories(fetchedCategories);
    setAwards(fetchedAwards);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!currentUser || currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  // Category Handlers
  const openNewCategoryDialog = () => { setEditingCategory(null); resetCategoryForm({ name: '', description: '' }); setIsCategoryDialogOpen(true); };
  const openEditCategoryDialog = (cat: AwardCategory) => { setEditingCategory(cat); resetCategoryForm(cat); setIsCategoryDialogOpen(true); };
  const onDeleteCategory = async (id: string) => { if (await deleteAwardCategory(id)) { fetchData(); toast({ title: "Category Deleted" }); } };
  const onCategorySubmit = async (data: AwardCategoryFormData) => {
    const result = editingCategory ? await updateAwardCategory(editingCategory.id, data) : await createAwardCategory(data);
    if (result) { fetchData(); toast({ title: editingCategory ? "Category Updated" : "Category Created" }); }
    setIsCategoryDialogOpen(false);
  };

  // Award Handlers
  const openNewAwardDialog = () => { setEditingAward(null); resetAwardForm({ status: 'Draft' }); setIsAwardDialogOpen(true); };
  const openEditAwardDialog = (award: Award) => {
    setEditingAward(award);
    resetAwardForm({
      ...award,
      nominationStartDate: new Date(award.nominationStartDate),
      nominationEndDate: new Date(award.nominationEndDate),
      votingStartDate: new Date(award.votingStartDate),
      votingEndDate: new Date(award.votingEndDate),
    });
    setIsAwardDialogOpen(true);
  };
  const onDeleteAward = async (id: string) => { if (await deleteAward(id)) { fetchData(); toast({ title: "Award Deleted" }); }};
  const onAwardSubmit = async (data: AwardFormData) => {
    const result = editingAward ? await updateAward(editingAward.id, data) : await createAward(data);
    if (result) { fetchData(); toast({ title: editingAward ? "Award Updated" : "Award Created" }); }
    setIsAwardDialogOpen(false);
  };
  
  const handleTallyVotes = async (awardId: string) => {
    const result = await tallyVotesAndDeclareWinner(awardId);
    if (result.success && result.award) {
        toast({ title: "Winner Declared!", description: `${result.award.winner?.name} has won the "${result.award.title}" award.` });
        fetchData(); // Refresh data to show winner
    } else {
        toast({ title: "Tally Failed", description: result.error || "Could not determine a winner.", variant: "destructive"});
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <AwardIcon className="h-8 w-8" /> Awards Management
      </h1>
      <CardDescription>Create and manage award categories and specific awards for nominations and voting.</CardDescription>

      {/* Award Categories Section */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Award Categories</CardTitle>
            <CardDescription>Groups for different types of awards.</CardDescription>
          </div>
          <Button onClick={openNewCategoryDialog}><PlusCircle className="mr-2 h-4 w-4"/> Add Category</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="animate-spin" /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {categories.map(cat => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>{cat.description}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditCategoryDialog(cat)}><Edit3 className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => onDeleteCategory(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Awards Section */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Awards</CardTitle>
              <CardDescription>Specific awards that users can be nominated for.</CardDescription>
            </div>
            <Button onClick={openNewAwardDialog} disabled={categories.length === 0}><PlusCircle className="mr-2 h-4 w-4"/> Add Award</Button>
        </CardHeader>
        <CardContent>
        {isLoading ? <Loader2 className="animate-spin" /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Winner</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {awards.map(award => {
                  const votingEnded = award.votingEndDate ? isPast(new Date(award.votingEndDate)) : false;
                  return (
                    <TableRow key={award.id}>
                      <TableCell className="font-medium">{award.title}</TableCell>
                      <TableCell>{categories.find(c => c.id === award.categoryId)?.name || 'N/A'}</TableCell>
                      <TableCell><Badge>{award.status}</Badge></TableCell>
                      <TableCell>{award.winner ? award.winner.name : 'N/A'}</TableCell>
                      <TableCell className="text-right space-x-2">
                         {votingEnded && !award.winnerId && award.status === 'Completed' && (
                            <Button variant="outline" size="sm" onClick={() => handleTallyVotes(award.id)}>
                                <Crown className="h-4 w-4 mr-1"/> Tally Votes
                            </Button>
                         )}
                         <Button variant="outline" size="sm" onClick={() => openEditAwardDialog(award)}><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => onDeleteAward(award.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? "Edit" : "Create"} Award Category</DialogTitle></DialogHeader>
          <form onSubmit={handleCategorySubmit(onCategorySubmit)} className="space-y-4 py-4">
            <div><Label>Name</Label><Controller name="name" control={categoryControl} render={({ field }) => <Input {...field} />} /></div>
            <div><Label>Description</Label><Controller name="description" control={categoryControl} render={({ field }) => <Textarea {...field} />} /></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Award Dialog */}
      <Dialog open={isAwardDialogOpen} onOpenChange={setIsAwardDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingAward ? "Edit" : "Create"} Award</DialogTitle></DialogHeader>
          <form onSubmit={handleAwardSubmit(onAwardSubmit)} className="space-y-4 py-4">
            <div><Label>Title</Label><Controller name="title" control={awardControl} render={({ field }) => <Input {...field} />} /></div>
            <div><Label>Description</Label><Controller name="description" control={awardControl} render={({ field }) => <Textarea {...field} />} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Controller name="categoryId" control={awardControl} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>)} /></div>
              <div><Label>Status</Label><Controller name="status" control={awardControl} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent>{['Draft', 'Nominating', 'Voting', 'Completed'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nomination Start Date</Label><Controller name="nominationStartDate" control={awardControl} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} /></div>
              <div><Label>Nomination End Date</Label><Controller name="nominationEndDate" control={awardControl} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} /></div>
              <div><Label>Voting Start Date</Label><Controller name="votingStartDate" control={awardControl} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} /></div>
              <div><Label>Voting End Date</Label><Controller name="votingEndDate" control={awardControl} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} /></div>
            </div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
