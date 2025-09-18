
"use client";

import React, { forwardRef } from 'react';
import type { ResumeBuilderData, ResumeTemplate } from "@/types";
import { Card, CardContent } from '@/components/ui/card';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface ResumePreviewProps {
  resumeData: ResumeBuilderData;
  templates: ResumeTemplate[];
  onSelectElement: (elementId: string | null) => void;
  selectedElementId: string | null;
  onDataChange?: (field: string, value: string) => void; // Make optional for reuse
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ resumeData, templates, onSelectElement, selectedElementId, onDataChange = () => {} }, ref) => {
    const { templateId, sectionOrder } = resumeData;

    const template = templates.find(t => t.id === templateId);

    const renderTemplate = () => {
      const templateCategory = template?.category?.toLowerCase();
      
      const templateProps = {
        data: resumeData,
        onSelectElement: onSelectElement,
        selectedElementId: selectedElementId,
        onDataChange: onDataChange,
      };

      const templateContent = (() => {
        switch (templateCategory) {
          case 'creative':
          case 'academic':
            return <CreativeTemplate {...templateProps} />;
          case 'modern':
          case 'professional':
          default:
            return <ModernTemplate {...templateProps} />;
        }
      })();
      
      return (
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            {templateContent}
        </SortableContext>
      )
    };

    return (
      <div className="sticky top-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-slate-700">Live Preview</h3>
        </div>
        <Card ref={ref} id="resume-preview-content" className="shadow-lg border-slate-300">
          <CardContent className="p-0">
            {renderTemplate()}
            <p className="text-center text-[8px] text-slate-400 mt-4 p-2">
              Template: {template ? template.name : 'Default'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
