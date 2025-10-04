
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useMemo, type FormEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Aperture, Briefcase, Users, MapPin, Building, CalendarDays, Search, Filter as FilterIcon, Edit3, Sparkles, Loader2, ExternalLink, ThumbsUp, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { getJobOpenings, addJobOpening, createJobApplication, updateJobApplication, getUserJobApplications } from "@/lib/actions/jobs";
import type { JobOpening, UserProfile, JobApplication, JobApplicationStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { personalizedJobRecommendations, type PersonalizedJobRecommendationsInput, type PersonalizedJobRecommendationsOutput } from "@/ai/flows/personalized-job-recommendations";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

type RecommendedJob = PersonalizedJobRecommendationsOutput['recommendedJobs'][0];

const JOB_TYPES: JobOpening['type'][] = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Mentorship'];

export default function JobBoardPage() {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [isLoadingOpenings, setIsLoadingOpenings] = useState(true);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingOpening, setEditingOpening] = useState<JobOpening | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState<Set<JobOpening['type']>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[] | null>(null);
  const [isRecLoading, setIsRecLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const { toast } = useToast();

  const jobOpeningSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, t("jobBoard.validation.titleRequired")),
    company: z.string().min(1, t("jobBoard.validation.companyRequired")),
    location: z.string().min(1, t("jobBoard.validation.locationRequired")),
    description: z.string().min(10, t("jobBoard.validation.descriptionMin")),
    type: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract', 'Mentorship']),
    applicationLink: z.string().url(t("jobBoard.validation.invalidUrl")).optional().or(z.literal('')),
  });

  type JobOpeningFormData = z.infer<typeof jobOpeningSchema>;

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<JobOpeningFormData>({
    resolver: zodResolver(jobOpeningSchema),
    defaultValues: { type: 'Full-time' }
  });

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingOpenings(true);
    try {
      const [openingsData, applicationsData] = await Promise.all([
        getJobOpenings(currentUser.id),
        getUserJobApplications(currentUser.id),
      ]);
      setOpenings(openingsData);
      setJobApplications(applicationsData);
    } catch (error) {
      console.error("Failed to load job board data:", error);
      toast({ title: "Error Loading Data", description: "Could not fetch job openings and applications.", variant: "destructive" });
    } finally {
      setIsLoadingOpenings(false);
    }
  }, [toast, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedJobTypes, selectedLocations, selectedCompanies]);

  const uniqueLocations = useMemo(() => Array.from(new Set(openings.map(op => op.location))).sort(), [openings]);
  const uniqueCompanies = useMemo(() => Array.from(new Set(openings.map(op => op.company))).sort(), [openings]);

  const filteredOpenings = useMemo(() => {
    return openings.filter(opening => {
      const matchesSearchTerm = searchTerm === '' || opening.title.toLowerCase().includes(searchTerm.toLowerCase()) || opening.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJobType = selectedJobTypes.size === 0 || selectedJobTypes.has(opening.type);
      const matchesLocation = selectedLocations.size === 0 || selectedLocations.has(opening.location);
      const matchesCompany = selectedCompanies.size === 0 || selectedCompanies.has(opening.company);
      return matchesSearchTerm && matchesJobType && matchesLocation && matchesCompany;
    });
  }, [openings, searchTerm, selectedJobTypes, selectedLocations, selectedCompanies]);
  
  const paginatedOpenings = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredOpenings.slice(startIndex, startIndex + postsPerPage);
  }, [filteredOpenings, currentPage, postsPerPage]);
  
  const totalPages = Math.ceil(filteredOpenings.length / postsPerPage);

  const handleFilterChange = (filterSet: Set<string>, item: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const newSet = new Set(filterSet);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setter(newSet);
  };

  const onPostSubmit = async (data: JobOpeningFormData) => {
    if (!currentUser) return;
    if (editingOpening) {
      // Logic for updating job openings would go here.
      toast({ title: t("jobBoard.toast.updateMock.title"), description: t("jobBoard.toast.updateMock.description")});
    } else {
      const savedOpening = await addJobOpening(data, currentUser);
      if (savedOpening) {
        setOpenings(prev => [savedOpening, ...prev]);
        toast({ title: t("jobBoard.toast.posted.title"), description: t("jobBoard.toast.posted.description", { title: data.title, company: data.company }) });
      } else {
        toast({ title: t("jobBoard.toast.postFailed.title"), description: t("jobBoard.toast.postFailed.description"), variant: "destructive" });
      }
    }
    setIsPostDialogOpen(false);
    reset();
    setEditingOpening(null);
  };
  
  const openNewPostDialog = () => {
    setEditingOpening(null);
    reset({ title: '', company: '', location: '', description: '', type: 'Full-time', applicationLink: '' });
    setIsPostDialogOpen(true);
  };

  const openEditPostDialog = (opening: JobOpening) => {
    setEditingOpening(opening);
    setValue('title', opening.title);
    setValue('company', opening.company);
    setValue('location', opening.location);
    setValue('description', opening.description);
    setValue('type', opening.type);
    setValue('applicationLink', opening.applicationLink || '');
    setIsPostDialogOpen(true);
  };

  const handleGetRecommendations = async () => {
    if (!currentUser) return;
    setIsRecLoading(true);
    setRecommendedJobs(null);
    try {
      const userProfileText = `
        Name: ${currentUser.name}
        Current Role: ${currentUser.currentJobTitle || 'N/A'} at ${currentUser.currentOrganization || 'N/A'}
        Skills: ${(currentUser.skills || []).join(', ') || 'N/A'}
        Bio: ${currentUser.bio || 'N/A'}
        Years of Experience: ${currentUser.yearsOfExperience || 'N/A'}
        Industry: ${currentUser.industry || 'N/A'}
      `;
      const input: PersonalizedJobRecommendationsInput = {
        userProfileText,
        careerInterests: currentUser.careerInterests || 'General job opportunities',
        availableJobs: openings.map(job => ({ 
            id: job.id,
            title: job.title,
            company: job.company,
            description: job.description,
            location: job.location,
            type: job.type,
        })),
      };
      const result = await personalizedJobRecommendations(input);
      setRecommendedJobs(result.recommendedJobs);
      toast({ title: t("jobBoard.toast.recsReady.title"), description: t("jobBoard.toast.recsReady.description") });
    } catch (error) {
      console.error("Job recommendation error:", error);
      const errorMessage = (error as any).message || String(error);
      if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('billing')) {
          toast({
              title: "API Usage Limit Exceeded",
              description: "You have exceeded your Gemini API usage limit. Please check your Google Cloud billing account.",
              variant: "destructive",
              duration: 9000,
          });
      } else {
        toast({ title: t("jobBoard.toast.recsFailed.title"), description: t("jobBoard.toast.recsFailed.description"), variant: "destructive" });
      }
    } finally {
      setIsRecLoading(false);
    }
  };

  const handleSaveJob = async (opening: JobOpening) => {
    if (!currentUser) return;
    const existingApplication = jobApplications.find(
      app => app.sourceJobOpeningId === opening.id && app.userId === currentUser.id
    );

    if (existingApplication) {
      toast({ title: t("jobBoard.toast.alreadyTracked.title"), description: t("jobBoard.toast.alreadyTracked.description", { status: existingApplication.status })});
      return;
    }

    const newApplication = await createJobApplication({
      userId: currentUser.id,
      tenantId: opening.tenantId,
      companyName: opening.company,
      jobTitle: opening.title,
      status: 'Saved',
      dateApplied: new Date().toISOString(),
      jobDescription: opening.description,
      location: opening.location,
      sourceJobOpeningId: opening.id,
      applicationUrl: opening.applicationLink,
      notes: ['Saved from Job Board'],
    });

    if (newApplication) {
        setJobApplications(prev => [newApplication, ...prev]);
        toast({ title: t("jobBoard.toast.jobSaved.title"), description: t("jobBoard.toast.jobSaved.description", { title: opening.title, company: opening.company }) });
    } else {
        toast({ title: "Error", description: "Could not save job to tracker.", variant: "destructive" });
    }
  };

  const handleApplyJob = async (opening: JobOpening) => {
    if (!currentUser) return;
    if (opening.applicationLink) {
      window.open(opening.applicationLink, '_blank');
    }

    const existingApplication = jobApplications.find(
      app => app.sourceJobOpeningId === opening.id && app.userId === currentUser.id
    );

    if (existingApplication) {
      if (existingApplication.status === 'Applied') {
        toast({ title: t("jobBoard.toast.alreadyApplied.title"), description: t("jobBoard.toast.alreadyApplied.description") });
        return;
      }
      const updatedApp = await updateJobApplication(existingApplication.id, {
        status: 'Applied',
        dateApplied: new Date().toISOString(),
        notes: ["Updated to 'Applied' from Job Board"],
      });
      if (updatedApp) {
        setJobApplications(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
        toast({ title: t("jobBoard.toast.appTracked.title"), description: t("jobBoard.toast.appTracked.descriptionUpdate", { title: opening.title }) });
      }
    } else {
      const newApplication = await createJobApplication({
        userId: currentUser.id,
        tenantId: opening.tenantId,
        companyName: opening.company,
        jobTitle: opening.title,
        status: 'Applied',
        dateApplied: new Date().toISOString(),
        jobDescription: opening.description,
        location: opening.location,
        sourceJobOpeningId: opening.id,
        applicationUrl: opening.applicationLink,
        notes: ['Applied from Job Board'],
      });
       if (newApplication) {
        setJobApplications(prev => [newApplication, ...prev]);
        toast({ title: t("jobBoard.toast.appTracked.title"), description: t("jobBoard.toast.appTracked.descriptionNew", { title: opening.title, company: opening.company }) });
       }
    }
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="h-8 w-8" /> {t("jobBoard.title")}
          </h1>
          <CardDescription>
            {t("jobBoard.pageDescription")}
          </CardDescription>
        </div>
        <div className="relative w-full md:w-auto md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder={t("jobBoard.searchPlaceholder")}
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openNewPostDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> {t("jobBoard.postOpportunity")}
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full bg-card shadow-lg rounded-lg">
        <AccordionItem value="filters">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FilterIcon className="h-5 w-5" /> {t("jobBoard.filters.title")}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <h4 className="font-medium mb-2">{t("jobBoard.filters.jobType")}</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {JOB_TYPES.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type}`} 
                          checked={selectedJobTypes.has(type)}
                          onCheckedChange={() => handleFilterChange(selectedJobTypes, type, setSelectedJobTypes as React.Dispatch<React.SetStateAction<Set<string>>>)}
                        />
                        <Label htmlFor={`type-${type}`} className="font-normal">{type}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t("jobBoard.filters.location")}</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {uniqueLocations.map(location => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`loc-${location}`} 
                          checked={selectedLocations.has(location)}
                          onCheckedChange={() => handleFilterChange(selectedLocations, location, setSelectedLocations)}
                        />
                        <Label htmlFor={`loc-${location}`} className="font-normal">{location}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t("jobBoard.filters.company")}</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {uniqueCompanies.map(company => (
                      <div key={company} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`comp-${company}`} 
                          checked={selectedCompanies.has(company)}
                          onCheckedChange={() => handleFilterChange(selectedCompanies, company, setSelectedCompanies)}
                        />
                        <Label htmlFor={`comp-${company}`} className="font-normal">{company}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary"/> {t("jobBoard.aiRecs.title")}
          </CardTitle>
          <CardDescription>{t("jobBoard.aiRecs.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isRecLoading && (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="mt-2 text-muted-foreground">{t("jobBoard.aiRecs.loading")}</p>
            </div>
          )}
          {!isRecLoading && recommendedJobs === null && !isRecLoading && openings.length > 0 && (
            <p className="text-muted-foreground text-center py-4">{t("jobBoard.aiRecs.prompt")}</p>
          )}
          {!isRecLoading && recommendedJobs && recommendedJobs.length === 0 && (
             <p className="text-muted-foreground text-center py-4">{t("jobBoard.aiRecs.noneFound")}</p>
          )}
          {!isRecLoading && recommendedJobs && recommendedJobs.length > 0 && (
            <div className="space-y-3">
              {recommendedJobs.map(recJob => {
                 const originalJob = openings.find(op => op.id === recJob.jobId);
                 return (
                  <Card key={recJob.jobId} className="bg-secondary/50 p-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                            <h4 className="font-semibold text-foreground">{recJob.title} at {recJob.company}</h4>
                            <p className="text-xs text-muted-foreground">{t("jobBoard.aiRecs.matchStrength")}: <span className="text-primary font-bold">{recJob.matchStrength}%</span></p>
                        </div>
                         {originalJob?.applicationLink && (
                           <Button size="sm" asChild className="mt-2 sm:mt-0">
                             <Link href={originalJob.applicationLink} target="_blank" rel="noopener noreferrer">
                               {t("jobBoard.applyButton")} <ExternalLink className="ml-1 h-3 w-3"/>
                             </Link>
                           </Button>
                         )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 italic">{t("jobBoard.aiRecs.reasoning")}: {recJob.reasoning}</p>
                  </Card>
                 );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
           <Button onClick={handleGetRecommendations} disabled={isRecLoading || openings.length === 0} className="w-full md:w-auto">
            {isRecLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
            {openings.length === 0 ? t("jobBoard.aiRecs.noJobs") : t("jobBoard.aiRecs.getRecsButton")}
          </Button>
        </CardFooter>
      </Card>


      <Dialog open={isPostDialogOpen} onOpenChange={(isOpen) => {
        setIsPostDialogOpen(isOpen);
        if (!isOpen) {
          reset();
          setEditingOpening(null);
        }
      }}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingOpening ? t("jobBoard.dialog.editTitle") : t("jobBoard.dialog.newTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onPostSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="post-title">{t("jobBoard.dialog.titleLabel")}</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="post-title" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-company">{t("jobBoard.dialog.companyLabel")}</Label>
              <Controller name="company" control={control} render={({ field }) => <Input id="post-company" {...field} />} />
              {errors.company && <p className="text-sm text-destructive mt-1">{errors.company.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-location">{t("jobBoard.dialog.locationLabel")}</Label>
              <Controller name="location" control={control} render={({ field }) => <Input id="post-location" {...field} />} />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-type">{t("jobBoard.dialog.typeLabel")}</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-description">{t("jobBoard.dialog.descriptionLabel")}</Label>
              <Controller name="description" control={control} render={({ field }) => <Textarea id="post-description" rows={5} {...field} />} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
             <div>
              <Label htmlFor="applicationLink">{t("JobBoard.dialog.linkOptional")}</Label>
              <Controller name="applicationLink" control={control} render={({ field }) => <Input id="applicationLink" type="url" placeholder="https://example.com/apply" {...field} />} />
              {errors.applicationLink && <p className="text-sm text-destructive mt-1">{errors.applicationLink.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">{t("common.cancel")}</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingOpening ? t("jobBoard.dialog.saveButton") : t("jobBoard.dialog.postButton")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoadingOpenings ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">{t("jobBoard.loading")}</p>
        </div>
      ) : filteredOpenings.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <Aperture className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">{t("jobBoard.noOpportunities.title")}</CardTitle>
            <CardDescription>{t("jobBoard.noOpportunities.description")}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedOpenings.map((opening) => {
            const isOwnPosting = opening.postedByAlumniId === currentUser.id || currentUser.role === 'admin';
            return (
            <Card key={opening.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                   <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      opening.type === 'Mentorship' ? 'bg-purple-100 text-purple-700' :
                      opening.type === 'Internship' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {opening.type}
                    </span>
                    {opening.alumniName && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={`https://avatar.vercel.sh/${opening.postedByAlumniId}.png`} alt={opening.alumniName} data-ai-hint="person face"/>
                                <AvatarFallback>{opening.alumniName.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <span>{opening.alumniName}</span>
                        </div>
                    )}
                </div>
                <CardTitle className="text-xl">{opening.title}</CardTitle>
                <div className="text-sm text-muted-foreground flex flex-col gap-1">
                    <span className="flex items-center gap-1"><Building className="h-4 w-4"/> {opening.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {opening.location}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {opening.description}
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4 mt-auto flex justify-between items-center">
                 <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> {t("jobBoard.posted")}: {new Date(opening.datePosted).toLocaleDateString()}
                </p>
                <div className="flex space-x-2">
                  {isOwnPosting && (
                    <Button size="sm" variant="outline" onClick={() => openEditPostDialog(opening)} title={t("jobBoard.editButton")}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleSaveJob(opening)} title={t("jobBoard.saveButton")}>
                     <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="default" onClick={() => handleApplyJob(opening)} className="bg-primary hover:bg-primary/90">
                    {opening.applicationLink ? (
                       <> {opening.type === 'Mentorship' ? t("jobBoard.interestButton") : t("jobBoard.applyButton")} <ExternalLink className="ml-1 h-3 w-3"/> </>
                    ) : (
                      opening.type === 'Mentorship' ? t("jobBoard.interestButton") : t("jobBoard.applyButton")
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" /> {t("jobBoard.pagination.previous")}
            </Button>
            <span className="mx-4 text-sm text-muted-foreground">
              {t("jobBoard.pagination.pageInfo", { currentPage, totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {t("jobBoard.pagination.next")} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        </>
      )}
    </div>
  );
}

    