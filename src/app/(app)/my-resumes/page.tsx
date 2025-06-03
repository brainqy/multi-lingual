"use client";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, Edit3, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ResumeProfile } from "@/types";
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
import { useToast } from "@/hooks/use-toast";
import { sampleResumeProfiles, sampleUserProfile } from "@/lib/sample-data"; // Import sample resumes

export default function MyResumesPage() {
  // Filter resumes for the current user's tenant
  const [resumes, setResumes] = useState<ResumeProfile[]>(
    sampleResumeProfiles.filter(r => r.tenantId === sampleUserProfile.tenantId && r.userId === sampleUserProfile.id)
  );
  const { toast } = useToast();

  const handleDeleteResume = (resumeId: string) => {
    setResumes(currentResumes => currentResumes.filter(r => r.id !== resumeId));
    // In a real app, also delete from backend / database
    toast({ title: "Resume Deleted", description: "The resume profile has been removed." });
  };

  // Placeholder for future "Add New Resume" functionality
  const handleAddNewResume = () => {
     // Mock adding a new resume
    const newResume: ResumeProfile = {
      id: `resume-${Date.now()}`,
      tenantId: sampleUserProfile.tenantId,
      userId: sampleUserProfile.id,
      name: `New Resume ${resumes.length + 1}`,
      resumeText: "Paste your new resume text here...",
      lastAnalyzed: undefined,
    };
    setResumes(currentResumes => [newResume, ...currentResumes]);
    toast({ title: "New Resume Added", description: "A new resume profile has been created. Click Edit to add content."});
  };

   const handleEditResume = (resumeId: string) => {
    // In a real app, this would navigate to an edit page or open a modal
    toast({ title: "Edit Action (Mock)", description: `Navigating to edit page for resume ${resumeId}.` });
    // Example navigation (replace with actual routing if needed):
    // router.push(`/my-resumes/edit/${resumeId}`);
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Resumes</h1>
        <Button onClick={handleAddNewResume} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Resume
        </Button>
      </div>

      {resumes.length === 0 && (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Resume Profiles Yet</CardTitle>
            <CardDescription>
              Click "Add New Resume" to upload and manage your first resume.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <Card key={resume.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText className="h-8 w-8 text-primary mt-1" />
                <div className="ml-4 flex-1">
                  <CardTitle className="text-xl">{resume.name}</CardTitle>
                  <CardDescription>Last Analyzed: {resume.lastAnalyzed || "Never"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {resume.resumeText?.substring(0, 150) || "No content yet."}...
              </p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t pt-4 mt-auto">
              <Link href={`/resume-analyzer?resumeId=${resume.id}`} passHref>
                <Button variant="outline" size="sm" title="Analyze">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" title="Edit" onClick={() => handleEditResume(resume.id)}>
                <Edit3 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the resume profile "{resume.name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteResume(resume.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
