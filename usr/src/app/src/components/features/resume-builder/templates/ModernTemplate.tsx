
"use client";

import React from 'react';
import type { ResumeBuilderData, ResumeTemplate } from "@/types";
import { User, Phone, Mail, Linkedin, Home, Briefcase, GraduationCap, Star, Award, Languages, Heart } from 'lucide-react';

interface TemplateProps {
  data: ResumeBuilderData;
  templateId: string;
  styles?: Partial<Pick<ResumeTemplate, 'headerColor' | 'bodyColor' | 'headerFontSize' | 'textAlign' | 'layout'>>;
}

const OneColumnLayout = ({ data, styles }: Omit<TemplateProps, 'templateId'>) => {
  const formatResponsibilities = (text: string) => {
    return text.split('\n').map((line, index) => (
      <li key={index} className="ml-4 text-xs">{line.startsWith('-') ? line.substring(1).trim() : line.trim()}</li>
    ));
  };
  
  return (
    <div className="p-4 text-sm font-sans" style={{ color: styles?.bodyColor, textAlign: styles?.textAlign }}>
      {/* Header Section */}
      <div className="text-center mb-3 border-b pb-2 border-slate-200">
        {data.header.fullName && <h1 className="text-xl font-bold" style={{ color: styles?.headerColor, fontSize: styles?.headerFontSize }}>{data.header.fullName}</h1>}
        <div className="text-xs text-slate-600 flex justify-center gap-x-2 flex-wrap">
          {data.header.phone && <span>{data.header.phone}</span>}
          {data.header.email && <span>| {data.header.email}</span>}
          {data.header.linkedin && <span>| <a href={data.header.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></span>}
          {data.header.portfolio && <span>| <a href={data.header.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portfolio</a></span>}
        </div>
        {data.header.address && <p className="text-xs text-slate-600 mt-0.5">{data.header.address}</p>}
      </div>

      {/* Summary Section */}
      {data.summary && (
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles?.headerColor }}>Summary</h2>
          <p className="text-xs whitespace-pre-line">{data.summary}</p>
        </div>
      )}

      {/* Skills Section */}
      {data.skills.length > 0 && (
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles?.headerColor }}>Skills</h2>
          <p className="text-xs">{data.skills.join(" • ")}</p>
        </div>
      )}
      
      {/* Experience Section */}
      {data.experience.length > 0 && (
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={exp.id || index} className="mb-2">
              <h3 className="text-sm font-semibold">{exp.jobTitle}</h3>
              <p className="text-xs font-medium text-slate-600">{exp.company} {exp.location && `| ${exp.location}`}</p>
              <p className="text-xs text-slate-500 mb-0.5">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</p>
              {exp.responsibilities && <ul className="list-disc list-outside">{formatResponsibilities(exp.responsibilities)}</ul>}
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {data.education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Education</h2>
          {data.education.map((edu, index) => (
            <div key={edu.id || index} className="mb-1.5">
              <h3 className="text-sm font-semibold">{edu.degree} {edu.major && `- ${edu.major}`}</h3>
              <p className="text-xs font-medium text-slate-600">{edu.university} {edu.location && `| ${edu.location}`}</p>
              <p className="text-xs text-slate-500 mb-0.5">Graduation: {edu.graduationYear}</p>
              {edu.details && <p className="text-xs whitespace-pre-line">{edu.details}</p>}
            </div>
          ))}
        </div>
      )}
      
      {data.additionalDetails && Object.values(data.additionalDetails).some(val => val && val.length > 0) && (
        <div className="mt-3 pt-2 border-t border-slate-200">
          {Object.entries(data.additionalDetails).map(([key, value]) => {
            if (value && value.length > 0) {
              const title = key.charAt(0).toUpperCase() + key.slice(1);
              return (
                <div key={key} className="mb-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles?.headerColor }}>{title}</h2>
                  <p className="text-xs whitespace-pre-line">{value}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

const TwoColumnLayout = ({ data, styles }: Omit<TemplateProps, 'templateId'>) => {
  const formatResponsibilities = (text: string) => {
    return text.split('\n').map((line, index) => (
      <li key={index} className="ml-4 text-xs">{line.startsWith('-') ? line.substring(1).trim() : line.trim()}</li>
    ));
  };

  return (
    <div className="p-4 font-sans text-sm flex gap-4" style={{ color: styles?.bodyColor }}>
      {/* Left Sidebar */}
      <div className="w-1/3 pr-4 border-r border-slate-200 space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Contact</h2>
          <div className="space-y-1 text-xs">
            {data.header.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3 shrink-0" /><span>{data.header.phone}</span></div>}
            {data.header.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3 shrink-0" /><span>{data.header.email}</span></div>}
            {data.header.address && <div className="flex items-center gap-2"><Home className="h-3 w-3 shrink-0" /><span>{data.header.address}</span></div>}
            {data.header.linkedin && <div className="flex items-center gap-2"><Linkedin className="h-3 w-3 shrink-0" /><a href={data.header.linkedin} className="text-blue-600 hover:underline truncate">LinkedIn</a></div>}
            {data.header.portfolio && <div className="flex items-center gap-2"><User className="h-3 w-3 shrink-0" /><a href={data.header.portfolio} className="text-blue-600 hover:underline truncate">Portfolio</a></div>}
          </div>
        </div>
        
        {data.skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Skills</h2>
            <ul className="list-disc list-inside text-xs space-y-0.5">
                {data.skills.map(skill => <li key={skill}>{skill}</li>)}
            </ul>
          </div>
        )}

        {data.education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Education</h2>
            {data.education.map((edu, index) => (
              <div key={edu.id || index} className="mb-2 text-xs">
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-slate-600">{edu.university}</p>
                <p className="text-slate-500">{edu.graduationYear}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="w-2/3">
        <div className="mb-3" style={{ textAlign: styles?.textAlign }}>
            <h1 className="text-xl font-bold" style={{ color: styles?.headerColor, fontSize: styles?.headerFontSize }}>{data.header.fullName}</h1>
        </div>

        {data.summary && (
            <div className="mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles?.headerColor }}>Summary</h2>
            <p className="text-xs whitespace-pre-line">{data.summary}</p>
            </div>
        )}

        {data.experience.length > 0 && (
            <div className="mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Experience</h2>
            {data.experience.map((exp, index) => (
                <div key={exp.id || index} className="mb-2">
                <h3 className="text-sm font-semibold">{exp.jobTitle}</h3>
                <p className="text-xs font-medium text-slate-600">{exp.company} {exp.location && `| ${exp.location}`}</p>
                <p className="text-xs text-slate-500 mb-0.5">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</p>
                {exp.responsibilities && <ul className="list-disc list-outside">{formatResponsibilities(exp.responsibilities)}</ul>}
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}

const ModernTemplate = ({ data, styles }: Omit<TemplateProps, 'templateId'>) => {
    const gridBackgroundStyles: React.CSSProperties = {
        backgroundImage:
          `linear-gradient(to right, #e2e8f0 1px, transparent 1px),
           linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
    };

    if (styles?.layout === 'two-column') {
        return <div style={gridBackgroundStyles}><TwoColumnLayout data={data} styles={styles} /></div>;
    }
    
    return <div style={gridBackgroundStyles}><OneColumnLayout data={data} styles={styles} /></div>;
};

export default ModernTemplate;
