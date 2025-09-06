
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { GalleryVerticalEnd, PlusCircle, Edit3, Trash2, CalendarDays, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GalleryEvent } from "@/types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { useAuth } from "@/hooks/use-auth";
import { getAllGalleryEvents, createGalleryEvent, updateGalleryEvent, deleteGalleryEvent } from "@/lib/actions/gallery";


const galleryEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.date({ required_error: "Event date is required." }),
  imageUrls: z.string().min(1, "At least one image URL is required (comma-separated if multiple)."),
  description: z.string().optional(),
  dataAiHint: z.string().optional(),
  isPlatformGlobal: z.boolean().default(false),
  approved: z.boolean().default(true),
});

type GalleryEventFormData = z.infer<typeof galleryEventSchema>;

export default function GalleryManagementPage() {
  const { user: currentUser, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GalleryEvent | null>(null);
  
  const fetchData = useCallback(async () => {
      if (!currentUser) return;
      setIsLoading(true);
      const fetchedEvents = await getAllGalleryEvents();
      setEvents(fetchedEvents);
      setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<GalleryEventFormData>({
    resolver: zodResolver(galleryEventSchema),
    defaultValues: { isPlatformGlobal: false, approved: true }
  });
  
  if (isUserLoading || !currentUser) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }
  
  if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    return <AccessDeniedMessage />;
  }

  const onSubmitForm = async (data: GalleryEventFormData) => {
    if (!currentUser) return;
    const eventData = {
      title: data.title,
      date: data.date.toISOString(),
      imageUrls: data.imageUrls.split(',').map(url => url.trim()).filter(url => url),
      description: data.description,
      dataAiHint: data.dataAiHint,
      isPlatformGlobal: data.isPlatformGlobal,
      approved: data.approved,
      createdByUserId: currentUser.id,
    };

    if (editingEvent) {
      const updated = await updateGalleryEvent(editingEvent.id, eventData);
      if(updated) {
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? updated : e));
        toast({ title: t("galleryManagement.toast.updated.title"), description: t("galleryManagement.toast.updated.description", { title: data.title }) });
      }
    } else {
      const created = await createGalleryEvent(eventData as Omit<GalleryEvent, 'id'>);
      if (created) {
        setEvents(prev => [created, ...prev]);
        toast({ title: t("galleryManagement.toast.created.title"), description: t("galleryManagement.toast.created.description", { title: data.title }) });
      }
    }
    setIsFormDialogOpen(false);
    reset({ title: '', imageUrls: '', description: '', dataAiHint: '', isPlatformGlobal: false, approved: true });
    setEditingEvent(null);
  };

  const openNewEventDialog = () => {
    setEditingEvent(null);
    reset({ title: '', imageUrls: '', description: '', dataAiHint: '', isPlatformGlobal: false, date: new Date(), approved: true });
    setIsFormDialogOpen(true);
  };

  const openEditEventDialog = (event: GalleryEvent) => {
    setEditingEvent(event);
    setValue('title', event.title);
    setValue('date', new Date(event.date));
    setValue('imageUrls', event.imageUrls.join(', '));
    setValue('description', event.description || '');
    setValue('dataAiHint', event.dataAiHint || '');
    setValue('isPlatformGlobal', !!(event.tenantId === 'platform' || event.isPlatformGlobal));
    setValue('approved', event.approved ?? true);
    setIsFormDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const success = await deleteGalleryEvent(eventId);
    if(success) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast({ title: t("galleryManagement.toast.deleted.title"), description: t("galleryManagement.toast.deleted.description"), variant: "destructive" });
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <GalleryVerticalEnd className="h-8 w-8" /> {t("galleryManagement.title")} {currentUser.role === 'manager' && `(${t("galleryManagement.tenantLabel", { tenantId: currentUser.tenantId })})`}
        </h1>
        <Button onClick={openNewEventDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> {t("galleryManagement.addNewButton")}
        </Button>
      </div>
      <CardDescription>{t("galleryManagement.description")}</CardDescription>

      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setEditingEvent(null);
          reset();
        }
        setIsFormDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingEvent ? t("galleryManagement.dialog.editTitle") : t("galleryManagement.dialog.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="event-title">{t("galleryManagement.dialog.eventTitleLabel")}</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="event-title" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="event-date">{t("galleryManagement.dialog.eventDateLabel")}</Label>
              <Controller name="date" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
              {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="event-imageUrls">{t("galleryManagement.dialog.imageUrlsLabel")}</Label>
              <Controller name="imageUrls" control={control} render={({ field }) => 
                <Textarea 
                  id="event-imageUrls" 
                  placeholder={t("galleryManagement.dialog.imageUrlsPlaceholder")} 
                  {...field} 
                  rows={3}
                />
              } />
              {errors.imageUrls && <p className="text-sm text-destructive mt-1">{errors.imageUrls.message}</p>}
            </div>
            <div>
              <Label htmlFor="event-description">{t("galleryManagement.dialog.descriptionLabel")}</Label>
              <Controller name="description" control={control} render={({ field }) => <Textarea id="event-description" rows={3} {...field} />} />
            </div>
            <div>
              <Label htmlFor="event-dataAiHint">{t("galleryManagement.dialog.aiHintLabel")}</Label>
              <Controller name="dataAiHint" control={control} render={({ field }) => <Input id="event-dataAiHint" placeholder={t("galleryManagement.dialog.aiHintPlaceholder")} {...field} />} />
            </div>
            <div className="flex items-center space-x-2">
              <Controller name="approved" control={control} render={({ field }) => (
                  <Checkbox id="approved" checked={field.value} onCheckedChange={field.onChange} />
              )} />
              <Label htmlFor="approved" className="font-normal">Approved for public gallery</Label>
            </div>
            {currentUser.role === 'admin' && (
                <div className="flex items-center space-x-2">
                <Controller name="isPlatformGlobal" control={control} render={({ field }) => (
                    <Checkbox id="isPlatformGlobal" checked={field.value} onCheckedChange={field.onChange} />
                )} />
                <Label htmlFor="isPlatformGlobal" className="font-normal">
                    {t("galleryManagement.dialog.globalCheckbox")}
                </Label>
                </div>
            )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">{t("common.cancel")}</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingEvent ? t("galleryManagement.dialog.saveButton") : t("galleryManagement.dialog.addButton")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("galleryManagement.currentEventsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("galleryManagement.noEventsText")} {currentUser.role === 'manager' && t("galleryManagement.forYourTenant")}.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("galleryManagement.table.preview")}</TableHead>
                  <TableHead>{t("galleryManagement.table.title")}</TableHead>
                  <TableHead>{t("galleryManagement.table.date")}</TableHead>
                  {currentUser.role === 'admin' && <TableHead>{t("galleryManagement.table.scope")}</TableHead>}
                  <TableHead>Approved</TableHead>
                  <TableHead className="text-right">{t("galleryManagement.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="w-16 h-10 relative rounded overflow-hidden">
                         {event.imageUrls && event.imageUrls.length > 0 ? (
                            <Image src={event.imageUrls[0]} alt={event.title} layout="fill" objectFit="cover" data-ai-hint={event.dataAiHint || "event photo"} />
                         ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">{t("galleryManagement.table.noImage")}</div>
                         )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{format(new Date(event.date), "MMM dd, yyyy")}</TableCell>
                    {currentUser.role === 'admin' && <TableCell>{event.tenantId === 'platform' ? t("galleryManagement.table.platformGlobal") : `${t("galleryManagement.table.tenantPrefix")}: ${event.tenantId}`}</TableCell>}
                    <TableCell>{event.approved ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditEventDialog(event)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="h-4 w-4" />
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
