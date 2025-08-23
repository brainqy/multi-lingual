
"use client";

import React from 'react';
import type { ResumeBuilderData, ResumeTemplate } from "@/types";
import { User, Phone, Mail, Linkedin, Home, Briefcase, GraduationCap, Star, Award, Languages, Heart } from 'lucide-react';

interface TemplateProps {
  data: ResumeBuilderData;
  templateId: string;
  styles?: Partial<Pick<ResumeTemplate, 'headerColor' | 'bodyColor' | 'headerFontSize' | 'textAlign'>>;
}

const CreativeTemplate = ({ data, styles }: TemplateProps) => {
  const formatResponsibilities = (text: string) => {
    return text.split('\n').map((line, index) => (
      <li key={index} className="text-sm">{line.startsWith('-') ? line.substring(1).trim() : line.trim()}</li>
    ));
  };
  
  const headerStyles: React.CSSProperties = {
    color: styles?.headerColor,
    fontSize: styles?.headerFontSize,
  };

  const bodyStyles: React.CSSProperties = {
    color: styles?.bodyColor,
  };

  const sectionHeaderStyles: React.CSSProperties = {
    color: styles?.headerColor,
  };
  
  const mainContentStyles: React.CSSProperties = {
    ...bodyStyles,
    textAlign: styles?.textAlign,
  };

  return (
    <div className="p-6 font-sans flex" style={bodyStyles}>
      {/* Left Sidebar */}
      <div className="w-1/3 bg-gray-100 p-4 rounded-l-lg">
        <h1 className="text-2xl font-bold" style={headerStyles}>{data.header.fullName}</h1>
        <p className="text-md font-medium mb-4" style={{ color: styles?.headerColor }}>{data.experience[0]?.jobTitle || 'Aspiring Professional'}</p>
        
        <div className="space-y-3 text-xs">
          {data.header.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3" style={{ color: styles?.headerColor }}/><span>{data.header.email}</span></div>}
          {data.header.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" style={{ color: styles?.headerColor }}/><span>{data.header.phone}</span></div>}
          {data.header.address && <div className="flex items-center gap-2"><Home className="h-3 w-3" style={{ color: styles?.headerColor }}/><span>{data.header.address}</span></div>}
          {data.header.linkedin && <div className="flex items-center gap-2"><Linkedin className="h-3 w-3" style={{ color: styles?.headerColor }}/><a href={data.header.linkedin} className="text-blue-600 hover:underline">LinkedIn</a></div>}
        </div>
        
        {data.skills.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1" style={sectionHeaderStyles}>Skills</h2>
            <div className="flex flex-wrap gap-1">
              {data.skills.map(skill => <span key={skill} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${styles?.headerColor}20`, color: styles?.headerColor }}>{skill}</span>)}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1" style={sectionHeaderStyles}>Education</h2>
            {data.education.map((edu, index) => (
              <div key={edu.id || index} className="mb-2 text-xs">
                <h3 className="font-semibold">{edu.degree}</h3>
                <p>{edu.university}</p>
                <p className="text-gray-500">{edu.graduationYear}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-6" style={mainContentStyles}>
        {data.summary && (
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-wide border-b-2 pb-1 mb-2" style={{ color: styles?.headerColor, borderColor: `${styles?.headerColor}30`}}>Profile</h2>
            <p className="text-sm whitespace-pre-line">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-wide border-b-2 pb-1 mb-2" style={{ color: styles?.headerColor, borderColor: `${styles?.headerColor}30`}}>Experience</h2>
            {data.experience.map((exp, index) => (
              <div key={exp.id || index} className="mb-3">
                <h3 className="text-md font-semibold">{exp.jobTitle}</h3>
                <p className="text-sm font-medium">{exp.company} | {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</p>
                {exp.responsibilities && <ul className="list-disc list-outside mt-1 ml-4">{formatResponsibilities(exp.responsibilities)}</ul>}
              </div>
            ))}
          </div>
        )}

        {data.additionalDetails && Object.values(data.additionalDetails).some(val => val && val.length > 0) && (
            <div className="mt-4">
                <h2 className="text-lg font-bold tracking-wide border-b-2 pb-1 mb-2" style={{ color: styles?.headerColor, borderColor: `${styles?.headerColor}30`}}>More</h2>
                {data.additionalDetails.awards && <div><h3 className="text-sm font-semibold inline-flex items-center gap-1"><Award className="h-4 w-4"/>Awards</h3><p className="text-xs pl-5">{data.additionalDetails.awards}</p></div>}
                {data.additionalDetails.languages && <div><h3 className="text-sm font-semibold inline-flex items-center gap-1"><Languages className="h-4 w-4"/>Languages</h3><p className="text-xs pl-5">{data.additionalDetails.languages}</p></div>}
                {data.additionalDetails.interests && <div><h3 className="text-sm font-semibold inline-flex items-center gap-1"><Heart className="h-4 w-4"/>Interests</h3><p className="text-xs pl-5">{data.additionalDetails.interests}</p></div>}
            </div>
        )}
      </div>
    </div>
  );
};

export default CreativeTemplate;
