"use client";

import type React from 'react';
import type { ResumeBuilderData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { sampleResumeTemplates } from '@/lib/sample-data'; // To get template name

interface ResumePreviewProps {
  data: ResumeBuilderData;
  templateId: string; // The ID of the template being used
}

// This is a VERY simplified preview. A real implementation would involve
// rendering HTML based on the selected template and data, possibly using iframes or complex styling.
export default function ResumePreview({ data, templateId }: ResumePreviewProps) {
  const template = sampleResumeTemplates.find(t => t.id === templateId);

  const formatResponsibilities = (text: string) => {
    return text.split('\n').map((line, index) => (
      <li key={index} className="ml-4 text-xs">{line.startsWith('-') ? line.substring(1).trim() : line.trim()}</li>
    ));
  };

  return (
    <div className="sticky top-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-slate-700">Live Preview</h3>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
            <Maximize2 className="h-4 w-4"/>
        </Button>
      </div>
      <Card className="shadow-lg border-slate-300 h-[calc(100vh-12rem)] overflow-y-auto"> {/* Adjust height as needed */}
        <CardContent className="p-4 text-sm font-sans text-slate-800">
          {/* Header Section */}
          <div className="text-center mb-3 border-b pb-2 border-slate-200">
            {data.header.fullName && <h1 className="text-xl font-bold">{data.header.fullName}</h1>}
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
              <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-0.5">Summary</h2>
              <p className="text-xs text-slate-700 whitespace-pre-line">{data.summary}</p>
            </div>
          )}

          {/* Skills Section */}
          {data.skills.length > 0 && (
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-0.5">Skills</h2>
              <p className="text-xs text-slate-700">{data.skills.join(" • ")}</p>
            </div>
          )}
          
          {/* Experience Section */}
          {data.experience.length > 0 && (
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">Experience</h2>
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
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">Education</h2>
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
            <div className="mt-3 pt-2 border-t border-slate-200">
              {data.additionalDetails.awards && data.additionalDetails.awards.length > 0 && (
                <div className="mb-1.5">
                  <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-0.5">Awards</h2>
                  <p className="text-xs text-slate-700 whitespace-pre-line">{data.additionalDetails.awards}</p>
                </div>
              )}
              {data.additionalDetails.certifications && data.additionalDetails.certifications.length > 0 && (
                <div className="mb-1.5">
                  <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-0.5">Certifications</h2>
                  <p className="text-xs text-slate-700 whitespace-pre-line">{data.additionalDetails.certifications}</p>
                </div>
              )}
              {data.additionalDetails.languages && data.additionalDetails.languages.length > 0 && (
                <div className="mb-1.5">
                  <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-0.5">Languages</h2>
                  <p className="text-xs text-slate-700 whitespace-pre-line">{data.additionalDetails.languages}</p>
                </div>
              )}
              {data.additionalDetails.interests && data.additionalDetails.interests.length > 0 && (
                <div className="mb-1.5">
                  <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-0.5">Interests</h2>
                  <p className="text-xs text-slate-700 whitespace-pre-line">{data.additionalDetails.interests}</p>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-[8px] text-slate-400 mt-4">
            Template: {template ? template.name : 'Default'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}