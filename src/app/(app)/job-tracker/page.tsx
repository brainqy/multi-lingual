
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit3, Trash2, GripVertical, Search, FileText, Clock, Bookmark, CalendarDays } from "lucide-react";
import { sampleJobApplications, sampleJobOpenings, sampleUserProfile, sampleResumeProfiles } from "@/lib/sample-data"; 
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const interviewSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.enum(['Phone Screen', 'Technical', 'Behavioral', 'On-site', 'Final Round']),
  interviewer: z.string(),
  interviewerEmail: z.string().email().optional(),
  interviewerMobile: z.string().optional(),
  notes: z.string().optional(),
});

const jobApplicationSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  status: z.enum(JOB_APPLICATION_STATUSES as [JobApplicationStatus, ...JobApplicationStatus[]]),
  dateApplied: z.string().min(1, "Date applied is required").refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date"}),
  notes: z.string().optional(),
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
  const [applications, setApplications] = useState<JobApplication[]>(sampleJobApplications.filter(app => app.userId === sampleUserProfile.id));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [resumes, setResumes] = useState<ResumeProfile[]>([]);
  const { toast } = useToast();
  
  // State for Interviews tab within the dialog
  const [currentInterviews, setCurrentInterviews] = useState<Interview[]>([]);
  const [newInterview, setNewInterview] = useState<Omit<Interview, 'id'>>({ date: '', type: 'Phone Screen', interviewer: '', interviewerMobile: '',
  interviewerEmail: '', notes: ''});

  const { control, handleSubmit, reset, setValue } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: { status: 'Saved', dateApplied: new Date().toISOString().split('T')[0] }
  });

  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [jobSearchResults, setJobSearchResults] = useState<JobOpening[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setResumes(sampleResumeProfiles.filter(r => r.userId === sampleUserProfile.id));
  }, []);

  const handleJobSearch = () => {
    setHasSearched(true);
    const filtered = sampleJobOpenings.filter(job => {
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

  const handleAddSearchedJobToTracker = (job: JobOpening) => {
    const alreadyExists = applications.some(app => app.sourceJobOpeningId === job.id);
    if (alreadyExists) {
      toast({ title: t("jobTracker.toast.alreadyInTracker.title"), description: t("jobTracker.toast.alreadyInTracker.description"), variant: "default" });
      return;
    }

    const newApplication: JobApplication = {
      id: `app-${job.id}-${Date.now()}`,
      tenantId: job.tenantId,
      userId: sampleUserProfile.id,
      companyName: job.company,
      jobTitle: job.title,
      status: 'Saved',
      dateApplied: new Date().toISOString().split('T')[0],
      notes: 'Added from job board search.',
      jobDescription: job.description,
      location: job.location,
      sourceJobOpeningId: job.id,
      applicationUrl: job.applicationLink,
    };
    setApplications(prevApps => [newApplication, ...prevApps]);
    toast({ title: t("jobTracker.toast.jobAdded.title"), description: t("jobTracker.toast.jobAdded.description", { jobTitle: job.title, companyName: job.company }) });
  };

  const onSubmit = (data: JobApplicationFormData) => {
    const applicationData = { ...data, interviews: currentInterviews };

    if (editingApplication) {
      setApplications(apps => apps.map(app => app.id === editingApplication.id ? { ...app, ...applicationData, status: data.status as JobApplicationStatus, salary: data.salary } : app));
      toast({ title: t("jobTracker.toast.appUpdated.title"), description: t("jobTracker.toast.appUpdated.description", { jobTitle: data.jobTitle, companyName: data.companyName }) });
    } else {
      const newApp: JobApplication = { ...applicationData, id: String(Date.now()), status: data.status as JobApplicationStatus, tenantId: sampleUserProfile.tenantId, userId: sampleUserProfile.id };
      setApplications(apps => [newApp, ...apps]);
      toast({ title: t("jobTracker.toast.appAdded.title"), description: t("jobTracker.toast.appAdded.description", { jobTitle: data.jobTitle, companyName: data.companyName }) });
    }
    setIsDialogOpen(false);
  };

  const handleEdit = (app: JobApplication) => {
    setEditingApplication(app);
    reset({
        companyName: app.companyName,
        jobTitle: app.jobTitle,
        status: app.status,
        dateApplied: app.dateApplied,
        notes: app.notes || '',
        jobDescription: app.jobDescription || '',
        location: app.location || '',
        applicationUrl: app.applicationUrl || '',
        salary: app.salary || '',
        resumeIdUsed: app.resumeIdUsed || '',
        coverLetterText: app.coverLetterText || '',
    });
    setCurrentInterviews(app.interviews || []);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setApplications(apps => apps.filter(app => app.id !== id));
    toast({ title: t("jobTracker.toast.appDeleted.title"), description: t("jobTracker.toast.appDeleted.description") });
  };

  const handleMoveApplication = (appId: string, newStatus: JobApplicationStatus) => {
    setApplications(prevApps => prevApps.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    const app = applications.find(a => a.id === appId);
    if (app) {
      toast({ title: t("jobTracker.toast.appMoved.title"), description: t("jobTracker.toast.appMoved.description", { jobTitle: app.jobTitle, newStatus: t(`jobTracker.statuses.${newStatus}`) }) });
    }
  };

  const openNewApplicationDialog = () => {
    setEditingApplication(null);
    reset({ companyName: '', jobTitle: '', status: 'Saved', dateApplied: new Date().toISOString().split('T')[0], notes: '', jobDescription: '', location: '', applicationUrl: '', salary: '', resumeIdUsed: '', coverLetterText: '' });
    setCurrentInterviews([]);
    setIsDialogOpen(true);
  };
  
  const handleAddInterview = () => {
    if(!newInterview.date || !newInterview.interviewer) {
        toast({title: t("jobTracker.toast.missingInterviewInfo.title"), description: t("jobTracker.toast.missingInterviewInfo.description"), variant: "destructive"});
        return;
    }
    setCurrentInterviews(prev => [...prev, {id: `int-${Date.now()}`, ...newInterview}]);
    setNewInterview({ date: '', type: 'Phone Screen', interviewer: '', notes: ''});
  };

  const handleRemoveInterview = (interviewId: string) => {
    setCurrentInterviews(prev => prev.filter(int => int.id !== interviewId));
  }

  const getAppsForColumn = (column: { acceptedStatuses: JobApplicationStatus[] }): JobApplication[] => {
    return applications.filter(app => column.acceptedStatuses.includes(app.status));
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-0 -m-4 sm:-m-6 lg:-m-8"> 
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("jobTracker.title", { default: "Job Application Tracker" })}</h1>
        <Button onClick={openNewApplicationDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> {t("jobTracker.addJob", { default: "Add Job" })}
        </Button>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
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

        <div className="flex flex-1 gap-4 h-full">
          {KANBAN_COLUMNS_CONFIG.map((colConfig) => (
            <KanbanColumn
              key={colConfig.id}
              column={{
                ...colConfig,
                title: t(colConfig.titleKey),
                description: t(colConfig.descriptionKey)
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
            reset({ companyName: '', jobTitle: '', status: 'Saved', dateApplied: new Date().toISOString().split('T')[0], notes: '', jobDescription: '', location: '', applicationUrl: '', salary: '' });
            setCurrentInterviews([]);
        }
      }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-2xl">{editingApplication ? t("jobTracker.editJob", { default: "Edit Job Application" }) : t("jobTracker.addNewJob", { default: "Add New Job Application" })}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-hidden flex flex-col">
            <Tabs defaultValue="jobDetails" className="w-full flex-grow flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-5 shrink-0">
                <TabsTrigger value="jobDetails">{t("jobTracker.dialog.jobDetails", { default: "Job Details" })}</TabsTrigger>
                <TabsTrigger value="resume">{t("jobTracker.dialog.resume", { default: "Resume" })}</TabsTrigger>
                <TabsTrigger value="coverLetter">{t("jobTracker.dialog.coverLetter", { default: "Cover Letter" })}</TabsTrigger>
                <TabsTrigger value="interviews">{t("jobTracker.dialog.interviews", { default: "Interviews" })}</TabsTrigger>
                <TabsTrigger value="notes">{t("jobTracker.dialog.notes", { default: "Notes" })}</TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-grow mt-4">
                <div className="px-1 pr-4">
                  <TabsContent value="jobDetails">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="applicationUrl">{t("jobTracker.dialog.jobUrl", { default: "Job Listing URL" })}</Label>
                          <Controller name="applicationUrl" control={control} render={({ field }) => <Input id="applicationUrl" placeholder={t("jobTracker.dialog.jobUrlPlaceholder", { default: "https://example.com/jobs/123" })} {...field} value={field.value ?? ''} />} />
                        </div>
                        <div>
                          <Label htmlFor="companyName">{t("jobTracker.dialog.companyName", { default: "Company Name" })}</Label>
                          <Controller name="companyName" control={control} render={({ field }) => <Input id="companyName" {...field} />} />
                        </div>
                        <div>
                          <Label htmlFor="jobTitle">{t("jobTracker.dialog.jobTitle", { default: "Job Title" })}</Label>
                          <Controller name="jobTitle" control={control} render={({ field }) => <Input id="jobTitle" {...field} />} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="location">{t("jobTracker.dialog.location", { default: "Location" })}</Label>
                            <Controller name="location" control={control} render={({ field }) => <Input id="location" {...field} value={field.value ?? ''} />} />
                          </div>
                          <div>
                            <Label htmlFor="status">{t("jobTracker.dialog.status", { default: "Status" })}</Label>
                            <Controller name="status" control={control} render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {JOB_APPLICATION_STATUSES.map(s => <SelectItem key={s} value={s}>{t(`jobTracker.statuses.${s}`)}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )} />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="salary">{t("jobTracker.dialog.salary", { default: "Salary" })}</Label>
                          <Controller name="salary" control={control} render={({ field }) => <Input id="salary" placeholder={t("jobTracker.dialog.salaryPlaceholder", { default: "e.g., 7900000 or 120k - 140k" })} {...field} value={field.value ?? ''}/>} />
                        </div>
                        <div>
                          <Label htmlFor="dateApplied">{t("jobTracker.dialog.date", { default: "Date" })}</Label>
                          <Controller name="dateApplied" control={control} render={({ field }) => <Input type="date" id="dateApplied" {...field} />} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="jobDescription">{t("jobTracker.dialog.jobDescription", { default: "Job Description" })}</Label>
                          <Controller name="jobDescription" control={control} render={({ field }) => <Textarea id="jobDescription" rows={19} {...field} value={field.value ?? ''}/>} />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                   <TabsContent value="resume">
                      <div className="space-y-2">
                        <Label htmlFor="resumeIdUsed">{t("jobTracker.dialog.selectResume", { default: "Select Resume Profile" })}</Label>
                        <Controller name="resumeIdUsed" control={control} render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <SelectTrigger id="resumeIdUsed"><SelectValue placeholder={t("jobTracker.dialog.selectResumePlaceholder", { default: "Select the resume you used" })}/></SelectTrigger>
                            <SelectContent>
                              {resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )} />
                        <p className="text-xs text-muted-foreground">{t("jobTracker.dialog.linkResume", { default: "Link this application to one of your saved resumes from 'My Resumes'." })}</p>
                      </div>
                  </TabsContent>
                  <TabsContent value="coverLetter">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Left: Cover Letter Textarea */}
    <div className="md:col-span-2">
      <Controller
        name="coverLetterText"
        control={control}
        render={({ field }) => (
          <Textarea
            id="coverLetterText"
            placeholder={t("jobTracker.dialog.createCoverLetter", { default: "Create a Cover Letter for this Job" })}
            rows={18}
            className="h-full min-h-[350px]"
            {...field}
            value={field.value ?? ''}
          />
        )}
      />
    </div>
    {/* Right: Info and AI Upgrade */}
    <div className="flex flex-col gap-4">
      <div className="bg-muted rounded-lg p-5 border">
        <h3 className="font-semibold text-lg mb-1 text-muted-foreground">{t("jobTracker.dialog.createCoverLetter", { default: "Create a Cover Letter" })}</h3>
        <p className="text-sm text-foreground">
          {t("jobTracker.dialog.referenceGuide", { default: "Create a cover letter for this job opportunity. Need inspiration? You can reference our cover letter writing guide for more tips." })}
        </p>
      </div>
      <div className="bg-muted rounded-lg p-5 border flex flex-col items-center">
        <h4 className="font-semibold text-base mb-1 text-muted-foreground">{t("jobTracker.dialog.aiBoost", { default: "Get a boost from AI" })}</h4>
        <p className="text-sm text-foreground mb-4 text-center">
          {t("jobTracker.dialog.aiBoostDesc", { default: "Upgrade to Brainqy Premium to automatically generate personalized cover letters for your job applications." })}
        </p>
        <Button className="w-full bg-teal-400 text-white font-semibold text-lg" disabled>
          {t("jobTracker.dialog.upgrade", { default: "Upgrade" })}
        </Button>
      </div>
    </div>
  </div>
</TabsContent>
                  <TabsContent value="interviews">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Left Column: Interview History */}
    <div className="space-y-4">
      <h4 className="font-medium">{t("jobTracker.dialog.interviewHistory", { default: "Interview History" })}</h4>
      {currentInterviews.length > 0 ? (
        <div className="space-y-2">
          {currentInterviews.map(interview => (
            <Card key={interview.id} className="p-2 bg-secondary/50">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">{interview.type} with {interview.interviewer}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveInterview(interview.id)}>
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{format(parseISO(interview.date), 'PPP p')}</p>
              {interview.interviewerMobile && (
                <p className="text-xs text-muted-foreground">📱 {interview.interviewerMobile}</p>
              )}
              {interview.interviewerEmail && (
                <p className="text-xs text-muted-foreground">✉️ {interview.interviewerEmail}</p>
              )}
              {interview.notes && <p className="text-xs italic mt-1">{interview.notes}</p>}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">{t("jobTracker.dialog.noInterviews", { default: "No interviews logged yet." })}</p>
      )}
    </div>
    {/* Right Column: Interview Form */}
    <div className="space-y-4">
      <h5 className="font-medium text-sm">{t("jobTracker.dialog.addNewInterview", { default: "Add New Interview" })}</h5>
      <div className="space-y-2">
        <div>
          <Label htmlFor="interview-date">{t("jobTracker.dialog.interviewDate", { default: "Date & Time" })}</Label>
          <Input id="interview-date" type="datetime-local" value={newInterview.date} onChange={(e) => setNewInterview(p => ({...p, date: e.target.value}))}/>
        </div>
        <div>
          <Label htmlFor="interview-type">{t("jobTracker.dialog.interviewType", { default: "Type" })}</Label>
          <Select value={newInterview.type} onValueChange={(val) => setNewInterview(p => ({...p, type: val as any}))}>
            <SelectTrigger id="interview-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Phone Screen">Phone Screen</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Behavioral">Behavioral</SelectItem>
              <SelectItem value="On-site">On-site</SelectItem>
              <SelectItem value="Final Round">Final Round</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="interviewer-name">{t("jobTracker.dialog.interviewerName", { default: "Interviewer Name(s)" })}</Label>
          <Input id="interviewer-name" placeholder={t("jobTracker.dialog.interviewerNamePlaceholder", { default: "e.g., Jane Doe, John Smith" })} value={newInterview.interviewer} onChange={(e) => setNewInterview(p => ({...p, interviewer: e.target.value}))} />
        </div>
        <div>
          <Label htmlFor="interviewer-mobile">{t("jobTracker.dialog.interviewerMobile", { default: "Interviewer Mobile Number" })}</Label>
          <Input id="interviewer-mobile" placeholder={t("jobTracker.dialog.interviewerMobilePlaceholder", { default: "e.g., +1234567890" })} value={newInterview.interviewerMobile || ''} onChange={(e) => setNewInterview(p => ({...p, interviewerMobile: e.target.value}))} />
        </div>
        <div>
          <Label htmlFor="interviewer-email">{t("jobTracker.dialog.interviewerEmail", { default: "Interviewer Email" })}</Label>
          <Input id="interviewer-email" placeholder={t("jobTracker.dialog.interviewerEmailPlaceholder", { default: "e.g., jane.doe@email.com" })} value={newInterview.interviewerEmail || ''} onChange={(e) => setNewInterview(p => ({...p, interviewerEmail: e.target.value}))} />
        </div>
        <div>
          <Label htmlFor="interview-notes">{t("jobTracker.dialog.interviewNotes", { default: "Notes" })}</Label>
          <Textarea id="interview-notes" placeholder={t("jobTracker.dialog.interviewNotesPlaceholder", { default: "e.g., Discussed project X, asked about system design..." })} value={newInterview.notes || ''} onChange={(e) => setNewInterview(p => ({...p, notes: e.target.value}))} rows={3}/>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleAddInterview}>{t("jobTracker.dialog.addInterview", { default: "Add Interview" })}</Button>
        </div>
      </div>
    </div>
  </div>
</TabsContent>
                  <TabsContent value="notes">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Left Column: Notes History */}
    <div className="space-y-4">
      <h4 className="font-medium">{t("jobTracker.dialog.notesHistory", { default: "Notes History" })}</h4>
      {/* Sample Notes */}
      <div className="space-y-2">
        <div className="bg-secondary/50 rounded-md p-3 text-sm whitespace-pre-line">
          <strong>2024-05-01:</strong> {t("jobTracker.dialog.notesHistorySample1", { default: "Had a call with recruiter, discussed company culture and next steps." })}
        </div>
        <div className="bg-secondary/50 rounded-md p-3 text-sm whitespace-pre-line">
          <strong>2024-05-10:</strong> {t("jobTracker.dialog.notesHistorySample2", { default: "Completed technical assessment. Focused on React and system design." })}
        </div>
        <div className="bg-secondary/50 rounded-md p-3 text-sm whitespace-pre-line">
          <strong>2024-05-15:</strong> {t("jobTracker.dialog.notesHistorySample3", { default: "Scheduled interview with engineering manager for next week." })}
        </div>
      </div>
      {/* Existing application notes */}
      {editingApplication && editingApplication.notes ? (
        <div className="bg-secondary/50 rounded-md p-3 text-sm whitespace-pre-line">
          {editingApplication.notes}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">{t("jobTracker.dialog.noNotes", { default: "No notes yet." })}</p>
      )}
    </div>
    {/* Right Column: Notes Form */}
    <div className="space-y-2">
      <Label htmlFor="notes">{t("jobTracker.dialog.addEditNotes", { default: "Add/Edit Notes" })}</Label>
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <Textarea
            id="notes"
            placeholder={t("jobTracker.dialog.notesPlaceholder", { default: "Contacts, interview details, thoughts..." })}
            rows={15}
            {...field}
            value={field.value ?? ''}
          />
        )}
      />
    </div>
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

// Add this helper function somewhere in your file (or import from your API utils)
async function generateCoverLetter({ jobTitle, companyName, resumeText, jobDescription }: { jobTitle: string, companyName: string, resumeText: string, jobDescription: string }) {
  // Replace this with your actual API call or logic
  // Example placeholder:
  return `Dear Hiring Manager at ${companyName},

I am excited to apply for the ${jobTitle} position. My experience and skills are a great fit for this role.

${resumeText ? "Resume highlights: " + resumeText.substring(0, 100) + "..." : ""}
${jobDescription ? "\nJob Description: " + jobDescription.substring(0, 100) + "..." : ""}

Thank you for your consideration.
`;
}
