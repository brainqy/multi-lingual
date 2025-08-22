
"use client";

import React, { forwardRef } from 'react';
import type { ResumeBuilderData } from "@/types";
import { Card, CardContent } from '@/components/ui/card';
import { sampleResumeTemplates } from '@/lib/sample-data';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';

interface ResumePreviewProps {
  data: ResumeBuilderData;
  templateId: string;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, templateId }, ref) => {
    const template = sampleResumeTemplates.find(t => t.id === templateId);

    const renderTemplate = () => {
      switch (templateId) {
        case 'template2':
        case 'template4': // Let's use creative for academic for now
          return <CreativeTemplate data={data} />;
        case 'template1':
        case 'template3':
        default:
          return <ModernTemplate data={data} />;
      }
    };

    return (
      <div className="sticky top-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-slate-700">Live Preview</h3>
        </div>
        <Card ref={ref} id="resume-preview-content" className="shadow-lg border-slate-300 h-[calc(100vh-10rem)] overflow-y-auto">
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
