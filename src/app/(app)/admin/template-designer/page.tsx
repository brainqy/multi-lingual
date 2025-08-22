
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Layers3, PlusCircle, Edit3, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ResumeTemplate } from "@/types";
import { sampleResumeTemplates } from "@/lib/sample-data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

const templateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  previewImageUrl: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  dataAiHint: z.string().optional(),
  content: z.string().min(50, "Template content is required"),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function TemplateDesignerPage() {
  const { user: currentUser, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ResumeTemplate[]>(sampleResumeTemplates);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResumeTemplate | null>(null);

  const { control, handleSubmit, reset, setValue } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  });
  
  if (isUserLoading || !currentUser) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }
  
  if (currentUser.role !== 'admin') {
    return <AccessDeniedMessage />;
  }

  const onSubmitForm = (data: TemplateFormData) => {
    if (editingTemplate) {
      const updatedTemplate = { ...editingTemplate, ...data };
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
      const globalIndex = sampleResumeTemplates.findIndex(t => t.id === editingTemplate.id);
      if (globalIndex > -1) sampleResumeTemplates[globalIndex] = updatedTemplate;
      toast({ title: "Template Updated", description: `Template "${data.name}" has been saved.` });
    } else {
      const newTemplate: ResumeTemplate = {
        id: `template-${Date.now()}`,
        ...data,
      };
      setTemplates(prev => [newTemplate, ...prev]);
      sampleResumeTemplates.unshift(newTemplate);
      toast({ title: "Template Created", description: `New template "${data.name}" has been added.` });
    }
    setIsFormDialogOpen(false);
    setEditingTemplate(null);
  };

  const openNewDialog = () => {
    setEditingTemplate(null);
    reset({
      name: "",
      description: "",
      previewImageUrl: "https://placehold.co/300x400.png?text=New+Template",
      category: "Modern",
      content: "[Your Name]\n[Contact Info]\n...",
    });
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (template: ResumeTemplate) => {
    setEditingTemplate(template);
    reset(template);
    setIsFormDialogOpen(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    const globalIndex = sampleResumeTemplates.findIndex(t => t.id === templateId);
    if (globalIndex > -1) sampleResumeTemplates.splice(globalIndex, 1);
    toast({ title: "Template Deleted", variant: "destructive" });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers3 className="h-8 w-8" /> Resume Template Designer
        </h1>
        <Button onClick={openNewDialog} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Template
        </Button>
      </div>
      <CardDescription>
        Manage the resume templates available to all users on the platform.
      </CardDescription>

      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) setEditingTemplate(null);
        setIsFormDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="template-name" {...field} />} />
            </div>
            <div>
              <Label htmlFor="template-desc">Description</Label>
              <Controller name="description" control={control} render={({ field }) => <Textarea id="template-desc" {...field} rows={3} />} />
            </div>
            <div>
              <Label htmlFor="template-category">Category</Label>
              <Controller name="category" control={control} render={({ field }) => <Input id="template-category" {...field} placeholder="e.g., Modern, Creative, Functional" />} />
            </div>
            <div>
              <Label htmlFor="template-img">Preview Image URL</Label>
              <Controller name="previewImageUrl" control={control} render={({ field }) => <Input id="template-img" {...field} />} />
            </div>
            <div>
              <Label htmlFor="template-content">Template Content (Placeholder Text)</Label>
              <Controller name="content" control={control} render={({ field }) => <Textarea id="template-content" {...field} rows={8} />} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit">{editingTemplate ? "Save Changes" : "Create Template"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Existing Templates</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(template)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
