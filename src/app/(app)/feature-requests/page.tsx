"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, ShieldQuestion, Lightbulb, Send, Edit3, CheckCircle, Zap, Clock, RefreshCw, ThumbsUp, XCircle } from "lucide-react"; // Added XCircle
import { sampleFeatureRequests, sampleUserProfile } from "@/lib/sample-data";
import type { FeatureRequest } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
// Removed useTranslations

const featureRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
});

type FeatureRequestFormData = z.infer<typeof featureRequestSchema>;

export default function FeatureRequestsPage() {
  const currentUser = sampleUserProfile;
  const [requests, setRequests] = useState<FeatureRequest[]>(sampleFeatureRequests);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<FeatureRequest | null>(null);
  const { toast } = useToast();
  // const t = useTranslations('FeatureRequestsPage'); // Removed
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FeatureRequestFormData>({
    resolver: zodResolver(featureRequestSchema)
  });

  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const onSubmitSuggestion = (data: FeatureRequestFormData) => {
    if (editingRequest) {
      setRequests(prevRequests => prevRequests.map(req => 
        req.id === editingRequest.id ? { ...req, title: data.title, description: data.description, timestamp: new Date().toISOString() } : req
      ));
      toast({ title: "Suggestion Updated", description: "Your feature request has been updated." });
    } else {
      const newRequest: FeatureRequest = {
        id: String(Date.now()),
        tenantId: sampleUserProfile.tenantId, 
        userId: sampleUserProfile.id, 
        userName: sampleUserProfile.name,
        userAvatar: sampleUserProfile.profilePictureUrl,
        timestamp: new Date().toISOString(),
        title: data.title,
        description: data.description,
        status: 'Pending',
        upvotes: 0,
      };
      setRequests(prevRequests => [newRequest, ...prevRequests]);
      toast({ title: "Suggestion Submitted", description: "Thank you for your feedback!" });
    }
    setIsSuggestDialogOpen(false);
    reset({ title: '', description: '' });
    setEditingRequest(null);
  };

  const getStatusStyles = (status: FeatureRequest['status']) => {
    switch (status) {
      case 'Pending': return { icon: Clock, color: 'text-yellow-600 bg-yellow-100 border-yellow-300' };
      case 'In Progress': return { icon: RefreshCw, color: 'text-blue-600 bg-blue-100 border-blue-300' };
      case 'Completed': return { icon: CheckCircle, color: 'text-green-600 bg-green-100 border-green-300' };
      case 'Rejected': return { icon: XCircle, color: 'text-red-600 bg-red-100 border-red-300' };
      default: return { icon: ShieldQuestion, color: 'text-gray-600 bg-gray-100 border-gray-300' };
    }
  };
  
  const openNewRequestDialog = () => {
    setEditingRequest(null);
    reset({ title: '', description: '' });
    setIsSuggestDialogOpen(true);
  };

  const openEditRequestDialog = (request: FeatureRequest) => {
    if (currentUser.role !== 'admin' && (request.userId !== sampleUserProfile.id || request.status !== 'Pending')) {
      toast({ title: "Cannot Edit", description: "You can only edit your own pending requests, or admins can edit any.", variant: "destructive"});
      return;
    }
    setEditingRequest(request);
    setValue('title', request.title);
    setValue('description', request.description);
    setIsSuggestDialogOpen(true);
  };
  
  const handleUpvote = (requestId: string) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, upvotes: (req.upvotes || 0) + 1 } : req
      )
    );
    toast({ title: "Upvoted!", description: "Your vote has been counted." });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-primary" /> Feature Requests
        </h1>
        <Button onClick={openNewRequestDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Suggest New Feature
        </Button>
      </div>
      <CardDescription>Share your ideas for improving ResumeMatch AI or vote on existing suggestions.</CardDescription>

      <Dialog open={isSuggestDialogOpen} onOpenChange={(isOpen) => {
        setIsSuggestDialogOpen(isOpen);
        if (!isOpen) {
          reset({ title: '', description: '' });
          setEditingRequest(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary"/>
              {editingRequest ? "Edit Feature Suggestion" : "Suggest a New Feature"}
            </DialogTitle>
            <DialogUIDescription className="pt-1">
              {editingRequest ? "Modify your existing suggestion." : "We value your input! Let us know what you'd like to see."}
            </DialogUIDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitSuggestion)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="request-title">Feature Title</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="request-title" placeholder="e.g., Dark Mode for Dashboard" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="request-description">Detailed Description</Label>
              <Controller name="description" control={control} render={({ field }) => (
                <Textarea 
                  id="request-description" 
                  rows={5} 
                  placeholder="Explain your feature idea, its benefits, and how it might work."
                  {...field}
                />
              )} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="mr-2 h-4 w-4"/> {editingRequest ? "Save Changes" : "Submit Suggestion"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {requests.length === 0 ? (
         <Card className="text-center py-16 shadow-lg border-dashed border-2">
          <CardHeader>
            <ShieldQuestion className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Feature Requests Yet</CardTitle>
            <CardDescription>
              Have an idea to improve ResumeMatch AI? Be the first to suggest it!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.sort((a,b) => (b.upvotes || 0) - (a.upvotes || 0)).map(request => {
            const statusInfo = getStatusStyles(request.status);
            const StatusIcon = statusInfo.icon;
            return (
            <Card key={request.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <span className={cn(`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 border`, statusInfo.color)}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {request.status}
                    </span>
                    {(request.userId === sampleUserProfile.id && request.status === 'Pending') || currentUser.role === 'admin' ? (
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEditRequestDialog(request)}>
                         <Edit3 className="h-4 w-4"/>
                       </Button>
                    ): null}
                  </div>
                <CardTitle className="text-lg line-clamp-2" title={request.title}>{request.title}</CardTitle>
                <CardDescription className="text-xs">
                  Suggested by {request.userName} • {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-4">{request.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t pt-3 mt-auto">
                 <Button variant="outline" size="sm" onClick={() => handleUpvote(request.id)}>
                    <ThumbsUp className="mr-2 h-4 w-4"/> Vote ({request.upvotes || 0})
                 </Button>
                 <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:underline" onClick={() => toast({title: "View Details (Mock)", description: `Viewing details for "${request.title}"`})}>
                    View Details & Comments
                 </Button>
              </CardFooter>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
