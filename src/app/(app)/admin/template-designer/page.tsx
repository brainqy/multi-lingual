
"use client";
import { useState, useEffect, useCallback } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";
import { getResumeTemplates, createResumeTemplate, updateResumeTemplate, deleteResumeTemplate } from "@/lib/actions/templates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const templateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  previewImageUrl: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  dataAiHint: z.string().optional(),
  content: z.string().min(50, "Template content is required"),
  // New styling fields
  headerColor: z.string().optional(),
  bodyColor: z.string().optional(),
  headerFontSize: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function TemplateDesignerPage() {
  const { user: currentUser, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResumeTemplate | null>(null);

  const { control, handleSubmit, reset, setValue } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  });
  
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

  const onSubmitForm = async (data: TemplateFormData) => {
    if (editingTemplate) {
      const updated = await updateResumeTemplate(editingTemplate.id, data);
      if (updated) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updated : t));
        toast({ title: "Template Updated", description: `Template "${data.name}" has been saved.` });
      }
    } else {
      const created = await createResumeTemplate(data as Omit<ResumeTemplate, 'id'>);
      if (created) {
        setTemplates(prev => [created, ...prev]);
        toast({ title: "Template Created", description: `New template "${data.name}" has been added.` });
      }
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
      headerColor: '',
      bodyColor: '',
      headerFontSize: '1.5rem',
      textAlign: 'left',
    });
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (template: ResumeTemplate) => {
    setEditingTemplate(template);
    reset(template);
    setIsFormDialogOpen(true);
  };

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
              <Controller name="category" control={control} render={({ field }) => <Input id="template-category" {...field} placeholder="e.g., Modern, Creative, Professional" />} />
            </div>
             <div>
              <Label htmlFor="template-img">Preview Image URL</Label>
              <Controller name="previewImageUrl" control={control} render={({ field }) => <Input id="template-img" {...field} />} />
            </div>
            
            <h3 className="text-lg font-semibold pt-4 border-t">Styling Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <Label htmlFor="template-headerColor">Header Color</Label>
                  <Controller name="headerColor" control={control} render={({ field }) => <Input id="template-headerColor" {...field} placeholder="e.g., #008080 or hsl(180 100% 25%)" />} />
               </div>
               <div>
                  <Label htmlFor="template-bodyColor">Body Text Color</Label>
                  <Controller name="bodyColor" control={control} render={({ field }) => <Input id="template-bodyColor" {...field} placeholder="e.g., #333333" />} />
               </div>
               <div>
                  <Label htmlFor="template-headerFontSize">Header Font Size</Label>
                  <Controller name="headerFontSize" control={control} render={({ field }) => <Input id="template-headerFontSize" {...field} placeholder="e.g., 1.5rem, 24px" />} />
               </div>
               <div>
                  <Label htmlFor="template-textAlign">Text Align</Label>
                  <Controller name="textAlign" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
               </div>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
