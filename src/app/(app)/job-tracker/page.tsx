
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
    console.log("[JobTrackerPage DEBUG] 1. Starting fetchData.");
    if (!currentUser) {
      console.log("[JobTrackerPage DEBUG] 2. No current user, aborting fetchData.");
      return;
    }
    console.log("[JobTrackerPage DEBUG] 3. Setting isLoading to true.");
    setIsLoading(true);
    const [userApps, userResumes] = await Promise.all([
      getUserJobApplications(currentUser.id),
      getResumeProfiles(currentUser.id),
    ]);
    console.log("[JobTrackerPage DEBUG] 4. Fetched data:", { userAppsCount: userApps.length, userResumesCount: userResumes.length });
    setApplications(userApps);
    setResumes(userResumes);
    console.log("[JobTrackerPage DEBUG] 5. State updated with fetched data. Setting isLoading to false.");
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    console.log("[JobTrackerPage DEBUG] useEffect triggered to call fetchData.");
    fetchData();
  }, [fetchData]);

  const handleEdit = (app: JobApplication) => {
    console.log("[JobTrackerPage DEBUG] handleEdit called for application:", app);
    setEditingApplication(app);
    setIsDialogOpen(true);
    console.log("[JobTrackerPage DEBUG] Dialog opened for editing.");
  };

  const handleDelete = async (id: string) => {
    console.log("[JobTrackerPage DEBUG] handleDelete called for ID:", id);
    const success = await deleteJobApplication(id);
    if(success) {
      console.log("[JobTrackerPage DEBUG] Deletion successful. Updating state.");
      setApplications(apps => apps.filter(app => app.id !== id));
      toast({ title: t("jobTracker.toast.appDeleted.title"), description: t("jobTracker.toast.appDeleted.description") });
    } else {
      console.error("[JobTrackerPage DEBUG] Deletion failed.");
      toast({ title: "Error", description: "Failed to delete application.", variant: "destructive"});
    }
  };

  const handleMoveApplication = async (appId: string, newStatus: JobApplicationStatus) => {
    console.log(`[JobTrackerPage DEBUG] handleMoveApplication called. App ID: ${appId}, New Status: ${newStatus}`);
    const originalApplication = applications.find(app => app.id === appId);
    if (!originalApplication) {
      console.error("[JobTrackerPage DEBUG] Original application not found for move.");
      return;
    }
    
    console.log("[JobTrackerPage DEBUG] Optimistically updating UI.");
    setApplications(prevApps => prevApps.map(app => app.id === appId ? { ...app, status: newStatus } : app));

    const updatedApp = await updateJobApplication(appId, { status: newStatus });
    if(updatedApp) {
      console.log("[JobTrackerPage DEBUG] Server update successful:", updatedApp);
      toast({ title: t("jobTracker.toast.appMoved.title"), description: t("jobTracker.toast.appMoved.description", { jobTitle: updatedApp.jobTitle, newStatus: t(`jobTracker.statuses.${newStatus}`) }) });
    } else {
      console.error("[JobTrackerPage DEBUG] Server update failed. Reverting UI.");
      setApplications(prevApps => prevApps.map(app => app.id === appId ? originalApplication : app));
      toast({ title: "Error", description: "Could not move application.", variant: "destructive" });
    }
  };

  const openNewApplicationDialog = () => {
    console.log("[JobTrackerPage DEBUG] openNewApplicationDialog called.");
    setEditingApplication(null);
    setIsDialogOpen(true);
    console.log("[JobTrackerPage DEBUG] Dialog opened for new application.");
  };

  const onDialogClose = () => {
    console.log("[JobTrackerPage DEBUG] onDialogClose called.");
    setIsDialogOpen(false);
    setEditingApplication(null);
  }

  const onDialogSave = async (applicationData: Partial<Omit<JobApplication, 'id' | 'interviews'>>, interviews: Interview[]) => {
    console.log("[JobTrackerPage DEBUG] 1. onDialogSave called with data:", { applicationData, interviews });
    if (!currentUser) {
      console.error("[JobTrackerPage DEBUG] 2. No current user found. Aborting save.");
      return;
    }

    // FIX: Ensure date is in ISO format
    const dataForServer = {
      ...applicationData,
      dateApplied: applicationData.dateApplied ? new Date(applicationData.dateApplied).toISOString() : new Date().toISOString(),
      interviews: interviews,
    };
    
    let result: JobApplication | null = null;
    if (editingApplication) {
      console.log("[JobTrackerPage DEBUG] 4a. Editing mode. Calling updateJobApplication for ID:", editingApplication.id);
      result = await updateJobApplication(editingApplication.id, dataForServer);
      if (result) {
        console.log("[JobTrackerPage DEBUG] 5a. Update successful. New data:", result);
        setApplications(prev => prev.map(app => app.id === result!.id ? result! : app));
        toast({ title: t("jobTracker.toast.appUpdated.title"), description: t("jobTracker.toast.appUpdated.description", { jobTitle: result.jobTitle, companyName: result.companyName }) });
      }
    } else {
      console.log("[JobTrackerPage DEBUG] 4b. Create mode. Calling createJobApplication.");
      const dataToCreate = {
        ...dataForServer,
        userId: currentUser.id,
        tenantId: currentUser.tenantId,
      };
      result = await createJobApplication(dataToCreate as Omit<JobApplication, 'id'>);
      if (result) {
        console.log("[JobTrackerPage DEBUG] 5b. Create successful. New data:", result);
        setApplications(prev => [result!, ...prev]);
        toast({ title: t("jobTracker.toast.appAdded.title"), description: t("jobTracker.toast.appAdded.description", { jobTitle: result.jobTitle, companyName: result.companyName }) });
      }
    }

    if (!result) {
      console.error("[JobTrackerPage DEBUG] 6. Save/update operation failed. Result is null.");
      toast({ title: "Error", description: "Failed to save application.", variant: "destructive" });
      await fetchData(); // Refetch to ensure UI consistency on failure
    }
    
    console.log("[JobTrackerPage DEBUG] 7. Closing dialog and resetting state.");
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
            editingApplication={editingApplication}
            resumes={resumes}
        />
      )}
    </div>
  );
}
