
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, PlusCircle, Video, CheckCircle, Clock, XCircle, ThumbsUp, Filter, Edit3, CalendarPlus, MessageSquare as FeedbackIcon, Star as StarIcon, Users as UsersIcon } from "lucide-react";
import { sampleAppointments, sampleAlumni, sampleUserProfile, sampleCommunityPosts } from "@/lib/sample-data";
import type { Appointment, AlumniProfile, AppointmentStatus, PreferredTimeSlot, CommunityPost } from "@/types";
import { AppointmentStatuses, PreferredTimeSlots } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, parseISO, isFuture, differenceInDays } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from '@/components/ui/badge';

const rescheduleSchema = z.object({
  preferredDate: z.date({ required_error: "New date is required." }),
  preferredTimeSlot: z.string().min(1, "New time slot is required."),
  message: z.string().optional(),
});
type RescheduleFormData = z.infer<typeof rescheduleSchema>;

const feedbackSchema = z.object({
    rating: z.coerce.number().min(1, "Rating is required.").max(5),
    comments: z.string().optional(),
});
type FeedbackFormData = z.infer<typeof feedbackSchema>;


export default function AppointmentsPage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments.filter(a => a.requesterUserId === sampleUserProfile.id || a.alumniUserId === sampleUserProfile.id));
  const [filterStatuses, setFilterStatuses] = useState<Set<AppointmentStatus>>(new Set());
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>();
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>();
  const [filterAlumniName, setFilterAlumniName] = useState('');

  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);
  const { control: rescheduleControl, handleSubmit: handleRescheduleSubmit, reset: resetRescheduleForm, formState: { errors: rescheduleErrors } } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
  });

  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [appointmentForFeedback, setAppointmentForFeedback] = useState<Appointment | null>(null);
  const { control: feedbackControl, handleSubmit: handleFeedbackSubmit, reset: resetFeedbackForm, formState: { errors: feedbackErrors } } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 0, comments: ''}
  });

  const assignedPosts = useMemo(() => {
    return sampleCommunityPosts.filter(
      post => post.type === 'request' && post.assignedTo === sampleUserProfile.name && post.status === 'assigned'
    );
  }, []); // Removed sampleCommunityPosts and sampleUserProfile.name from deps as they are stable


  const getStatusClass = (status: AppointmentStatus) => {
    if (status === 'Confirmed') return 'text-green-600 bg-green-100';
    if (status === 'Pending') return 'text-yellow-600 bg-yellow-100';
    if (status === 'Cancelled') return 'text-red-600 bg-red-100';
    if (status === 'Completed') return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getAlumniDetails = (name: string): AlumniProfile | undefined => {
    return sampleAlumni.find(a => a.name === name);
  };

  const handleAcceptAppointment = (appointmentId: string) => {
    const updateGlobalAndLocal = (updater: (appt: Appointment) => Appointment) => {
        setAppointments(prevAppointments => prevAppointments.map(appt => appt.id === appointmentId ? updater(appt) : appt));
        const globalIndex = sampleAppointments.findIndex(sa => sa.id === appointmentId);
        if (globalIndex !== -1) sampleAppointments[globalIndex] = updater(sampleAppointments[globalIndex]);
    };
    updateGlobalAndLocal(appt => ({ ...appt, status: 'Confirmed' as AppointmentStatus }));
    toast({ title: "Appointment Confirmed", description: "The appointment has been marked as confirmed." });
  };

  const handleDeclineAppointment = (appointmentId: string) => {
     const updateGlobalAndLocal = (updater: (appt: Appointment) => Appointment) => {
        setAppointments(prevAppointments => prevAppointments.map(appt => appt.id === appointmentId ? updater(appt) : appt));
        const globalIndex = sampleAppointments.findIndex(sa => sa.id === appointmentId);
        if (globalIndex !== -1) sampleAppointments[globalIndex] = updater(sampleAppointments[globalIndex]);
    };
    updateGlobalAndLocal(appt => ({ ...appt, status: 'Cancelled' as AppointmentStatus }));
    toast({ title: "Appointment Declined", description: "The appointment has been marked as cancelled.", variant: "destructive" });
  };

  const handleMarkComplete = (appointmentId: string) => {
    const updateGlobalAndLocal = (updater: (appt: Appointment) => Appointment) => {
        setAppointments(prevAppointments => prevAppointments.map(appt => appt.id === appointmentId ? updater(appt) : appt));
        const globalIndex = sampleAppointments.findIndex(sa => sa.id === appointmentId);
        if (globalIndex !== -1) sampleAppointments[globalIndex] = updater(sampleAppointments[globalIndex]);
    };
    updateGlobalAndLocal(appt => ({ ...appt, status: 'Completed' as AppointmentStatus }));
    toast({ title: "Appointment Completed", description: "The appointment has been marked as completed." });
  };

  const openRescheduleDialog = (appointment: Appointment) => {
    setAppointmentToReschedule(appointment);
    resetRescheduleForm({
      preferredDate: parseISO(appointment.dateTime),
      preferredTimeSlot: PreferredTimeSlots[0], 
      message: '',
    });
    setIsRescheduleDialogOpen(true);
  };

  const onRescheduleSubmit = (data: RescheduleFormData) => {
    if (!appointmentToReschedule) return;
    const newDateTime = new Date(data.preferredDate);
    const timeParts = data.preferredTimeSlot.match(/(\d+)(AM|PM)/);
    if (timeParts) {
      let hour = parseInt(timeParts[1]);
      if (timeParts[2] === 'PM' && hour !== 12) hour += 12;
      if (timeParts[2] === 'AM' && hour === 12) hour = 0; // Midnight case
      newDateTime.setHours(hour, 0, 0, 0);
    }

    const updateGlobalAndLocal = (updater: (appt: Appointment) => Appointment) => {
        setAppointments(prevAppointments => prevAppointments.map(appt => appt.id === appointmentToReschedule.id ? updater(appt) : appt));
        const globalIndex = sampleAppointments.findIndex(sa => sa.id === appointmentToReschedule.id);
        if (globalIndex !== -1) sampleAppointments[globalIndex] = updater(sampleAppointments[globalIndex]);
    };

    updateGlobalAndLocal(appt => ({ 
        ...appt, 
        dateTime: newDateTime.toISOString(), 
        status: 'Pending' as AppointmentStatus // Reschedule implies pending re-confirmation
    }));

    toast({ title: "Reschedule Request Sent (Mock)", description: `Reschedule request sent for appointment with ${appointmentToReschedule.withUser}.` });
    setIsRescheduleDialogOpen(false);
  };

  const openFeedbackDialog = (appointment: Appointment) => {
    setAppointmentForFeedback(appointment);
    resetFeedbackForm({ rating: 0, comments: '' });
    setIsFeedbackDialogOpen(true);
  };

  const onFeedbackSubmit = (data: FeedbackFormData) => {
    if (!appointmentForFeedback) return;
    console.log("Feedback Submitted (Mock):", { appointmentId: appointmentForFeedback.id, ...data });
    // Here you would typically save this feedback to your backend
    toast({ title: "Feedback Submitted (Mock)", description: `Thank you for your feedback on the session with ${appointmentForFeedback.withUser}.` });
    setIsFeedbackDialogOpen(false);
  };


  const handleFilterChange = (filterSet: Set<string>, item: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const newSet = new Set(filterSet);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setter(newSet);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const apptDate = parseISO(appt.dateTime);
      const matchesStatus = filterStatuses.size === 0 || filterStatuses.has(appt.status);
      const matchesStartDate = !filterStartDate || apptDate >= filterStartDate;
      const matchesEndDate = !filterEndDate || apptDate <= filterEndDate;
      const matchesName = filterAlumniName === '' || appt.withUser.toLowerCase().includes(filterAlumniName.toLowerCase());
      return matchesStatus && matchesStartDate && matchesEndDate && matchesName;
    });
  }, [appointments, filterStatuses, filterStartDate, filterEndDate, filterAlumniName]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarDays className="h-8 w-8" /> My Appointments
        </h1>
        <Button onClick={() => toast({ title: "Schedule New (Mock)", description: "Navigate to Alumni Connect to book."})} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Schedule New
        </Button>
      </div>
      <CardDescription>View and manage your scheduled meetings with alumni and community requests.</CardDescription>

      {/* Assigned Posts Section */}
      {assignedPosts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Assigned Posts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignedPosts.map(post => (
              <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{post.content}</CardTitle>
                  <p className="text-sm text-muted-foreground">Assigned to: {post.assignedTo}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{post.tags?.join(', ') || 'No tags'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Existing Appointments Section */}
      <Accordion type="single" collapsible className="w-full bg-card shadow-lg rounded-lg">
        <AccordionItem value="filters">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Filter className="h-5 w-5" /> Filters
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {AppointmentStatuses.map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox id={`status-${status}`} checked={filterStatuses.has(status)} onCheckedChange={() => handleFilterChange(filterStatuses, status, setFilterStatuses as React.Dispatch<React.SetStateAction<Set<string>>>)} />
                        <Label htmlFor={`status-${status}`} className="font-normal">{status}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="filter-alumni-name">Alumni Name</Label>
                  <Input id="filter-alumni-name" placeholder="Search by name..." value={filterAlumniName} onChange={(e) => setFilterAlumniName(e.target.value)} />
                </div>
                 <div>
                  <Label htmlFor="filter-start-date">Date Range</Label>
                    <div className="flex flex-col gap-2">
                      <DatePicker date={filterStartDate} setDate={setFilterStartDate} placeholder="Start Date"/>
                      <DatePicker date={filterEndDate} setDate={setFilterEndDate} placeholder="End Date"/>
                   </div>
                 </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {filteredAppointments.length === 0 && assignedPosts.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Appointments or Assigned Requests</CardTitle>
            <CardDescription>{appointments.length > 0 ? "Try adjusting your filters." : "You have no scheduled appointments or assigned community requests."}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {filteredAppointments.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredAppointments.map((appt) => {
                const alumni = getAlumniDetails(appt.withUser);
                const isCurrentUserRequester = appt.requesterUserId === sampleUserProfile.id;
                const apptDate = parseISO(appt.dateTime);
                const reminderDate = appt.reminderDate ? parseISO(appt.reminderDate) : null;
                const daysToReminder = reminderDate && isFuture(reminderDate) ? differenceInDays(reminderDate, new Date()) : null;

                return (
                <Card key={appt.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{appt.title}</CardTitle>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(appt.status)}`}>
                        {appt.status === 'Confirmed' && <CheckCircle className="inline h-3 w-3 mr-1"/>}
                        {appt.status === 'Pending' && <Clock className="inline h-3 w-3 mr-1"/>}
                        {appt.status === 'Cancelled' && <XCircle className="inline h-3 w-3 mr-1"/>}
                        {appt.status === 'Completed' && <CheckCircle className="inline h-3 w-3 text-blue-600"/>}
                        {appt.status}
                      </span>
                    </div>
                    {alumni && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                            <Avatar className="h-6 w-6"><AvatarImage src={alumni.profilePictureUrl} alt={alumni.name} data-ai-hint="person face"/><AvatarFallback>{alumni.name.substring(0,1)}</AvatarFallback></Avatar>
                            <span>With {alumni.name} {isCurrentUserRequester ? '' : '(Incoming Request)'}</span>
                        </div>
                    )}
                    {!alumni && appt.withUser && ( 
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                            <UsersIcon className="h-4 w-4"/>
                            <span>With {appt.withUser} {isCurrentUserRequester ? '' : '(Incoming Request)'}</span>
                        </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground"><strong>Date & Time:</strong> {format(apptDate, "PPPp")}</p>
                    <p className="text-sm text-muted-foreground mt-1">({formatDistanceToNow(apptDate, { addSuffix: true })})</p>
                    {daysToReminder !== null && (
                        <p className={cn("text-xs mt-1 flex items-center gap-1", daysToReminder === 0 ? "text-red-600 font-semibold" : "text-amber-600")}>
                            <Clock className="h-3 w-3"/>
                            Reminder {daysToReminder === 0 ? "Today!" : `in ${daysToReminder} day${daysToReminder > 1 ? 's' : ''}`}
                        </p>
                    )}
                     {appt.notes && <p className="text-xs mt-2 italic text-muted-foreground">Notes: {appt.notes.substring(0,100)}{appt.notes.length > 100 ? '...' : ''}</p>}
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch sm:flex-row sm:justify-end gap-2 border-t pt-4 mt-auto">
                    {appt.status === 'Confirmed' && (
                      <>
                      <Button size="sm" variant="default" onClick={() => toast({title: "Join Meeting (Mock)", description: "This would typically open a video call link."})} className="w-full sm:w-auto bg-primary hover:bg-primary/90"><Video className="mr-2 h-4 w-4" /> Join Meeting</Button>
                       <Button size="sm" variant="outline" onClick={() => handleMarkComplete(appt.id)} className="w-full sm:w-auto"><CheckCircle className="mr-2 h-4 w-4"/> Mark as Completed</Button>
                       <Button size="sm" variant="outline" onClick={() => openRescheduleDialog(appt)} className="w-full sm:w-auto"><Edit3 className="mr-1 h-4 w-4"/> Manage/Reschedule</Button>
                      </>
                    )}
                    {appt.status === 'Pending' && !isCurrentUserRequester && (
                      <>
                        <Button size="sm" variant="default" onClick={() => handleAcceptAppointment(appt.id)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"><ThumbsUp className="mr-2 h-4 w-4"/> Accept</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeclineAppointment(appt.id)} className="w-full sm:w-auto"><XCircle className="mr-2 h-4 w-4"/> Decline</Button>
                      </>
                    )}
                     {appt.status === 'Pending' && isCurrentUserRequester && (
                         <Button size="sm" variant="outline" onClick={() => openRescheduleDialog(appt)} className="w-full sm:w-auto"><Edit3 className="mr-1 h-4 w-4"/> Manage/Reschedule</Button>
                     )}
                     {appt.status === 'Completed' && isCurrentUserRequester && (
                        <Button size="sm" variant="outline" onClick={() => openFeedbackDialog(appt)} className="w-full sm:w-auto"><FeedbackIcon className="mr-1 h-4 w-4"/> Provide Feedback</Button>
                     )}
                     {appt.status === 'Cancelled' && (<p className="text-sm text-muted-foreground text-center sm:text-right w-full">This appointment was cancelled.</p>)}
                  </CardFooter>
                </Card>
              );
            })}
            </div>
          )}

          {assignedPosts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Assigned Community Requests</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {assignedPosts.map(post => (
                  <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-700">Request: {post.content ? post.content.substring(0, 50) : 'Untitled Request'}...</CardTitle>
                      <CardDescription className="text-xs text-blue-600">
                        From: {post.userName} (Community Feed) <br/>
                        Assigned to you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Status: <Badge variant="info">{post.status}</Badge></p>
                       {post.tags && post.tags.length > 0 && <p className="text-xs mt-2 text-muted-foreground">Tags: {post.tags.join(', ')}</p>}
                    </CardContent>
                     <CardFooter className="flex justify-end">
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/community-feed#post-${post.id}`}>View on Feed</Link>
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader><DialogTitle className="text-2xl">Reschedule Appointment</DialogTitle><CardDescription>Request a new time for your appointment with {appointmentToReschedule?.withUser}.</CardDescription></DialogHeader>
          {appointmentToReschedule && (
            <form onSubmit={handleRescheduleSubmit(onRescheduleSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label htmlFor="rescheduleDate">New Preferred Date</Label><Controller name="preferredDate" control={rescheduleControl} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />{rescheduleErrors.preferredDate && <p className="text-sm text-destructive mt-1">{rescheduleErrors.preferredDate.message}</p>}</div>
                <div><Label htmlFor="rescheduleTimeSlot">New Preferred Time Slot</Label><Controller name="preferredTimeSlot" control={rescheduleControl} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="rescheduleTimeSlot"><SelectValue placeholder="Select a time slot" /></SelectTrigger><SelectContent>{PreferredTimeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}</SelectContent></Select>)} />{rescheduleErrors.preferredTimeSlot && <p className="text-sm text-destructive mt-1">{rescheduleErrors.preferredTimeSlot.message}</p>}</div>
              </div>
              <div><Label htmlFor="rescheduleMessage">Message (Optional)</Label><Controller name="message" control={rescheduleControl} render={({ field }) => <Textarea id="rescheduleMessage" placeholder="Reason for rescheduling or additional details." rows={3} {...field} />} /></div>
              <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground"><CalendarPlus className="mr-2 h-4 w-4"/> Request Reschedule</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
            <DialogHeader><DialogTitle className="text-2xl">Provide Feedback</DialogTitle><CardDescription>Share your experience for the session with {appointmentForFeedback?.withUser}.</CardDescription></DialogHeader>
            {appointmentForFeedback && (
                <form onSubmit={handleFeedbackSubmit(onFeedbackSubmit)} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="rating">Overall Rating (1-5 Stars)</Label>
                        <Controller name="rating" control={feedbackControl} render={({ field }) => (
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || 0)}>
                                <SelectTrigger id="rating"><SelectValue placeholder="Select rating" /></SelectTrigger>
                                <SelectContent>
                                    {[1,2,3,4,5].map(r => <SelectItem key={r} value={String(r)}>{r} Star{r > 1 ? 's' : ''}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )} />
                         {feedbackErrors.rating && <p className="text-sm text-destructive mt-1">{feedbackErrors.rating.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="comments">Comments (Optional)</Label>
                        <Controller name="comments" control={feedbackControl} render={({ field }) => <Textarea id="comments" placeholder="What went well? Any suggestions?" rows={4} {...field} />} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground"><FeedbackIcon className="mr-2 h-4 w-4"/> Submit Feedback</Button>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

    