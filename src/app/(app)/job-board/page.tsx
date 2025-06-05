"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useMemo, type FormEvent } from "react";
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
import { PlusCircle, Aperture, Briefcase, Users, MapPin, Building, CalendarDays, Search, Filter as FilterIcon, Edit3, Sparkles, Loader2, ExternalLink, ThumbsUp, Bookmark } from "lucide-react";
import { sampleAlumni, sampleUserProfile, sampleJobApplications } from "@/lib/sample-data";
import { getJobOpenings, addJobOpening } from "@/lib/data-services"; // Updated import
import type { JobOpening, UserProfile, JobApplication, JobApplicationStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { personalizedJobRecommendations, type PersonalizedJobRecommendationsInput, type PersonalizedJobRecommendationsOutput } from "@/ai/flows/personalized-job-recommendations";
import Link from "next/link";

const jobOpeningSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract', 'Mentorship']),
  applicationLink: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type JobOpeningFormData = z.infer<typeof jobOpeningSchema>;
type RecommendedJob = PersonalizedJobRecommendationsOutput['recommendedJobs'][0];


const JOB_TYPES: JobOpening['type'][] = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Mentorship'];

export default function JobBoardPage() {
  const { t } = useI18n();
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [isLoadingOpenings, setIsLoadingOpenings] = useState(true);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingOpening, setEditingOpening] = useState<JobOpening | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState<Set<JobOpening['type']>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[] | null>(null);
  const [isRecLoading, setIsRecLoading] = useState(false);

  const { toast } = useToast();
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<JobOpeningFormData>({
    resolver: zodResolver(jobOpeningSchema),
    defaultValues: { type: 'Full-time' }
  });

  const currentUser = sampleUserProfile; 

  useEffect(() => {
    async function loadOpenings() {
      setIsLoadingOpenings(true);
      try {
        const data = await getJobOpenings();
        setOpenings(data);
      } catch (error) {
        console.error("Failed to load job openings:", error);
        toast({ title: "Error Loading Jobs", description: "Could not fetch job openings.", variant: "destructive" });
      } finally {
        setIsLoadingOpenings(false);
      }
    }
    loadOpenings();
  }, [toast]);


  const uniqueLocations = useMemo(() => {
    const locations = new Set(openings.map(op => op.location));
    return Array.from(locations).sort();
  }, [openings]);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set(openings.map(op => op.company));
    return Array.from(companies).sort();
  }, [openings]);

  const filteredOpenings = useMemo(() => {
    return openings.filter(opening => {
      const matchesSearchTerm = searchTerm === '' || opening.title.toLowerCase().includes(searchTerm.toLowerCase()) || opening.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJobType = selectedJobTypes.size === 0 || selectedJobTypes.has(opening.type);
      const matchesLocation = selectedLocations.size === 0 || selectedLocations.has(opening.location);
      const matchesCompany = selectedCompanies.size === 0 || selectedCompanies.has(opening.company);
      return matchesSearchTerm && matchesJobType && matchesLocation && matchesCompany;
    });
  }, [openings, searchTerm, selectedJobTypes, selectedLocations, selectedCompanies]);

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
    // In a real app, for editing, you'd likely make a PUT request.
    // For now, we'll focus on creation for the conditional logic.
    if (editingOpening) {
      // Mock update for local state if developing with sample data
      if (process.env.NODE_ENV === 'development') {
        setOpenings(prev => prev.map(op => op.id === editingOpening.id ? { ...editingOpening, ...data, applicationLink: data.applicationLink || undefined } : op));
         // Find and update in sampleJobOpenings for persistence across reloads in dev
        const index = sampleAlumni.findIndex(s => s.id === editingOpening.id);
        if (index !== -1) {
          // @ts-ignore This is a bit of a hack for sample data
          // sampleJobOpenings[index] = { ...editingOpening, ...data, applicationLink: data.applicationLink || undefined };
        }
      } else {
        // TODO: Implement PUT request for production
        console.warn("Update functionality for production API not implemented yet.");
      }
      toast({ title: "Opportunity Updated", description: `${data.title} at ${data.company} has been updated.` });
    } else {
      const newJobData = {
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description,
        type: data.type,
        applicationLink: data.applicationLink || undefined,
      };
      const savedOpening = await addJobOpening(newJobData, currentUser);
      if (savedOpening) {
        setOpenings(prev => [savedOpening, ...prev]);
        toast({ title: "Opportunity Posted", description: `${data.title} at ${data.company} has been posted.` });
      } else {
        toast({ title: "Posting Failed", description: "Could not post the opportunity.", variant: "destructive" });
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
      toast({ title: "Recommendations Ready", description: "AI has suggested some job openings for you." });
    } catch (error) {
      console.error("Job recommendation error:", error);
      toast({ title: "Recommendation Failed", description: "Could not fetch job recommendations.", variant: "destructive" });
    } finally {
      setIsRecLoading(false);
    }
  };

  const createJobApplicationFromOpening = (opening: JobOpening, status: JobApplicationStatus): JobApplication => {
    return {
      id: `app-${opening.id}-${Date.now()}`, 
      tenantId: opening.tenantId,
      userId: currentUser.id,
      companyName: opening.company,
      jobTitle: opening.title,
      status: status,
      dateApplied: new Date().toISOString().split('T')[0],
      jobDescription: opening.description,
      location: opening.location,
      sourceJobOpeningId: opening.id,
      applicationUrl: opening.applicationLink,
      notes: status === 'Saved' ? 'Saved from Job Board' : 'Applied from Job Board',
    };
  };

  const handleSaveJob = (opening: JobOpening) => {
    const existingApplication = sampleJobApplications.find(
      app => app.sourceJobOpeningId === opening.id && app.userId === currentUser.id
    );

    if (existingApplication && (existingApplication.status === 'Saved' || existingApplication.status === 'Applied')) {
      toast({ title: "Already Tracked", description: `This job is already in your tracker as '${existingApplication.status}'.`, variant: "default" });
      return;
    }

    const newApplication = createJobApplicationFromOpening(opening, 'Saved');
    sampleJobApplications.unshift(newApplication); 
    toast({ title: "Job Saved!", description: `${opening.title} at ${opening.company} has been saved to your Job Tracker.` });
  };

  const handleApplyJob = (opening: JobOpening) => {
    if (opening.applicationLink) {
      window.open(opening.applicationLink, '_blank');
    }

    const existingApplicationIndex = sampleJobApplications.findIndex(
      app => app.sourceJobOpeningId === opening.id && app.userId === currentUser.id
    );

    if (existingApplicationIndex !== -1) {
      if (sampleJobApplications[existingApplicationIndex].status === 'Applied') {
        toast({ title: "Already Applied", description: `You've already marked this job as 'Applied' in your tracker.`, variant: "default" });
        return;
      }
      sampleJobApplications[existingApplicationIndex].status = 'Applied';
      sampleJobApplications[existingApplicationIndex].dateApplied = new Date().toISOString().split('T')[0];
      sampleJobApplications[existingApplicationIndex].notes = "Updated to 'Applied' from Job Board";
      toast({ title: "Application Tracked", description: `${opening.title} status updated to 'Applied' in your Job Tracker.` });
    } else {
      const newApplication = createJobApplicationFromOpening(opening, 'Applied');
      sampleJobApplications.unshift(newApplication);
      toast({ title: "Application Tracked", description: `${opening.title} at ${opening.company} has been added to your Job Tracker as 'Applied'.` });
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="h-8 w-8" /> {t("jobBoard.title", "Job Board")}
          </h1>
          <CardDescription>
            {t("jobBoard.pageDescription", "Find job opportunities shared within the alumni network.")}
          </CardDescription>
        </div>
        <div className="relative w-full md:w-auto md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder={t("jobBoard.searchPlaceholder", "Search jobs...")}
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openNewPostDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> {t("jobBoard.postOpportunity", "Post Opportunity")}
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full bg-card shadow-lg rounded-lg">
        <AccordionItem value="filters">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FilterIcon className="h-5 w-5" /> Filters
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <h4 className="font-medium mb-2">Job Type</h4>
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
                <h4 className="font-medium mb-2">Location</h4>
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
                <h4 className="font-medium mb-2">Company</h4>
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
            <Sparkles className="h-6 w-6 text-primary"/> AI Job Recommendations
          </CardTitle>
          <CardDescription>Get personalized job suggestions based on your profile and interests.</CardDescription>
        </CardHeader>
        <CardContent>
          {isRecLoading && (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="mt-2 text-muted-foreground">Finding jobs for you...</p>
            </div>
          )}
          {!isRecLoading && recommendedJobs === null && !isRecLoading && openings.length > 0 && (
            <p className="text-muted-foreground text-center py-4">Click "Get AI Recommendations" to see personalized suggestions.</p>
          )}
          {!isRecLoading && recommendedJobs && recommendedJobs.length === 0 && (
             <p className="text-muted-foreground text-center py-4">No specific recommendations found at this time. Try adjusting your profile interests or check back later.</p>
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
                            <p className="text-xs text-muted-foreground">Match Strength: <span className="text-primary font-bold">{recJob.matchStrength}%</span></p>
                        </div>
                         {originalJob?.applicationLink && (
                           <Button size="sm" asChild className="mt-2 sm:mt-0">
                             <Link href={originalJob.applicationLink} target="_blank" rel="noopener noreferrer">
                               Apply <ExternalLink className="ml-1 h-3 w-3"/>
                             </Link>
                           </Button>
                         )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 italic">Reasoning: {recJob.reasoning}</p>
                  </Card>
                 );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
           <Button onClick={handleGetRecommendations} disabled={isRecLoading || openings.length === 0} className="w-full md:w-auto">
            {isRecLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
            {openings.length === 0 ? "No Jobs to Recommend From" : "Get AI Recommendations"}
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
            <DialogTitle className="text-2xl">{editingOpening ? "Edit" : "Post New"} Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onPostSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="post-title">Title</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="post-title" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-company">Company / Organization</Label>
              <Controller name="company" control={control} render={({ field }) => <Input id="post-company" {...field} />} />
              {errors.company && <p className="text-sm text-destructive mt-1">{errors.company.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-location">Location</Label>
              <Controller name="location" control={control} render={({ field }) => <Input id="post-location" {...field} />} />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-type">Type</Label>
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
              <Label htmlFor="post-description">Description</Label>
              <Controller name="description" control={control} render={({ field }) => <Textarea id="post-description" rows={5} {...field} />} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
             <div>
              <Label htmlFor="applicationLink">Application Link (Optional)</Label>
              <Controller name="applicationLink" control={control} render={({ field }) => <Input id="applicationLink" type="url" placeholder="https://example.com/apply" {...field} />} />
              {errors.applicationLink && <p className="text-sm text-destructive mt-1">{errors.applicationLink.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingOpening ? "Save Changes" : "Post Opportunity"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoadingOpenings ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading job openings...</p>
        </div>
      ) : filteredOpenings.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <Aperture className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Opportunities Found</CardTitle>
            <CardDescription>Try adjusting your search or filters, or be the first to post an opportunity!</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpenings.map((opening) => {
            const postingAlumni = sampleAlumni.find(a => a.id === opening.postedByAlumniId);
            const isOwnPosting = opening.postedByAlumniId === currentUser.id;
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
                    {postingAlumni && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={postingAlumni.profilePictureUrl} alt={postingAlumni.name} data-ai-hint="person face"/>
                                <AvatarFallback>{postingAlumni.name.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <span>{postingAlumni.name}</span>
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
                    <CalendarDays className="h-3 w-3" /> Posted: {new Date(opening.datePosted).toLocaleDateString()}
                </p>
                <div className="flex space-x-2">
                  {isOwnPosting && (
                    <Button size="sm" variant="outline" onClick={() => openEditPostDialog(opening)} title="Edit Posting">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleSaveJob(opening)} title="Save for Later">
                     <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="default" onClick={() => handleApplyJob(opening)} className="bg-primary hover:bg-primary/90">
                    {opening.applicationLink ? (
                       <> {opening.type === 'Mentorship' ? 'Express Interest' : 'Apply'} <ExternalLink className="ml-1 h-3 w-3"/> </>
                    ) : (
                      opening.type === 'Mentorship' ? 'Express Interest' : 'Apply'
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}

