
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import type { ResumeTemplate } from "@/types";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  templates: ResumeTemplate[];
  currentTemplateId: string;
}

const logger = {
    log: (message: string, ...args: any[]) => console.log(`[TemplateSelectionDialog] ${message}`, ...args),
};

export default function TemplateSelectionDialog({ isOpen, onClose, onSelect, templates, currentTemplateId }: TemplateSelectionDialogProps) {
  
  const handleSelect = (templateId: string) => {
    logger.log('handleSelect: Template clicked!', { templateId });
    onSelect(templateId);
    logger.log('handleSelect: onSelect prop called.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose a Resume Template</DialogTitle>
          <DialogDescription>
            Select a new template below. The live preview will update instantly.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 -mx-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {templates.map(template => (
              <Card
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={cn(
                  "cursor-pointer hover:shadow-lg hover:border-primary transition-all relative",
                  currentTemplateId === template.id && "border-2 border-primary ring-2 ring-primary ring-offset-2"
                )}
              >
                {currentTemplateId === template.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 z-10">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
                <CardContent className="p-2">
                  <div className="relative w-full aspect-[3/4] bg-secondary">
                    <Image
                      src={template.previewImageUrl}
                      alt={template.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="p-1"
                    />
                  </div>
                </CardContent>
                <CardHeader className="p-2 pt-0">
                  <CardTitle className="text-sm text-center">{template.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
