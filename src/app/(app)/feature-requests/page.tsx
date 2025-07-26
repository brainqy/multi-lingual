
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, ShieldQuestion, Lightbulb, Send, Edit3, CheckCircle, Zap, Clock, RefreshCw, ThumbsUp, XCircle, Loader2 } from "lucide-react";
import type { FeatureRequest } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { useAuth } from "@/hooks/use-auth";
import { getFeatureRequests, createFeatureRequest, updateFeatureRequest, upvoteFeatureRequest } from "@/lib/actions/feature-requests";

export default function FeatureRequestsPage() {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<FeatureRequest | null>(null);
  const { toast } = useToast();
  const { t } = useI18n();

  const featureRequestSchema = z.object({
    title: z.string().min(5, t("featureRequests.validation.titleMin")).max(100, t("featureRequests.validation.titleMax")),
    description: z.string().min(10, t("featureRequests.validation.descriptionMin")).max(1000, t("featureRequests.validation.descriptionMax")),
  });
  
  type FeatureRequestFormData = z.infer<typeof featureRequestSchema>;

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FeatureRequestFormData>({
    resolver: zodResolver(featureRequestSchema)
  });
  
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const fetchedRequests = await getFeatureRequests();
    setRequests(fetchedRequests);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  if (!currentUser) {
    return <AccessDeniedMessage />;
  }

  const onSubmitSuggestion = async (data: FeatureRequestFormData) => {
    if (!currentUser) return;
    
    if (editingRequest) {
      const updated = await updateFeatureRequest(editingRequest.id, { title: data.title, description: data.description });
      if (updated) {
        setRequests(prev => prev.map(req => req.id === editingRequest.id ? updated : req));
        toast({ title: t("featureRequests.toastSuggestionUpdated.title"), description: t("featureRequests.toastSuggestionUpdated.description") });
      }
    } else {
      const newRequestData = {
        tenantId: currentUser.tenantId, 
        userId: currentUser.id, 
        userName: currentUser.name,
        userAvatar: currentUser.profilePictureUrl,
        title: data.title,
        description: data.description,
        status: 'Pending' as const,
      };
      const created = await createFeatureRequest(newRequestData);
      if (created) {
        setRequests(prev => [created, ...prev]);
        toast({ title: t("featureRequests.toastSuggestionSubmitted.title"), description: t("featureRequests.toastSuggestionSubmitted.description") });
      }
    }
    setIsSuggestDialogOpen(false);
    reset({ title: '', description: '' });
    setEditingRequest(null);
  };

  const getStatusStyles = (status: FeatureRequest['status']) => {
    switch (status) {
      case 'Pending': return { icon: Clock, color: 'text-yellow-600 bg-yellow-100 border-yellow-300', label: t("featureRequests.statusPending") };
      case 'In Progress': return { icon: RefreshCw, color: 'text-blue-600 bg-blue-100 border-blue-300', label: t("featureRequests.statusInProgress") };
      case 'Completed': return { icon: CheckCircle, color: 'text-green-600 bg-green-100 border-green-300', label: t("featureRequests.statusCompleted") };
      case 'Rejected': return { icon: XCircle, color: 'text-red-600 bg-red-100 border-red-300', label: t("featureRequests.statusRejected") };
      default: return { icon: ShieldQuestion, color: 'text-gray-600 bg-gray-100 border-gray-300', label: t("featureRequests.statusUnknown") };
    }
  };
  
  const openNewRequestDialog = () => {
    setEditingRequest(null);
    reset({ title: '', description: '' });
    setIsSuggestDialogOpen(true);
  };

  const openEditRequestDialog = (request: FeatureRequest) => {
    if (currentUser.role !== 'admin' && (request.userId !== currentUser.id || request.status !== 'Pending')) {
      toast({ title: t("featureRequests.toastCannotEdit.title"), description: t("featureRequests.toastCannotEdit.description"), variant: "destructive"});
      return;
    }
    setEditingRequest(request);
    setValue('title', request.title);
    setValue('description', request.description);
    setIsSuggestDialogOpen(true);
  };
  
  const handleUpvote = async (requestId: string) => {
    const updated = await upvoteFeatureRequest(requestId);
    if (updated) {
        setRequests(prevRequests =>
          prevRequests.map(req =>
            req.id === requestId ? updated : req
          )
        );
        toast({ title: t("featureRequests.toastUpvoted.title"), description: t("featureRequests.toastUpvoted.description") });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-primary" /> {t("featureRequests.pageTitle")}
        </h1>
        <Button onClick={openNewRequestDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> {t("featureRequests.suggestButton")}
        </Button>
      </div>
      <CardDescription>{t("featureRequests.pageDescription")}</CardDescription>

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
              {editingRequest ? t("featureRequests.dialogEditTitle") : t("featureRequests.dialogCreateTitle")}
            </DialogTitle>
            <DialogUIDescription className="pt-1">
              {editingRequest ? t("featureRequests.dialogDescriptionEdit") : t("featureRequests.dialogDescriptionCreate")}
            </DialogUIDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitSuggestion)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="request-title">{t("featureRequests.formTitleLabel")}</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="request-title" placeholder={t("featureRequests.formTitlePlaceholder")} {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="request-description">{t("featureRequests.formDescriptionLabel")}</Label>
              <Controller name="description" control={control} render={({ field }) => (
                <Textarea 
                  id="request-description" 
                  rows={5} 
                  placeholder={t("featureRequests.formDescriptionPlaceholder")}
                  {...field}
                />
              )} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">{t("featureRequests.cancelButtonDialog")}</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="mr-2 h-4 w-4"/> {editingRequest ? t("featureRequests.saveChangesButtonDialog") : t("featureRequests.submitButtonDialog")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
      ) : requests.length === 0 ? (
         <Card className="text-center py-16 shadow-lg border-dashed border-2">
          <CardHeader>
            <ShieldQuestion className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">{t("featureRequests.noRequestsTitle")}</CardTitle>
            <CardDescription>
              {t("featureRequests.noRequestsDescription")}
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
                        {statusInfo.label}
                    </span>
                    {(request.userId === currentUser?.id && request.status === 'Pending') || currentUser?.role === 'admin' ? (
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEditRequestDialog(request)}>
                         <Edit3 className="h-4 w-4"/>
                       </Button>
                    ): null}
                  </div>
                <CardTitle className="text-lg line-clamp-2" title={request.title}>{request.title}</CardTitle>
                <CardDescription className="text-xs">
                  {t("featureRequests.suggestedBy", { name: request.userName })} • {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-4">{request.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t pt-3 mt-auto">
                 <Button variant="outline" size="sm" onClick={() => handleUpvote(request.id)}>
                    <ThumbsUp className="mr-2 h-4 w-4"/> {t("featureRequests.voteButton", { count: request.upvotes || 0 })}
                 </Button>
                 <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:underline" onClick={() => toast({title: t("featureRequests.toastViewDetailsMock.title"), description: t("featureRequests.toastViewDetailsMock.description", { title: request.title })})}>
                    {t("featureRequests.viewDetailsButton")}
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
