
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { JobOpening, JobApplication, JobApplicationStatus } from "@/types";
import { getJobOpenings, createJobApplication } from "@/lib/actions/jobs";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

interface JobSearchCardProps {
    applications: JobApplication[];
    setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
}

export default function JobSearchCard({ applications, setApplications }: JobSearchCardProps) {
    const { t } = useI18n();
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const [searchKeywords, setSearchKeywords] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [jobSearchResults, setJobSearchResults] = useState<JobOpening[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

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
            toast({ title: t("jobTracker.toast.noJobsFound.title"), description: t("jobTracker.toast.noJobsFound.description") });
        }
    };

    const handleAddSearchedJobToTracker = async (job: JobOpening) => {
        if (!currentUser) {
            return;
        }
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

        const newApp = await createJobApplication(newApplicationData);
        if (newApp) {
            setApplications(prevApps => [newApp, ...prevApps]);
            toast({ title: t("jobTracker.toast.jobAdded.title"), description: t("jobTracker.toast.jobAdded.description", { jobTitle: job.title, companyName: newApp.companyName }) });
        } else {
            toast({ title: "Error", description: "Could not add job to tracker.", variant: "destructive" });
        }
    };

    return (
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
    );
}
