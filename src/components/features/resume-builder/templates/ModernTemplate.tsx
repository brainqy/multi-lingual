
"use client";

import React from 'react';
import type { ResumeBuilderData } from "@/types";
import { cn } from '@/lib/utils';

interface TemplateProps {
  data: ResumeBuilderData;
  styles?: {
    headerColor?: string;
    bodyColor?: string;
    headerFontSize?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  onSelectElement: (elementId: string | null) => void;
  selectedElementId: string | null;
}

const ModernTemplate = ({ data, styles = {}, onSelectElement, selectedElementId }: TemplateProps) => {
  const formatResponsibilities = (text: string) => {
    return text.split('\n').map((line, index) => (
      <li key={index} className="ml-4 text-xs">{line.startsWith('-') ? line.substring(1).trim() : line.trim()}</li>
    ));
  };

  const getSectionClasses = (id: string) => {
    return cn(
        "cursor-pointer p-2 rounded transition-colors duration-200",
        selectedElementId === id ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-primary/5"
    );
  };

  return (
    <div className="p-4 text-sm font-sans" style={{ color: styles.bodyColor, textAlign: styles.textAlign }}>
      {/* Header Section */}
      <div className={cn("mb-3 border-b pb-2 border-slate-200", getSectionClasses('header'))} style={{ textAlign: 'center' }} onClick={() => onSelectElement('header')}>
        {data.header.fullName && <h1 className="text-xl font-bold" style={{ color: styles.headerColor, fontSize: styles.headerFontSize }}>{data.header.fullName}</h1>}
        <div className="text-xs text-slate-600 flex justify-center gap-x-2 flex-wrap">
          {data.header.phone && <span>{data.header.phone}</span>}
          {data.header.email && <span>| {data.header.email}</span>}
          {data.header.linkedin && <span>| <a href={`https://${data.header.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></span>}
          {data.header.portfolio && <span>| <a href={`https://${data.header.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portfolio</a></span>}
        </div>
        {data.header.address && <p className="text-xs text-slate-600 mt-0.5">{data.header.address}</p>}
      </div>

      {/* Summary Section */}
      {data.summary && (
        <div className={cn("mb-3", getSectionClasses('summary'))} onClick={() => onSelectElement('summary')}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles.headerColor }}>Summary</h2>
          <p className="text-xs text-slate-700 whitespace-pre-line">{data.summary}</p>
        </div>
      )}

      {/* Skills Section */}
      {data.skills.length > 0 && (
        <div className={cn("mb-3", getSectionClasses('skills'))} onClick={() => onSelectElement('skills')}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles.headerColor }}>Skills</h2>
          <p className="text-xs text-slate-700">{data.skills.join(" • ")}</p>
        </div>
      )}
      
      {/* Experience Section */}
      {data.experience.length > 0 && (
        <div className={cn("mb-3", getSectionClasses('experience'))} onClick={() => onSelectElement('experience')}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: styles.headerColor }}>Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={exp.id || index} className="mb-2">
              <h3 className="text-sm font-semibold text-slate-700">{exp.jobTitle}</h3>
              <p className="text-xs font-medium text-slate-600">{exp.company} {exp.location && `| ${exp.location}`}</p>
              <p className="text-xs text-slate-500 mb-0.5">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</p>
              {exp.responsibilities && <ul className="list-disc list-outside">{formatResponsibilities(exp.responsibilities)}</ul>}
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {data.education.length > 0 && (
        <div className={cn("mb-3", getSectionClasses('education'))} onClick={() => onSelectElement('education')}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: styles.headerColor }}>Education</h2>
          {data.education.map((edu, index) => (
            <div key={edu.id || index} className="mb-1.5">
              <h3 className="text-sm font-semibold text-slate-700">{edu.degree} {edu.major && `- ${edu.major}`}</h3>
              <p className="text-xs font-medium text-slate-600">{edu.university} {edu.location && `| ${edu.location}`}</p>
              <p className="text-xs text-slate-500 mb-0.5">Graduation: {edu.graduationYear}</p>
              {edu.details && <p className="text-xs text-slate-700 whitespace-pre-line">{edu.details}</p>}
            </div>
          ))}
        </div>
      )}
      
      {/* Additional Details Section */}
      {data.additionalDetails && Object.values(data.additionalDetails).some(val => val && val.length > 0) && (
        <div className={cn("mt-3 pt-2 border-t border-slate-200", getSectionClasses('additionalDetails'))} onClick={() => onSelectElement('additionalDetails')}>
          {data.additionalDetails.awards && data.additionalDetails.awards.length > 0 && (
            <div className="mb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles.headerColor }}>Awards</h2>
              <p className="text-xs text-slate-700 whitespace-pre-line">{data.additionalDetails.awards}</p>
            </div>
          )}
          {data.additionalDetails.certifications && data.additionalDetails.certifications.length > 0 && (
            <div className="mb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles.headerColor }}>Certifications</h2>
              <p className="text-xs text-slate-700 whitespace-pre-line">{data.additionalDetails.certifications}</p>
            </div>
          )}
          {data.additionalDetails.languages && data.additionalDetails.languages.length > 0 && (
            <div className="mb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles.headerColor }}>Languages</h2>
              <p className="text-xs text-slate-700 whitespace-pre-line">{data.additionalDetails.languages}</p>
            </div>
          )}
          {data.additionalDetails.interests && data.additionalDetails.interests.length > 0 && (
            <div className="mb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles.headerColor }}>Interests</h2>
              <p className="text-xs text-slate-700 whitespace-pre-line">{data.additionalDetails.interests}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModernTemplate;
