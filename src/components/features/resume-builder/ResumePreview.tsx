
"use client";

import React, { forwardRef, useRef, useLayoutEffect, useState } from 'react';
import type { ResumeBuilderData, ResumeTemplate } from "@/types";
import { Card, CardContent } from '@/components/ui/card';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';


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

    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const calculateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const resumeWidth = 8.5 * 96; // A4 width in pixels at 96 DPI (approx 816px)
                if (containerWidth < resumeWidth) {
                    setScale(containerWidth / resumeWidth);
                } else {
                    setScale(1);
                }
            }
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);


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
        <SortableContext items={sectionOrder || []} strategy={verticalListSortingStrategy}>
            {templateContent}
        </SortableContext>
      )
    };

    return (
      <div className="sticky top-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-slate-700">Live Preview</h3>
        </div>
        <div ref={containerRef} className="w-full">
            <div
                style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                className="w-[210mm]" // Fixed A4 width
            >
                <Card ref={ref} className="shadow-lg border-slate-300">
                  <CardContent className="p-0">
                    {renderTemplate()}
                    <p className="text-center text-[8px] text-slate-400 mt-4 p-2">
                      Template: {template ? template.name : 'Default'}
                    </p>
                  </CardContent>
                </Card>
            </div>
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
