
"use client";

import React from 'react';
import type { ResumeBuilderData } from "@/types";
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface TemplateProps {
  data: ResumeBuilderData;
  onSelectElement: (elementId: string | null) => void;
  selectedElementId: string | null;
  onDataChange: (field: string, value: string) => void;
}

const SortableSection = ({ id, children, onSelectElement, selectedElementId }: { id: string, children: React.ReactNode, onSelectElement: (id: string) => void, selectedElementId: string | null }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    const getSectionClasses = (sectionId: string) => {
      return cn(
          "cursor-pointer p-2 rounded transition-colors duration-200 relative group",
          selectedElementId === sectionId ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-primary/5"
      );
    };

    return (
        <div ref={setNodeRef} style={style} className={getSectionClasses(id)} onClick={() => onSelectElement(id)}>
            <button {...listeners} {...attributes} className="absolute top-2 right-2 p-1 opacity-20 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <GripVertical className="h-4 w-4" />
            </button>
            {children}
        </div>
    );
};


const ModernTemplate = ({ data, onSelectElement, selectedElementId, onDataChange }: TemplateProps) => {
  const { styles, sectionOrder } = data;

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

  const Header = () => (
     <div className={cn("mb-3 border-b pb-2 border-slate-200", getSectionClasses('header'))} style={{ textAlign: 'center' }} onClick={() => onSelectElement('header')}>
        {data.header.fullName && <h1 
            className="text-xl font-bold" 
            style={{ color: styles?.headerColor, fontSize: styles?.headerFontSize }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onDataChange('header.fullName', e.currentTarget.textContent || '')}
        >{data.header.fullName}</h1>}
        <div className="text-xs text-slate-600 flex justify-center gap-x-2 flex-wrap">
          {data.header.phone && <span>{data.header.phone}</span>}
          {data.header.email && <span>| {data.header.email}</span>}
          {data.header.linkedin && <span>| <a href={`https://${data.header.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></span>}
          {data.header.portfolio && <span>| <a href={`https://${data.header.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portfolio</a></span>}
        </div>
        {data.header.address && <p className="text-xs text-slate-600 mt-0.5">{data.header.address}</p>}
      </div>
  );
  
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
        case 'summary':
            return data.summary ? (
                <SortableSection id="summary" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                    <div onClick={() => onSelectElement('summary')}>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles?.headerColor }}>Summary</h2>
                        <p 
                            className="text-xs text-slate-700 whitespace-pre-line"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => onDataChange('summary', e.currentTarget.textContent || '')}
                        >
                            {data.summary}
                        </p>
                    </div>
                </SortableSection>
            ) : null;
        case 'skills':
            return data.skills.length > 0 ? (
                <SortableSection id="skills" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                    <div onClick={() => onSelectElement('skills')}>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles?.headerColor }}>Skills</h2>
                        <p 
                            className="text-xs text-slate-700"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => onDataChange('skills', e.currentTarget.textContent || '')}
                        >{data.skills.join(" • ")}</p>
                    </div>
                </SortableSection>
            ) : null;
        case 'experience':
            return data.experience.length > 0 ? (
                 <SortableSection id="experience" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                    <div onClick={() => onSelectElement('experience')}>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Experience</h2>
                        {data.experience.map((exp, index) => (
                            <div key={exp.id || index} className="mb-2">
                            <h3 className="text-sm font-semibold text-slate-700">{exp.jobTitle}</h3>
                            <p className="text-xs font-medium text-slate-600">{exp.company} {exp.location && `| ${exp.location}`}</p>
                            <p className="text-xs text-slate-500 mb-0.5">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</p>
                            {exp.responsibilities && <ul className="list-disc list-outside">{formatResponsibilities(exp.responsibilities)}</ul>}
                            </div>
                        ))}
                    </div>
                 </SortableSection>
            ) : null;
        case 'education':
             return data.education.length > 0 ? (
                <SortableSection id="education" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                    <div onClick={() => onSelectElement('education')}>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Education</h2>
                        {data.education.map((edu, index) => (
                            <div key={edu.id || index} className="mb-1.5">
                            <h3 className="text-sm font-semibold text-slate-700">{edu.degree} {edu.major && `- ${edu.major}`}</h3>
                            <p className="text-xs font-medium text-slate-600">{edu.university} {edu.location && `| ${edu.location}`}</p>
                            <p className="text-xs text-slate-500 mb-0.5">Graduation: {edu.graduationYear}</p>
                            {edu.details && <p className="text-xs text-slate-700 whitespace-pre-line">{edu.details}</p>}
                            </div>
                        ))}
                    </div>
                </SortableSection>
            ) : null;
        default:
            if (sectionId.startsWith('custom-')) {
                const key = sectionId.replace('custom-', '');
                const value = data.additionalDetails?.main[key] || data.additionalDetails?.sidebar[key];
                if (!value) return null;
                return (
                    <SortableSection id={sectionId} onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                        <div onClick={() => onSelectElement(sectionId)}>
                             <h2 className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: styles?.headerColor }}>
                                {key.replace(/_/g, ' ')}
                            </h2>
                            <p 
                                className="text-xs text-slate-700 whitespace-pre-line"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => onDataChange(`custom-${key}`, e.currentTarget.textContent || '')}
                            >
                                {value}
                            </p>
                        </div>
                    </SortableSection>
                );
            }
            return null;
    }
  };

  return (
    <div className="p-4 text-sm font-sans" style={{ color: styles?.bodyColor, textAlign: styles?.textAlign }}>
      <Header />
      <div className="space-y-3">
        {sectionOrder.map(sectionId => (
            <div key={sectionId}>
                {renderSection(sectionId)}
            </div>
        ))}
      </div>
    </div>
  );
};

export default ModernTemplate;
