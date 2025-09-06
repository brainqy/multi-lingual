
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { JobApplication, JobApplicationStatus, ResumeProfile, Interview } from "@/types";
import { JOB_APPLICATION_STATUSES } from "@/types";
import { useI18n } from "@/hooks/use-i18n";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const logger = (component: string) => ({
  log: (message: string, ...args: any[]) => console.log(`[JobApplicationDialog][${component}] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[JobApplicationDialog][${component}] ${message}`, ...args),
});
const dialogLogger = logger("MainDialog");

const jobApplicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  status: z.enum(JOB_APPLICATION_STATUSES as [JobApplicationStatus, ...JobApplicationStatus[]]),
  dateApplied: z.string().min(1, "Date applied is required").refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  notes: z.array(z.string()).optional(),
  jobDescription: z.string().optional(),
  location: z.string().optional(),
  applicationUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  salary: z.string().optional(),
  resumeIdUsed: z.string().optional(),
  coverLetterText: z.string().optional(),
});

type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

// This type represents the form data for a new interview before it's saved.
type NewInterviewFormData = Omit<Interview, 'id' | 'jobApplicationId'>;


interface JobApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (applicationData: Partial<Omit<JobApplication, 'id' | 'interviews'>>, interviews: Interview[]) => void;
  onDelete: (applicationId: string) => void;
  editingApplication: JobApplication | null;
  resumes: ResumeProfile[];
}

export default function JobApplicationDialog({ isOpen, onClose, onSave, onDelete, editingApplication, resumes }: JobApplicationDialogProps) {
  dialogLogger.log("Component rendering or re-rendering.", { isOpen, editingApplicationId: editingApplication?.id });
  const { t } = useI18n();
  const { toast } = useToast();
  const [currentInterviews, setCurrentInterviews] = useState<Interview[]>([]);
  const [newInterview, setNewInterview] = useState<NewInterviewFormData>({ date: '', type: 'Phone Screen', interviewer: '' });
  const [currentNotes, setCurrentNotes] = useState<string[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
  });

  useEffect(() => {
    dialogLogger.log("useEffect triggered for editingApplication change.", { editingApplicationId: editingApplication?.id });
    if (editingApplication) {
      const dateApplied = editingApplication.dateApplied;
      const dateToFormat = typeof dateApplied === 'string'
        ? parseISO(dateApplied)
        : dateApplied;

      const formData = {
        ...editingApplication,
        dateApplied: format(dateToFormat, 'yyyy-MM-dd'),
        notes: editingApplication.notes || [],
      };
      reset(formData);
      setCurrentInterviews(editingApplication.interviews || []);
      setCurrentNotes(editingApplication.notes || []);
      dialogLogger.log("Form reset with existing application data.", { formData });
    } else {
      const defaultData = {
        companyName: '', jobTitle: '', status: 'Saved', dateApplied: new Date().toISOString().split('T')[0],
        notes: [], jobDescription: '', location: '', applicationUrl: '', salary: '', resumeIdUsed: '', coverLetterText: ''
      };
      reset(defaultData);
      setCurrentInterviews([]);
      setCurrentNotes([]);
      dialogLogger.log("Form reset with default data for new application.", { defaultData });
    }
  }, [editingApplication, reset]);

  const onSubmit = (data: JobApplicationFormData) => {
    dialogLogger.log("onSubmit called with form data.", { data });
    onSave({ ...data, notes: currentNotes }, currentInterviews);
    dialogLogger.log("onSubmit finished, onSave prop called.");
  };

  const handleAddInterview = () => {
    dialogLogger.log("handleAddInterview called.", { newInterview });
    if (!newInterview.date || !newInterview.interviewer) {
      toast({ title: t("jobTracker.toast.missingInterviewInfo.title"), description: t("jobTracker.toast.missingInterviewInfo.description"), variant: "destructive" });
      dialogLogger.error("handleAddInterview failed: missing info.");
      return;
    }
    setCurrentInterviews(prev => {
      const newInterviews = [...prev, { id: `int-${Date.now()}`, jobApplicationId: editingApplication?.id || 'temp', ...newInterview }];
      dialogLogger.log("handleAddInterview: updating interviews state.", { newInterviewsCount: newInterviews.length });
      return newInterviews;
    });
    setNewInterview({ date: '', type: 'Phone Screen', interviewer: '' });
    dialogLogger.log("handleAddInterview finished, cleared new interview form.");
  };

  const handleRemoveInterview = (interviewId: string) => {
    dialogLogger.log("handleRemoveInterview called.", { interviewId });
    setCurrentInterviews(prev => prev.filter(int => int.id !== interviewId));
    dialogLogger.log("handleRemoveInterview finished.");
  };
  
  const handleAddNote = () => {
    dialogLogger.log("handleAddNote called.", { newNoteContent });
    if (newNoteContent.trim()) {
      setCurrentNotes(prev => {
        const newNotes = [newNoteContent.trim(), ...prev];
        dialogLogger.log("handleAddNote: updating notes state.", { newNotesCount: newNotes.length });
        return newNotes;
      });
      setNewNoteContent('');
      dialogLogger.log("handleAddNote finished, cleared new note input.");
    }
  };

  const handleRemoveNote = (index: number) => {
    dialogLogger.log("handleRemoveNote called.", { index });
    setCurrentNotes(prev => prev.filter((_, i) => i !== index));
    dialogLogger.log("handleRemoveNote finished.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl">{editingApplication ? t("jobTracker.editJob", { default: "Edit Job Application" }) : t("jobTracker.addNewJob", { default: "Add New Job Application" })}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-hidden flex flex-col">
          <Tabs defaultValue="jobDetails" className="w-full flex-grow flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-5 shrink-0 h-10">
              <TabsTrigger value="jobDetails">{t("jobTracker.dialog.jobDetails", { default: "Job Details" })}</TabsTrigger>
              <TabsTrigger value="resume">{t("jobTracker.dialog.resume", { default: "Resume" })}</TabsTrigger>
              <TabsTrigger value="coverLetter">{t("jobTracker.dialog.coverLetter", { default: "Cover Letter" })}</TabsTrigger>
              <TabsTrigger value="interviews">{t("jobTracker.dialog.interviews", { default: "Interviews" })}</TabsTrigger>
              <TabsTrigger value="notes">{t("jobTracker.dialog.notes", { default: "Notes" })}</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-grow mt-4">
              <div className="px-1 pr-4">
                <TabsContent value="jobDetails" className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Controller name="companyName" control={control} render={({ field }) => <Input id="companyName" {...field} />} />
                            {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>}
                        </div>
                         <div>
                            <Label htmlFor="jobTitle">Job Title *</Label>
                            <Controller name="jobTitle" control={control} render={({ field }) => <Input id="jobTitle" {...field} />} />
                             {errors.jobTitle && <p className="text-sm text-destructive mt-1">{errors.jobTitle.message}</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="status">Status *</Label>
                            <Controller name="status" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{JOB_APPLICATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            )} />
                        </div>
                         <div>
                            <Label htmlFor="dateApplied">Date Applied *</Label>
                            <Controller name="dateApplied" control={control} render={({ field }) => <Input id="dateApplied" type="date" {...field} />} />
                            {errors.dateApplied && <p className="text-sm text-destructive mt-1">{errors.dateApplied.message}</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="location">Location</Label>
                            <Controller name="location" control={control} render={({ field }) => <Input id="location" {...field} />} />
                        </div>
                         <div>
                            <Label htmlFor="salary">Salary (Optional)</Label>
                            <Controller name="salary" control={control} render={({ field }) => <Input id="salary" {...field} />} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="applicationUrl">Application URL (Optional)</Label>
                        <Controller name="applicationUrl" control={control} render={({ field }) => <Input id="applicationUrl" {...field} />} />
                         {errors.applicationUrl && <p className="text-sm text-destructive mt-1">{errors.applicationUrl.message}</p>}
                    </div>
                     <div>
                        <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                        <Controller name="jobDescription" control={control} render={({ field }) => <Textarea id="jobDescription" rows={6} {...field} />} />
                    </div>
                </TabsContent>
                <TabsContent value="resume">
                    <div className="space-y-4">
                      <Label htmlFor="resumeIdUsed">Resume Used</Label>
                      <Controller name="resumeIdUsed" control={control} render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select a resume profile..."/></SelectTrigger>
                              <SelectContent>
                                  {resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      )} />
                      <Button variant="outline" asChild><Link href="/my-resumes">Manage Resumes</Link></Button>
                    </div>
                </TabsContent>
                <TabsContent value="coverLetter">
                     <div className="space-y-4">
                      <Label htmlFor="coverLetterText">Cover Letter</Label>
                      <Controller name="coverLetterText" control={control} render={({ field }) => <Textarea id="coverLetterText" rows={12} {...field} />} />
                      <Button variant="outline" asChild><Link href="/cover-letter-generator">Generate with AI</Link></Button>
                    </div>
                </TabsContent>
                <TabsContent value="interviews">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Scheduled Interviews</h4>
                      {currentInterviews.length > 0 ? (
                         <ul className="space-y-2">
                           {currentInterviews.map(interview => {
                             const interviewDate = typeof interview.date === 'string' ? parseISO(interview.date) : interview.date;
                             return (
                               <li key={interview.id} className="p-2 border rounded-md flex justify-between items-center text-sm">
                                   <div>
                                     <p className="font-medium">{interview.type} with {interview.interviewer}</p>
                                     <p className="text-xs text-muted-foreground">{format(interviewDate, 'PPpp')}</p>
                                   </div>
                                   <Button variant="ghost" size="icon" onClick={() => handleRemoveInterview(interview.id!)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                               </li>
                             )
                           })}
                         </ul>
                      ) : <p className="text-sm text-muted-foreground">No interviews scheduled yet.</p>}

                      <Card className="p-4 bg-secondary/50">
                        <h5 className="font-semibold mb-2">Add New Interview</h5>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <Label>Date & Time</Label>
                                  <Input type="datetime-local" value={newInterview.date} onChange={e => setNewInterview(p => ({...p, date: e.target.value}))} />
                              </div>
                              <div>
                                  <Label>Type</Label>
                                  <Select value={newInterview.type} onValueChange={val => setNewInterview(p => ({...p, type: val as any}))}>
                                      <SelectTrigger><SelectValue/></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="Phone Screen">Phone Screen</SelectItem>
                                          <SelectItem value="Technical">Technical</SelectItem>
                                          <SelectItem value="Behavioral">Behavioral</SelectItem>
                                          <SelectItem value="On-site">On-site</SelectItem>
                                          <SelectItem value="Final Round">Final Round</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                         </div>
                         <div className="mt-4">
                             <Label>Interviewer Name</Label>
                             <Input value={newInterview.interviewer} onChange={e => setNewInterview(p => ({...p, interviewer: e.target.value}))}/>
                         </div>
                         <Button type="button" onClick={handleAddInterview} className="mt-4">Add Interview</Button>
                      </Card>
                    </div>
                </TabsContent>
                <TabsContent value="notes">
                    <div className="space-y-4">
                       <h4 className="font-semibold">Notes</h4>
                        <div className="flex gap-2">
                          <Textarea value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} placeholder="Add a new note..." rows={2}/>
                          <Button type="button" onClick={handleAddNote}>Add Note</Button>
                        </div>
                        <ScrollArea className="h-64 pr-3">
                          <div className="space-y-3">
                            {currentNotes.map((note, index) => (
                              <Card key={index} className="p-3">
                                <div className="flex justify-between items-start">
                                  <p className="text-xs text-muted-foreground">{format(new Date(), 'yyyy-MM-dd')}</p>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveNote(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                                <p className="text-sm">{note}</p>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                    </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
          <DialogFooter className="pt-4 border-t shrink-0 flex justify-between w-full">
            <div>
              {editingApplication && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this job application.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(editingApplication.id)} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-2">
                <DialogClose asChild><Button type="button" variant="outline">{t("jobTracker.dialog.close", { default: "Close" })}</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{t("jobTracker.dialog.save", { default: "Save" })}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
