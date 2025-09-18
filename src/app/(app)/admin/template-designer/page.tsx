
"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Layers3, PlusCircle, Edit3, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ResumeTemplate } from "@/types";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { getResumeTemplates, deleteResumeTemplate } from "@/lib/actions/templates";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function TemplateDesignerPage() {
  const { user: currentUser, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    const fetchedTemplates = await getResumeTemplates();
    setTemplates(fetchedTemplates);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  if (isUserLoading || !currentUser) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }
  
  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const handleDeleteTemplate = async (templateId: string) => {
    const success = await deleteResumeTemplate(templateId);
    if(success) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast({ title: "Template Deleted", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers3 className="h-8 w-8" /> Resume Templates
        </h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/admin/template-designer/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Template
          </Link>
        </Button>
      </div>
      <CardDescription>
        Manage the resume templates available to all users on the platform. Click 'Add New Template' or 'Edit' to open the new full-screen designer.
      </CardDescription>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Existing Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="w-12 h-16 relative rounded overflow-hidden border">
                        <Image src={template.previewImageUrl} alt={template.name} layout="fill" objectFit="contain" className="p-1"/>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="sm" asChild>
                         <Link href={`/admin/template-designer/${template.id}`}>
                           <Edit3 className="h-4 w-4" />
                         </Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
