
"use client";
import { useI18n } from "@/hooks/use-i18n";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Search, Eye, Download, Edit, PlusCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { sampleResumeTemplates, sampleResumeProfiles } from "@/lib/sample-data";
import type { ResumeTemplate, ResumeProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

export default function ResumeTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const { toast } = useToast();
  const { user: currentUser, isLoading } = useAuth();

  const allCategories = Array.from(new Set(sampleResumeTemplates.map(template => template.category)));

  const filteredTemplates = sampleResumeTemplates.filter(template => {
    const matchesSearch = searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const openPreviewDialog = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleUseTemplate = (template: ResumeTemplate) => {
    if (!currentUser) return;
    
    const newResumeName = `Resume from ${template.name} (${new Date().toLocaleDateString()})`;
    const newResume: ResumeProfile = {
      id: `resume-${Date.now()}`,
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      name: newResumeName,
      resumeText: template.content, // Use the template's content
      lastAnalyzed: undefined,
    };

    // Add to global sample data (for demo persistence across app)
    // In a real app, this would be an API call to save to backend.
    sampleResumeProfiles.unshift(newResume); 

    toast({ 
      title: "Resume Created from Template", 
      description: `"${newResumeName}" has been added to 'My Resumes'. You can edit it there.` 
    });
    setIsPreviewOpen(false); // Close the preview dialog
  };
  
  const handleEditTemplate = (templateName: string) => {
    toast({
      title: "Edit Template (Mock)",
      description: `Editing features for "${templateName}" are not yet implemented. This would be an admin feature.`,
    });
  };
  
  const handleDownloadTemplate = (templateName: string) => {
     toast({
      title: "Download Template (Mock)",
      description: `Download functionality for "${templateName}" is not yet implemented.`,
    });
  }
  
  if (isLoading || !currentUser) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers className="h-8 w-8" /> Resume Templates
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-grow-0 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <CardDescription>Choose from a variety of professionally designed resume templates to get started.</CardDescription>

      {filteredTemplates.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Templates Found</CardTitle>
            <CardDescription>
              Try adjusting your search or filter criteria.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden">
              <div className="relative w-full aspect-[3/4] bg-secondary">
                <Image
                  src={template.previewImageUrl}
                  alt={template.name}
                  fill
                  style={{ objectFit: "contain" }}
                  className="p-2"
                  data-ai-hint={template.dataAiHint || "resume template"}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl leading-tight">{template.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{template.category}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{template.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
                <Button variant="outline" size="sm" onClick={() => openPreviewDialog(template)}>
                  <Eye className="mr-1 h-4 w-4" /> Preview
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleUseTemplate(template)}>
                   <PlusCircle className="mr-2 h-4 w-4" /> Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl p-0">
          {selectedTemplate && (
            <>
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl">{selectedTemplate.name}</DialogTitle>
                <CardDescription>{selectedTemplate.description}</CardDescription>
              </DialogHeader>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="aspect-[8.5/11] w-full max-w-xl mx-auto bg-secondary shadow-lg">
                  <Image
                    src={selectedTemplate.previewImageUrl.replace('/300/400', '/800/1035')} 
                    alt={`${selectedTemplate.name} Preview`}
                    width={800}
                    height={1035}
                    style={{ objectFit: "contain" }}
                    className="border"
                    data-ai-hint={selectedTemplate.dataAiHint || "resume preview"}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-6 border-t bg-background">
                <Button variant="outline" onClick={() => handleEditTemplate(selectedTemplate.name)}>
                  <Edit className="mr-2 h-4 w-4" /> Customize (Mock)
                </Button>
                <Button variant="outline" onClick={() => handleDownloadTemplate(selectedTemplate.name)}>
                  <Download className="mr-2 h-4 w-4" /> Download (Mock)
                </Button>
                <Button onClick={() => handleUseTemplate(selectedTemplate)} className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" /> Use This Template
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
