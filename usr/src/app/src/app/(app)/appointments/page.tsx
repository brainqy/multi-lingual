
"use client";

import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, PlusCircle, Video, CheckCircle, Clock, XCircle, ThumbsUp, Filter, Edit3, CalendarPlus, MessageSquare as FeedbackIcon, Star as StarIcon, Users as UsersIcon, Loader2 } from "lucide-react";
import { getAppointments, updateAppointment } from "@/lib/actions/appointments";
import type { Appointment, AlumniProfile, AppointmentStatus, PreferredTimeSlot, CommunityPost } from "@/types";
import { AppointmentStatuses, PreferredTimeSlots } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, parseISO, isFuture, differenceInDays } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useMemo, useEffect, useCallback } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { getUsers } from "@/lib/data-services/users";
import { getCommunityPosts } from "@/lib/actions/community";

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
  const { t } = useI18n();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allUsers, setAllUsers] = useState<AlumniProfile[]>([]);
  const [assignedPosts, setAssignedPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const [userAppointments, users, communityPosts] = await Promise.all([
      getAppointments(currentUser.id),
      getUsers(),
      getCommunityPosts(currentUser.tenantId, currentUser.id),
    ]);
    setAppointments(userAppointments);
    setAllUsers(users as AlumniProfile[]);
    setAssignedPosts(communityPosts.filter(
      post => post.type === 'request' && post.assignedTo === currentUser.name && post.status === 'in progress'
    ));
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusClass = (status: AppointmentStatus) => {
    if (status === 'Confirmed') return 'text-green-600 bg-green-100';
    if (status === 'Pending') return 'text-yellow-600 bg-yellow-100';
    if (status === 'Cancelled') return 'text-red-600 bg-red-100';
    if (status === 'Completed') return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getPartnerDetails = (appointment: Appointment): AlumniProfile | undefined => {
    const partnerId = appointment.requesterUserId === currentUser?.id ? appointment.alumniUserId : appointment.requesterUserId;
    return allUsers.find(u => u.id === partnerId);
  };

  const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, successToast: { title: string, description: string }, variant?: "destructive") => {
    const updated = await updateAppointment(appointmentId, { status });
    if(updated) {
        setAppointments(prev => prev.map(appt => appt.id === appointmentId ? updated : appt));
        toast({ title: successToast.title, description: successToast.description, variant });
    } else {
        toast({ title: "Update Failed", description: "Could not update the appointment status.", variant: "destructive"});
    }
  };

  const handleAcceptAppointment = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'Confirmed', { title: t("appointments.toastConfirmed", { default: "Appointment Confirmed!" }), description: t("appointments.toastConfirmedDesc", { default: "The appointment has been accepted." }) });
  };

  const handleDeclineAppointment = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'Cancelled', { title: t("appointments.toastDeclined", { default: "Appointment Declined" }), description: t("appointments.toastDeclinedDesc", { default: "The appointment request has been declined." }) }, "destructive");
  };

  const handleMarkComplete = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'Completed', { title: t("appointments.toastCompleted", { default: "Appointment Completed" }), description: t("appointments.toastCompletedDesc", { default: "The appointment has been marked as complete." }) });
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

  const onRescheduleSubmit = async (data: RescheduleFormData) => {
    if (!appointmentToReschedule) return;
    const newDateTime = new Date(data.preferredDate);
    const timeParts = data.preferredTimeSlot.match(/(\d+)(AM|PM)/);
    if (timeParts) {
      let hour = parseInt(timeParts[1]);
      if (timeParts[2] === 'PM' && hour !== 12) hour += 12;
      if (timeParts[2] === 'AM' && hour === 12) hour = 0;
      newDateTime.setHours(hour, 0, 0, 0);
    }

    const partner = getPartnerDetails(appointmentToReschedule);
    const updated = await updateAppointment(appointmentToReschedule.id, { dateTime: newDateTime.toISOString(), status: 'Pending' });

    if (updated) {
        setAppointments(prev => prev.map(appt => appt.id === appointmentToReschedule.id ? updated : appt));
        toast({ title: t("appointments.toastReschedule", { default: "Reschedule Request Sent" }), description: t("appointments.toastRescheduleDesc", { default: "A reschedule request has been sent to {user}.", user: partner?.name || "the other party" }) });
        setIsRescheduleDialogOpen(false);
    } else {
        toast({ title: "Reschedule Failed", description: "Could not send reschedule request.", variant: "destructive" });
    }
  };

  const openFeedbackDialog = (appointment: Appointment) => {
    setAppointmentForFeedback(appointment);
    resetFeedbackForm({ rating: 0, comments: '' });
    setIsFeedbackDialogOpen(true);
  };

  const onFeedbackSubmit = (data: FeedbackFormData) => {
    if (!appointmentForFeedback) return;
    // In a real app, this would be an API call to save the feedback
    const partner = getPartnerDetails(appointmentForFeedback);
    console.log("Feedback submitted (mock):", { appointmentId: appointmentForFeedback.id, ...data });
    toast({ title: t("appointments.toastFeedback", { default: "Feedback Submitted" }), description: t("appointments.toastFeedbackDesc", { default: "Thank you for your feedback on your session with {user}.", user: partner?.name || 'the alumni' }) });
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
      const partner = getPartnerDetails(appt);
      const matchesStatus = filterStatuses.size === 0 || filterStatuses.has(appt.status);
      const matchesStartDate = !filterStartDate || apptDate >= filterStartDate;
      const matchesEndDate = !filterEndDate || apptDate <= filterEndDate;
      const matchesName = filterAlumniName === '' || (partner && partner.name.toLowerCase().includes(filterAlumniName.toLowerCase()));
      return matchesStatus && matchesStartDate && matchesEndDate && matchesName;
    });
  }, [appointments, filterStatuses, filterStartDate, filterEndDate, filterAlumniName, allUsers]);
  
  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarDays className="h-8 w-8" /> {t("appointments.title", { default: "My Appointments" })}
        </h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/alumni-connect">
            <PlusCircle className="mr-2 h-5 w-5" /> {t("appointments.scheduleNew", { default: "Schedule New" })}
          </Link>
        </Button>
      </div>
      <CardDescription>{t("appointments.pageDescription", { default: "View and manage your scheduled appointments, mock interviews, and assigned community requests." })}</CardDescription>

      <Accordion type="single" collapsible className="w-full bg-card shadow-lg rounded-lg">
        <AccordionItem value="filters">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Filter className="h-5 w-5" /> {t("appointments.filters", { default: "Filters" })}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <h4 className="font-medium mb-2">{t("appointments.status", { default: "Status" })}</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {AppointmentStatuses.map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox id={`status-${status}`} checked={filterStatuses.has(status)} onCheckedChange={() => handleFilterChange(filterStatuses, status, setFilterStatuses as React.Dispatch<React.SetStateAction<Set<string>>>)} />
                        <Label htmlFor={`status-${status}`} className="font-normal">{t(`appointments.statuses.${status}`, { default: status })}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="filter-alumni-name">{t("appointments.alumniName", { default: "Alumni Name" })}</Label>
                  <Input id="filter-alumni-name" placeholder={t("appointments.searchByName", { default: "Search by name..." })} value={filterAlumniName} onChange={(e) => setFilterAlumniName(e.target.value)} />
                </div>
                 <div>
                  <Label htmlFor="filter-start-date">{t("appointments.dateRange", { default: "Date Range" })}</Label>
                    <div className="flex flex-col gap-2">
                      <DatePicker date={filterStartDate} setDate={setFilterStartDate} placeholder={t("appointments.startDate", { default: "Start Date" })}/>
                      <DatePicker date={filterEndDate} setDate={setFilterEndDate} placeholder={t("appointments.endDate", { default: "End Date" })}/>
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
            <CardTitle className="text-2xl">{t("appointments.noAppointments", { default: "No Appointments Found" })}</CardTitle>
            <CardDescription>{appointments.length > 0 ? t("appointments.tryAdjustingFilters", { default: "Try adjusting your filters." }) : t("appointments.noScheduled", { default: "You have no appointments or assigned requests." })}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {filteredAppointments.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredAppointments.map((appt) => {
                const partner = getPartnerDetails(appt);
                const isCurrentUserRequester = appt.requesterUserId === currentUser.id;
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
                        {t(`appointments.statuses.${appt.status}`, { default: appt.status })}
                      </span>
                    </div>
                    {partner && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                            <Avatar className="h-6 w-6"><AvatarImage src={partner.profilePictureUrl} alt={partner.name} data-ai-hint="person face"/><AvatarFallback>{partner.name.substring(0,1)}</AvatarFallback></Avatar>
                            <span>With {partner.name} {isCurrentUserRequester ? '' : '(Incoming Request)'}</span>
                        </div>
                    )}
                    {!partner && appt.withUser && ( 
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                            <UsersIcon className="h-4 w-4"/>
                            <span>{t("appointments.withUser", { default: "With {name} {incoming}", name: appt.withUser, incoming: isCurrentUserRequester ? '' : t("appointments.incomingRequest", { default: "(Incoming Request)" }) })}</span>
                        </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground"><strong>{t("appointments.dateTime", { default: "Date & Time" })}:</strong> {format(apptDate, "PPPp")}</p>
                    <p className="text-sm text-muted-foreground mt-1">({formatDistanceToNow(apptDate, { addSuffix: true })})</p>
                    {daysToReminder !== null && (
                        <p className={cn("text-xs mt-1 flex items-center gap-1", daysToReminder === 0 ? "text-red-600 font-semibold" : "text-amber-600")}>
                            <Clock className="h-3 w-3"/>
                            {t("appointments.reminder", { default: "Reminder {when}", when: daysToReminder === 0 ? t("appointments.today", { default: "today" }) : t("appointments.inDays", { default: "in {count} days", count: daysToReminder }) })}
                        </p>
                    )}
                     {appt.notes && <p className="text-xs mt-2 italic text-muted-foreground">{t("appointments.notes", { default: "Notes" })}: {appt.notes.substring(0,100)}{appt.notes.length > 100 ? '...' : ''}</p>}
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch sm:flex-row sm:justify-end gap-2 border-t pt-4 mt-auto">
                    {appt.status === 'Confirmed' && (
                      <>
                      <Button size="sm" variant="default" onClick={() => toast({title: t("appointments.toastJoinMeeting", { default: "Joining Meeting (Mock)" }), description: t("appointments.toastJoinMeetingDesc", { default: "This would launch the video conferencing link." })})} className="w-full sm:w-auto bg-primary hover:bg-primary/90"><Video className="mr-2 h-4 w-4" /> {t("appointments.joinMeeting", { default: "Join Meeting" })}</Button>
                       <Button size="sm" variant="outline" onClick={() => handleMarkComplete(appt.id)} className="w-full sm:w-auto"><CheckCircle className="mr-2 h-4 w-4"/> {t("appointments.markCompleted", { default: "Mark as Completed" })}</Button>
                       <Button size="sm" variant="outline" onClick={() => openRescheduleDialog(appt)} className="w-full sm:w-auto"><Edit3 className="mr-1 h-4 w-4"/> {t("appointments.manageReschedule", { default: "Reschedule" })}</Button>
                      </>
                    )}
                    {appt.status === 'Pending' && !isCurrentUserRequester && (
                      <>
                        <Button size="sm" variant="default" onClick={() => handleAcceptAppointment(appt.id)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"><ThumbsUp className="mr-2 h-4 w-4"/> {t("appointments.accept", { default: "Accept" })}</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeclineAppointment(appt.id)} className="w-full sm:w-auto"><XCircle className="mr-2 h-4 w-4"/> {t("appointments.decline", { default: "Decline" })}</Button>
                      </>
                    )}
                     {appt.status === 'Pending' && isCurrentUserRequester && (
                         <Button size="sm" variant="outline" onClick={() => openRescheduleDialog(appt)} className="w-full sm:w-auto"><Edit3 className="mr-1 h-4 w-4"/> {t("appointments.manageReschedule", { default: "Reschedule" })}</Button>
                     )}
                     {appt.status === 'Completed' && isCurrentUserRequester && (
                        <Button size="sm" variant="outline" onClick={() => openFeedbackDialog(appt)} className="w-full sm:w-auto"><FeedbackIcon className="mr-1 h-4 w-4"/> {t("appointments.provideFeedback", { default: "Provide Feedback" })}</Button>
                     )}
                     {appt.status === 'Cancelled' && (<p className="text-sm text-muted-foreground text-center sm:text-right w-full">{t("appointments.cancelledMsg", { default: "This appointment was cancelled." })}</p>)}
                  </CardFooter>
                </Card>
              );
            })}
            </div>
          )}

          {assignedPosts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">{t("appointments.assignedCommunityRequests", { default: "Assigned Community Requests" })}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {assignedPosts.map(post => (
                  <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-700">{t("appointments.request", { default: "Request" })}: {post.content ? post.content.substring(0, 50) : t("appointments.untitledRequest", { default: "Untitled Request" })}...</CardTitle>
                      <CardDescription className="text-xs text-blue-600">
                        {t("appointments.from")}: {post.userName} ({t("appointments.communityFeed")}) <br/>
                        {t("appointments.assignedToYou", { default: "Assigned to you" })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{t("appointments.status", { default: "Status" })}: <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{post.status}</Badge></p>
                       {post.tags && post.tags.length > 0 && <p className="text-xs mt-2 text-muted-foreground">{t("appointments.tags", { default: "Tags" })}: {post.tags.join(', ')}</p>}
                    </CardContent>
                     <CardFooter className="flex justify-end">
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/community-feed#post-${post.id}`}>{t("appointments.viewOnFeed", { default: "View on Feed" })}</Link>
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
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("appointments.rescheduleTitle", { default: "Reschedule Appointment" })}</DialogTitle>
            <CardDescription>{t("appointments.rescheduleDesc", { default: "Suggest a new time for your appointment with {user}", user: getPartnerDetails(appointmentToReschedule!)?.name || "" })}</CardDescription>
          </DialogHeader>
          {appointmentToReschedule && (
            <form onSubmit={handleRescheduleSubmit(onRescheduleSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rescheduleDate">{t("appointments.newPreferredDate", { default: "New Preferred Date" })}</Label>
                  <Controller name="preferredDate" control={rescheduleControl} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
                  {rescheduleErrors.preferredDate && <p className="text-sm text-destructive mt-1">{rescheduleErrors.preferredDate.message}</p>}
                </div>
                <div>
                  <Label htmlFor="rescheduleTimeSlot">{t("appointments.newPreferredTimeSlot", { default: "New Preferred Time Slot" })}</Label>
                  <Controller name="preferredTimeSlot" control={rescheduleControl} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="rescheduleTimeSlot"><SelectValue placeholder={t("appointments.selectTimeSlot", { default: "Select time slot" })} /></SelectTrigger>
                      <SelectContent>
                        {PreferredTimeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  {rescheduleErrors.preferredTimeSlot && <p className="text-sm text-destructive mt-1">{rescheduleErrors.preferredTimeSlot.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="rescheduleMessage">{t("appointments.messageOptional", { default: "Brief Message (Optional)" })}</Label>
                <Controller name="message" control={rescheduleControl} render={({ field }) => <Textarea id="rescheduleMessage" placeholder={t("appointments.rescheduleReason", { default: "e.g., Conflict with another meeting" })} rows={3} {...field} />} />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">{t("common.cancel", { default: "Cancel" })}</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground"><CalendarPlus className="mr-2 h-4 w-4"/> {t("appointments.requestReschedule", { default: "Request Reschedule" })}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
 <DialogHeader><DialogTitle className="text-2xl">{t("appointments.provideFeedbackTitle", { default: "Provide Feedback" })}</DialogTitle><CardDescription>{t("appointments.provideFeedbackDesc", { default: "Share your thoughts on the session with {user}", user: getPartnerDetails(appointmentForFeedback!)?.name || "" })}</CardDescription></DialogHeader>
            {appointmentForFeedback && (
                <form onSubmit={handleFeedbackSubmit(onFeedbackSubmit)} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="rating">{t("appointments.overallRating", { default: "Overall Rating" })}</Label>
                        <Controller name="rating" control={feedbackControl} render={({ field }) => (
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || 0)}>
                                <SelectTrigger id="rating"><SelectValue placeholder={t("appointments.selectRating", { default: "Select a rating (1-5)" })} /></SelectTrigger>
                                <SelectContent>
                                    {[1,2,3,4,5].map(r => <SelectItem key={r} value={String(r)}>{r} Star{r > 1 ? 's' : ''}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )} />
                         {feedbackErrors.rating && <p className="text-sm text-destructive mt-1">{feedbackErrors.rating.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="comments">{t("appointments.commentsOptional", { default: "Comments (Optional)" })}</Label>
                        <Controller name="comments" control={feedbackControl} render={({ field }) => <Textarea id="comments" placeholder={t("appointments.whatWentWell", { default: "What went well? Any areas for improvement?" })} rows={4} {...field} />} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">{t("common.cancel", { default: "Cancel" })}</Button></DialogClose>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground"><FeedbackIcon className="mr-2 h-4 w-4"/> {t("common.submit", { default: "Submit" })}</Button>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
