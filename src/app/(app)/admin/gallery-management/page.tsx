
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { GalleryVerticalEnd, PlusCircle, Edit3, Trash2, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GalleryEvent } from "@/types";
import { sampleEvents, sampleUserProfile, SAMPLE_TENANT_ID } from "@/lib/sample-data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import Image from "next/image";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";


const galleryEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.date({ required_error: "Event date is required." }),
  imageUrls: z.string().min(1, "At least one image URL is required (comma-separated if multiple)."),
  description: z.string().optional(),
  dataAiHint: z.string().optional(),
  isPlatformGlobal: z.boolean().default(false),
});

type GalleryEventFormData = z.infer<typeof galleryEventSchema>;

export default function GalleryManagementPage() {
  const currentUser = sampleUserProfile;
  const { toast } = useToast();

  const [events, setEvents] = useState<GalleryEvent[]>(
    currentUser.role === 'admin'
      ? sampleEvents
      : sampleEvents.filter(e => e.tenantId === currentUser.tenantId)
  );
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GalleryEvent | null>(null);
  
  useEffect(() => {
    setEvents(
      currentUser.role === 'admin'
        ? sampleEvents
        : sampleEvents.filter(e => e.tenantId === currentUser.tenantId)
    );
  }, [currentUser.role, currentUser.tenantId]);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<GalleryEventFormData>({
    resolver: zodResolver(galleryEventSchema),
    defaultValues: { isPlatformGlobal: false }
  });
  
  if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    return <AccessDeniedMessage />;
  }

  const onSubmitForm = (data: GalleryEventFormData) => {
    const tenantForEvent = currentUser.role === 'admin' && data.isPlatformGlobal ? 'platform' : currentUser.tenantId || SAMPLE_TENANT_ID;
    const eventData: GalleryEvent = {
      title: data.title,
      date: data.date.toISOString(),
      imageUrls: data.imageUrls.split(',').map(url => url.trim()).filter(url => url),
      description: data.description,
      dataAiHint: data.dataAiHint,
      id: editingEvent ? editingEvent.id : `gallery-${Date.now()}`,
      tenantId: tenantForEvent,
      isPlatformGlobal: data.isPlatformGlobal,
    };

    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? eventData : e));
      const globalIndex = sampleEvents.findIndex(e => e.id === editingEvent.id);
      if (globalIndex !== -1) sampleEvents[globalIndex] = eventData;
      toast({ title: "Gallery Event Updated", description: `Event "${data.title}" has been updated.` });
    } else {
      setEvents(prev => [eventData, ...prev]);
      sampleEvents.unshift(eventData);
      toast({ title: "Gallery Event Created", description: `Event "${data.title}" has been added.` });
    }
    setIsFormDialogOpen(false);
    reset({ title: '', imageUrls: '', description: '', dataAiHint: '', isPlatformGlobal: false });
    setEditingEvent(null);
  };

  const openNewEventDialog = () => {
    setEditingEvent(null);
    reset({ title: '', imageUrls: '', description: '', dataAiHint: '', isPlatformGlobal: false, date: new Date() });
    setIsFormDialogOpen(true);
  };

  const openEditEventDialog = (event: GalleryEvent) => {
    setEditingEvent(event);
    setValue('title', event.title);
    setValue('date', parseISO(event.date));
    setValue('imageUrls', event.imageUrls.join(', '));
    setValue('description', event.description || '');
    setValue('dataAiHint', event.dataAiHint || '');
    setValue('isPlatformGlobal', !!(event.tenantId === 'platform' || event.isPlatformGlobal));
    setIsFormDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    const globalIndex = sampleEvents.findIndex(e => e.id === eventId);
    if (globalIndex !== -1) sampleEvents.splice(globalIndex, 1);
    toast({ title: "Gallery Event Deleted", description: "Event removed from gallery.", variant: "destructive" });
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <GalleryVerticalEnd className="h-8 w-8" /> Event Gallery Management {currentUser.role === 'manager' && `(Tenant: ${currentUser.tenantId})`}
        </h1>
        <Button onClick={openNewEventDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Event
        </Button>
      </div>
      <CardDescription>Manage images and details for past events showcased in the gallery.</CardDescription>

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
              {editingEvent ? "Edit Gallery Event" : "Add New Gallery Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="event-title">Event Title</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="event-title" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="event-date">Event Date</Label>
              <Controller name="date" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
              {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="event-imageUrls">Image URLs (comma-separated)</Label>
              <Controller name="imageUrls" control={control} render={({ field }) => 
                <Textarea 
                  id="event-imageUrls" 
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" 
                  {...field} 
                  rows={3}
                />
              } />
              {errors.imageUrls && <p className="text-sm text-destructive mt-1">{errors.imageUrls.message}</p>}
            </div>
            <div>
              <Label htmlFor="event-description">Description (Optional)</Label>
              <Controller name="description" control={control} render={({ field }) => <Textarea id="event-description" rows={3} {...field} />} />
            </div>
            <div>
              <Label htmlFor="event-dataAiHint">AI Hint for Images (Optional)</Label>
              <Controller name="dataAiHint" control={control} render={({ field }) => <Input id="event-dataAiHint" placeholder="e.g., conference students" {...field} />} />
            </div>
            {currentUser.role === 'admin' && (
                <div className="flex items-center space-x-2">
                <Controller name="isPlatformGlobal" control={control} render={({ field }) => (
                    <Checkbox id="isPlatformGlobal" checked={field.value} onCheckedChange={field.onChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                )} />
                <Label htmlFor="isPlatformGlobal" className="font-normal">
                    Show this event globally (not tied to specific tenant)
                </Label>
                </div>
            )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingEvent ? "Save Changes" : "Add Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Current Gallery Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No gallery events added yet{currentUser.role === 'manager' && ' for your tenant'}.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  {currentUser.role === 'admin' && <TableHead>Tenant / Scope</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
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
                            <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                         )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{format(parseISO(event.date), "MMM dd, yyyy")}</TableCell>
                    {currentUser.role === 'admin' && <TableCell>{event.tenantId === 'platform' ? 'Platform Global' : `Tenant: ${event.tenantId}`}</TableCell>}
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
