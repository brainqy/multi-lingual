
"use client";

import React, { forwardRef } from 'react';
import type { ResumeBuilderData, ResumeTemplate } from "@/types";
import { Card, CardContent } from '@/components/ui/card';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';

interface ResumePreviewProps {
  data: ResumeBuilderData;
  templateId: string;
  templates: ResumeTemplate[];
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, templateId, templates }, ref) => {
    const template = templates.find(t => t.id === templateId);

    const styles = {
      headerColor: template?.headerColor,
      bodyColor: template?.bodyColor,
      headerFontSize: template?.headerFontSize,
      textAlign: template?.textAlign,
    };

    const renderTemplate = () => {
      switch (templateId) {
        case 'template2':
        case 'template4': // Let's use creative for academic for now
          return <CreativeTemplate data={data} styles={styles} />;
        case 'template1':
        case 'template3':
        default:
          return <ModernTemplate data={data} styles={styles} />;
      }
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
