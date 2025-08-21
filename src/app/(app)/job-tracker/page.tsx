
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription as DialogUIDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit3, Trash2, GripVertical, Search, FileText, Clock, Bookmark, CalendarDays, Loader2 } from "lucide-react";
import type { JobApplication, JobApplicationStatus, ResumeScanHistoryItem, KanbanColumnId, JobOpening, ResumeProfile, Interview } from "@/types"; 
import { JOB_APPLICATION_STATUSES } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserJobApplications, createJobApplication, updateJobApplication, deleteJobApplication, getJobOpenings } from "@/lib/actions/jobs";
import { getResumeProfiles } from "@/lib/actions/resumes";
import { useAuth } from "@/hooks/use-auth";

import {
  DropdownMenu, DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Note {
  date: string;
  content: string;
  editable?: boolean;
}

const interviewSchema = z.object({
  id: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date"}),
  type: z.enum(['Phone Screen', 'Technical', 'Behavioral', 'On-site', 'Final Round']),
  interviewer: z.string().min(1, "Interviewer name is required."),
  interviewerEmail: z.string().email().optional().or(z.literal('')),
  interviewerMobile: z.string().optional(),
  notes: z.array(z.string()).optional(),
});

const jobApplicationSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  status: z.enum(JOB_APPLICATION_STATUSES as [JobApplicationStatus, ...JobApplicationStatus[]]),
  dateApplied: z.string().min(1, "Date applied is required").refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date"}),
  notes: z.array(z.string()).optional(),
  jobDescription: z.string().optional(),
  location: z.string().optional(),
  applicationUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  salary: z.string().optional(),
  resumeIdUsed: z.string().optional(),
  coverLetterText: z.string().optional(),
  interviews: z.array(interviewSchema).optional(),
});


type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

const KANBAN_COLUMNS_CONFIG: { id: KanbanColumnId; titleKey: string; descriptionKey: string; acceptedStatuses: JobApplicationStatus[] }[] = [
  { id: 'Saved', titleKey: 'jobTracker.kanban.Saved.title', descriptionKey: 'jobTracker.kanban.Saved.description', acceptedStatuses: ['Saved'] },
  { id: 'Applied', titleKey: 'jobTracker.kanban.Applied.title', descriptionKey: 'jobTracker.kanban.Applied.description', acceptedStatuses: ['Applied'] },
  { id: 'Interviewing', titleKey: 'jobTracker.kanban.Interviewing.title', descriptionKey: 'jobTracker.kanban.Interviewing.description', acceptedStatuses: ['Interviewing'] },
  { id: 'Offer', titleKey: 'jobTracker.kanban.Offer.title', descriptionKey: 'jobTracker.kanban.Offer.description', acceptedStatuses: ['Offer'] },
];

function JobCard({ application, onEdit, onDelete, onMove }: { application: JobApplication, onEdit: (app: JobApplication) => void, onDelete: (id: string) => void, onMove: (appId: string, newStatus: JobApplicationStatus) => void }) {
  const { t } = useI18n();
  return (
    <Card className="mb-3 shadow-md bg-card hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => onEdit(application)}>
      <CardContent className="p-3 space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-sm text-foreground">{application.jobTitle}</h4>
            <p className="text-xs text-muted-foreground">{application.companyName}</p>
            {application.location && <p className="text-xs text-muted-foreground">{application.location}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                <GripVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onEdit(application)}>
                <Edit3 className="mr-2 h-4 w-4" /> {t("jobTracker.dialog.edit", { default: "Edit" })}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t("jobTracker.dialog.moveTo", { default: "Move to" })}</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {KANBAN_COLUMNS_CONFIG.map(col => (
                       col.acceptedStatuses[0] !== application.status &&
                        <DropdownMenuItem key={col.id} onClick={() => onMove(application.id, col.acceptedStatuses[0])}>
                          {t(col.titleKey, { default: col.id })}
                        </DropdownMenuItem>
                    ))}
                    {application.status !== 'Rejected' &&
                        <DropdownMenuItem onClick={() => onMove(application.id, 'Rejected')}>{t("jobTracker.statuses.Rejected", { default: "Rejected" })}</DropdownMenuItem>
                    }
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(application.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> {t("jobTracker.dialog.delete", { default: "Delete" })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {application.reminderDate && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {t("jobTracker.dialog.reminder", { default: "Reminder" })}: {format(parseISO(application.reminderDate), 'MMM dd, yyyy')}
            </p>
        )}
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ column, applications, onEdit, onDelete, onMove }: { column: { id: KanbanColumnId; title: string; description: string; acceptedStatuses: JobApplicationStatus[] }, applications: JobApplication[], onEdit: (app: JobApplication) => void, onDelete: (id: string) => void, onMove: (appId: string, newStatus: JobApplicationStatus) => void }) {
  const { t } = useI18n();
  return (
    <Card className="w-full md:w-72 lg:w-80 flex-shrink-0 bg-secondary/50 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-md font-semibold">{column.title} ({applications.length})</CardTitle>
        <CardDescription className="text-xs">{column.description}</CardDescription>
      </CardHeader>
      <ScrollArea className="flex-grow p-4 pt-0">
        {applications.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-md p-6 text-center text-muted-foreground h-24 flex items-center justify-center mt-4">
            {t("jobTracker.dialog.dragJobsHere", { default: "Drag jobs here" })}
          </div>
        ) : (
          applications.map(app => (
            <JobCard key={app.id} application={app} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />
          ))
        )
        }
      </ScrollArea>
    </Card>
  );
}


export default function JobTrackerPage() {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [resumes, setResumes] = useState<ResumeProfile[]>([]);
  const { toast } = useToast();
  
  const [currentInterviews, setCurrentInterviews] = useState<Interview[]>([]);
  const [newInterview, setNewInterview] = useState<Omit<Interview, 'id'>>({ date: '', type: 'Phone Screen', interviewer: '' });
  const [currentNotes, setCurrentNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const { control, handleSubmit, reset, setValue } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: { status: 'Saved', dateApplied: new Date().toISOString().split('T')[0] }
  });

  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [jobSearchResults, setJobSearchResults] = useState<JobOpening[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const [userApps, userResumes] = await Promise.all([
      getUserJobApplications(currentUser.id),
      getResumeProfiles(currentUser.id),
    ]);
    setApplications(userApps);
    setResumes(userResumes);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJobSearch = async () => {
    setHasSearched(true);
    const allOpenings = await getJobOpenings();
    const filtered = allOpenings.filter(job => {
      const matchesKeywords = searchKeywords.trim() === '' ||
        job.title.toLowerCase().includes(searchKeywords.trim().toLowerCase()) ||
        job.company.toLowerCase().includes(searchKeywords.trim().toLowerCase()) ||
        job.description.toLowerCase().includes(searchKeywords.trim().toLowerCase());
      const matchesLocation = searchLocation.trim() === '' ||
        job.location.toLowerCase().includes(searchLocation.trim().toLowerCase());
      return matchesKeywords && matchesLocation;
    });
    setJobSearchResults(filtered);
    if (filtered.length === 0) {
      toast({title: t("jobTracker.toast.noJobsFound.title"), description: t("jobTracker.toast.noJobsFound.description")});
    }
  };

  const handleAddSearchedJobToTracker = async (job: JobOpening) => {
    if (!currentUser) return;
    const alreadyExists = applications.some(app => app.sourceJobOpeningId === job.id);
    if (alreadyExists) {
      toast({ title: t("jobTracker.toast.alreadyInTracker.title"), description: t("jobTracker.toast.alreadyInTracker.description"), variant: "default" });
      return;
    }

    const newApplicationData = {
      tenantId: job.tenantId,
      userId: currentUser.id,
      companyName: job.company,
      jobTitle: job.title,
      status: 'Saved' as JobApplicationStatus,
      dateApplied: new Date().toISOString(),
      notes: ['Added from job board search.'],
      jobDescription: job.description,
      location: job.location,
      sourceJobOpeningId: job.id,
      applicationUrl: job.applicationLink,
    };
    
    const newApp = await createJobApplication(newApplicationData as Omit<JobApplication, 'id' | 'interviews'>);
    if(newApp) {
      setApplications(prevApps => [newApp, ...prevApps]);
      toast({ title: t("jobTracker.toast.jobAdded.title"), description: t("jobTracker.toast.jobAdded.description", { jobTitle: job.title, companyName: newApp.companyName }) });
    } else {
      toast({ title: "Error", description: "Could not add job to tracker.", variant: "destructive" });
    }
  };

  const onSubmit = async (data: JobApplicationFormData) => {
    if (!currentUser) return;
    const applicationData = {
      ...data,
      interviews: currentInterviews,
      notes: currentNotes.map(n => n.content),
      dateApplied: data.dateApplied ? new Date(data.dateApplied).toISOString() : new Date().toISOString()
    };

    if (editingApplication) {
      const updatedApp = await updateJobApplication(editingApplication.id, applicationData);
      if (updatedApp) {
        setApplications(apps => apps.map(app => app.id === editingApplication.id ? updatedApp : app));
        toast({ title: t("jobTracker.toast.appUpdated.title"), description: t("jobTracker.toast.appUpdated.description", { jobTitle: data.jobTitle, companyName: data.companyName }) });
      } else {
        toast({ title: "Error", description: "Failed to update application.", variant: "destructive"});
      }
    } else {
      const newApp = await createJobApplication({
        ...applicationData,
        userId: currentUser.id,
        tenantId: currentUser.tenantId
      });
      if(newApp) {
        setApplications(apps => [newApp, ...apps]);
        toast({ title: t("jobTracker.toast.appAdded.title"), description: t("jobTracker.toast.appAdded.description", { jobTitle: data.jobTitle, companyName: data.companyName }) });
      } else {
        toast({ title: "Error", description: "Failed to add application.", variant: "destructive"});
      }
    }
    setIsDialogOpen(false);
  };

  const handleEdit = (app: JobApplication) => {
    setEditingApplication(app);
    const dateToFormat = app.dateApplied instanceof Date ? app.dateApplied : parseISO(app.dateApplied);
    reset({
        companyName: app.companyName,
        jobTitle: app.jobTitle,
        status: app.status,
        dateApplied: format(dateToFormat, 'yyyy-MM-dd'),
        jobDescription: app.jobDescription || '',
        location: app.location || '',
        applicationUrl: app.applicationUrl || '',
        salary: app.salary || '',
        resumeIdUsed: app.resumeIdUsed || '',
        coverLetterText: app.coverLetterText || '',
        interviews: app.interviews,
    });
    setCurrentInterviews(app.interviews || []);
    const initialNotes = (app.notes || [])
      .map((noteContent) => ({
        date: format(new Date(), 'yyyy-MM-dd'), 
        content: noteContent,
        editable: false
      }));
    setCurrentNotes(initialNotes);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteJobApplication(id);
    if(success) {
      setApplications(apps => apps.filter(app => app.id !== id));
      toast({ title: t("jobTracker.toast.appDeleted.title"), description: t("jobTracker.toast.appDeleted.description") });
    } else {
      toast({ title: "Error", description: "Failed to delete application.", variant: "destructive"});
    }
  };

  const handleMoveApplication = async (appId: string, newStatus: JobApplicationStatus) => {
    const updatedApp = await updateJobApplication(appId, { status: newStatus });
    if(updatedApp) {
      setApplications(prevApps => prevApps.map(app => app.id === appId ? updatedApp : app));
      toast({ title: t("jobTracker.toast.appMoved.title"), description: t("jobTracker.toast.appMoved.description", { jobTitle: updatedApp.jobTitle, newStatus: t(`jobTracker.statuses.${newStatus}`) }) });
    } else {
      toast({ title: "Error", description: "Could not move application.", variant: "destructive" });
    }
  };

  const openNewApplicationDialog = () => {
    setEditingApplication(null);
    reset({ companyName: '', jobTitle: '', status: 'Saved', dateApplied: new Date().toISOString().split('T')[0], notes: [], jobDescription: '', location: '', applicationUrl: '', salary: '' });
    setCurrentInterviews([]);
    setCurrentNotes([]);
    setIsDialogOpen(true);
  };
  
  const handleAddInterview = () => {
    if(!newInterview.date || !newInterview.interviewer) {
        toast({title: t("jobTracker.toast.missingInterviewInfo.title"), description: t("jobTracker.toast.missingInterviewInfo.description"), variant: "destructive"});
        return;
    }
    setCurrentInterviews(prev => [...prev, {id: `int-${Date.now()}`, ...newInterview}]);
    setNewInterview({ date: '', type: 'Phone Screen', interviewer: ''});
  };

  const handleRemoveInterview = (interviewId: string) => {
    setCurrentInterviews(prev => prev.filter(int => int.id !== interviewId));
  }

  const handleOpenInterviewModal = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsInterviewModalOpen(true);
  }
  
  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        date: format(new Date(), 'yyyy-MM-dd'),
        content: newNoteContent.trim(),
        editable: false,
      };
      setCurrentNotes(prev => [newNote, ...prev]);
      setNewNoteContent('');
    }
  };

  const handleEditNote = (index: number) => {
    setCurrentNotes(prev => prev.map((note, i) => i === index ? { ...note, editable: true } : note));
  };

  const handleSaveNote = (index: number, newContent: string) => {
    setCurrentNotes(prev => prev.map((note, i) => i === index ? { ...note, content: newContent, editable: false } : note));
  };

  const handleRemoveNote = (index: number) => {
    setCurrentNotes(prev => prev.filter((_, i) => i !== index));
  };

  const getAppsForColumn = (column: { acceptedStatuses: JobApplicationStatus[]; }): JobApplication[] => {
    return applications.filter(app => column.acceptedStatuses.includes(app.status));
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 p-0 -m-4 sm:-m-6 lg:-m-8"> 
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("jobTracker.title", { default: "Job Application Tracker" })}</h1>
        <Button onClick={openNewApplicationDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> {t("jobTracker.addJob", { default: "Add Job" })}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-4 overflow-y-auto md:overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        <Card className="w-full md:w-72 flex-shrink-0 shadow-lg h-full flex flex-col">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-md font-semibold">{t("jobTracker.jobs", { default: "Jobs" })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-grow flex flex-col">
            <div>
              <Label htmlFor="search-job-keywords">{t("jobTracker.searchJob", { default: "Search Jobs" })}</Label>
              <Input 
                id="search-job-keywords" 
                placeholder={t("jobTracker.keywordsPlaceholder", { default: "Keywords (e.g., 'React')" })}
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="search-job-location">{t("jobTracker.location", { default: "Location" })}</Label>
              <Input 
                id="search-job-location" 
                placeholder={t("jobTracker.locationPlaceholder", { default: "e.g., 'Remote'" })}
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleJobSearch}>
              <Search className="mr-2 h-4 w-4" /> {t("jobTracker.search", { default: "Search" })}
            </Button>
            
            <ScrollArea className="flex-grow mt-3 border-2 border-dashed border-border rounded-md p-2 min-h-[200px]">
              {hasSearched && jobSearchResults.length === 0 && (
 <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {t("jobTracker.noJobsFound", { default: "No jobs found." })}
                </div>
              )}
              {!hasSearched && jobSearchResults.length === 0 && (
                 <div className="h-full flex items-center justify-center text-muted-foreground text-center text-sm p-4">
                  {t("jobTracker.searchHint", { default: "Search for jobs on external platforms and add them to your tracker." })}
                </div>
              )}
              {jobSearchResults.length > 0 && (
                <div className="space-y-2">
                  {jobSearchResults.map(job => (
                    <Card key={job.id} className="p-2.5 bg-card shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                      <h5 className="text-xs font-semibold text-foreground truncate" title={job.title}>{job.title}</h5>
                      <p className="text-[10px] text-muted-foreground truncate" title={job.company}>{job.company}</p>
                      <p className="text-[10px] text-muted-foreground truncate" title={job.location}>{job.location}</p>
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="mt-1.5 w-full h-7 text-[10px] py-0.5"
                        onClick={() => handleAddSearchedJobToTracker(job)}
                      >
                        {t("jobTracker.addToSaved", { default: "Add to Saved" })}
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/job-board">{t("jobTracker.findMoreJobs", { default: "Find More Jobs on Board" })}</Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col md:flex-row flex-1 gap-4 h-full">
          {KANBAN_COLUMNS_CONFIG.map((colConfig) => (
            <KanbanColumn
              key={colConfig.id}
              column={{
                ...colConfig,
                title: t(colConfig.titleKey, { default: colConfig.id }),
                description: t(colConfig.descriptionKey, { default: `Jobs in ${colConfig.id} state`})
              }}
              applications={getAppsForColumn(colConfig)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMove={handleMoveApplication}
            />
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) {
            setEditingApplication(null);
            reset({ companyName: '', jobTitle: '', status: 'Saved', dateApplied: new Date().toISOString().split('T')[0], notes: [], jobDescription: '', location: '', applicationUrl: '', salary: '' });
            setCurrentInterviews([]);
            setCurrentNotes([]);
        }
      }}>
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
                              <Label htmlFor="companyName">Company Name</Label>
                              <Controller name="companyName" control={control} render={({ field }) => <Input id="companyName" {...field} />} />
                          </div>
                           <div>
                              <Label htmlFor="jobTitle">Job Title</Label>
                              <Controller name="jobTitle" control={control} render={({ field }) => <Input id="jobTitle" {...field} />} />
                          </div>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <Label htmlFor="status">Status</Label>
                              <Controller name="status" control={control} render={({ field }) => (
                                  <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger><SelectValue/></SelectTrigger>
                                      <SelectContent>{JOB_APPLICATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                  </Select>
                              )} />
                          </div>
                           <div>
                              <Label htmlFor="dateApplied">Date Applied</Label>
                              <Controller name="dateApplied" control={control} render={({ field }) => <Input id="dateApplied" type="date" {...field} />} />
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
                             {currentInterviews.map(interview => (
                               <li key={interview.id} className="p-2 border rounded-md flex justify-between items-center text-sm">
                                   <div>
                                     <p className="font-medium">{interview.type} with {interview.interviewer}</p>
                                     <p className="text-xs text-muted-foreground">{format(parseISO(interview.date), 'PPpp')}</p>
                                   </div>
                                   <Button variant="ghost" size="icon" onClick={() => handleRemoveInterview(interview.id!)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                               </li>
                             ))}
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
                                    <p className="text-xs text-muted-foreground">{note.date}</p>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveNote(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                  </div>
                                  <p className="text-sm">{note.content}</p>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                      </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
            <DialogFooter className="pt-4 border-t shrink-0">
              <DialogClose asChild><Button type="button" variant="outline">{t("jobTracker.dialog.close", { default: "Close" })}</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{t("jobTracker.dialog.save", { default: "Save" })}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
