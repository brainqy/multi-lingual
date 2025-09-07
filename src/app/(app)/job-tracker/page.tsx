
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import type { JobApplication, JobApplicationStatus, ResumeProfile, Interview } from "@/types"; 
import { useToast } from "@/hooks/use-toast";
import { getUserJobApplications, createJobApplication, updateJobApplication, deleteJobApplication } from "@/lib/actions/jobs";
import { getResumeProfiles } from "@/lib/actions/resumes";
import { useAuth } from "@/hooks/use-auth";
import JobSearchCard from "@/components/features/job-tracker/JobSearchCard";
import KanbanBoard from "@/components/features/job-tracker/KanbanBoard";
import JobApplicationDialog from "@/components/features/job-tracker/JobApplicationDialog";

export default function JobTrackerPage() {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [resumes, setResumes] = useState<ResumeProfile[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    setIsLoading(true);
    try {
      const [userApps, userResumes] = await Promise.all([
        getUserJobApplications(currentUser.id),
        getResumeProfiles(currentUser.id),
      ]);
      setApplications(userApps);
      setResumes(userResumes);
    } catch (err) {
      console.error("Error fetching job tracker data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (app: JobApplication) => {
    setEditingApplication(app);
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
    setIsDialogOpen(false);
    setEditingApplication(null);
  };

  const handleMoveApplication = async (appId: string, newStatus: JobApplicationStatus) => {
    const originalApplication = applications.find(app => app.id === appId);
    if (!originalApplication) {
      return;
    }
    
    setApplications(prevApps => prevApps.map(app => app.id === appId ? { ...app, status: newStatus } : app));

    const updatedApp = await updateJobApplication(appId, { status: newStatus });
    if(updatedApp) {
      toast({ title: t("jobTracker.toast.appMoved.title"), description: t("jobTracker.toast.appMoved.description", { jobTitle: updatedApp.jobTitle, newStatus: t(`jobTracker.statuses.${newStatus}`) }) });
    } else {
      setApplications(prevApps => prevApps.map(app => app.id === appId ? originalApplication : app));
      toast({ title: "Error", description: "Could not move application.", variant: "destructive" });
    }
  };

  const openNewApplicationDialog = () => {
    setEditingApplication(null);
    setIsDialogOpen(true);
  };

  const onDialogClose = () => {
    setIsDialogOpen(false);
    setEditingApplication(null);
  }

  const onDialogSave = async (applicationData: Partial<Omit<JobApplication, 'id' | 'interviews'>>, interviews: Interview[]) => {
    if (!currentUser) {
      return;
    }

    const dataForServer = {
      ...applicationData,
      dateApplied: applicationData.dateApplied ? new Date(applicationData.dateApplied).toISOString() : new Date().toISOString(),
      interviews: interviews,
    };
    
    let result: JobApplication | null = null;
    if (editingApplication) {
      result = await updateJobApplication(editingApplication.id, dataForServer);
      if (result) {
        setApplications(prev => prev.map(app => app.id === result!.id ? result! : app));
        toast({ title: t("jobTracker.toast.appUpdated.title"), description: t("jobTracker.toast.appUpdated.description", { jobTitle: result.jobTitle, companyName: result.companyName }) });
      }
    } else {
      const dataToCreate = {
        ...dataForServer,
        userId: currentUser.id,
      };
      result = await createJobApplication(dataToCreate as Omit<JobApplication, 'id'>);
      if (result) {
        setApplications(prev => [result!, ...prev]);
        toast({ title: t("jobTracker.toast.appAdded.title"), description: t("jobTracker.toast.appAdded.description", { jobTitle: result.jobTitle, companyName: result.companyName }) });
      }
    }

    if (!result) {
      toast({ title: "Error", description: "Failed to save application.", variant: "destructive" });
      await fetchData(); 
    }
    
    setIsDialogOpen(false);
    setEditingApplication(null);
  }

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
        <JobSearchCard applications={applications} setApplications={setApplications} />
        <KanbanBoard
            applications={applications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMove={handleMoveApplication}
        />
      </div>

      {isDialogOpen && (
        <JobApplicationDialog
            isOpen={isDialogOpen}
            onClose={onDialogClose}
            onSave={onDialogSave}
            onDelete={handleDelete}
            editingApplication={editingApplication}
            resumes={resumes}
        />
      )}
    </div>
  );
}
