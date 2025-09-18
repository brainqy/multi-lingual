
"use client";

import React from 'react';
import type { ResumeBuilderData } from "@/types";
import { User, Phone, Mail, Linkedin, Home, Briefcase, GraduationCap, Star, Award, Languages, Heart, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface TemplateProps {
  data: ResumeBuilderData;
  onSelectElement: (elementId: string | null) => void;
  selectedElementId: string | null;
  onDataChange: (field: string, value: string) => void;
}

const SortableSection = ({ id, children, onSelectElement, selectedElementId, className }: { id: string, children: React.ReactNode, onSelectElement: (id: string) => void, selectedElementId: string | null, className?: string }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    const getSectionClasses = (sectionId: string) => {
      return cn(
          "cursor-pointer p-2 rounded transition-colors duration-200 relative group",
          selectedElementId === sectionId ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-primary/5"
      );
    };

    return (
        <div ref={setNodeRef} style={style} className={cn(getSectionClasses(id), className)} onClick={() => onSelectElement(id)}>
            <button {...listeners} {...attributes} className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-50 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <GripVertical className="h-4 w-4" />
            </button>
            {children}
        </div>
    );
};

const CreativeTemplate = ({ data, onSelectElement, selectedElementId, onDataChange }: TemplateProps) => {
  const { layout, styles, sectionOrder } = data;

  const formatResponsibilities = (text: string) => {
    return text.split('\n').map((line, index) => {
      const content = line.startsWith('-') ? line.substring(1).trim() : line.trim();
      if (!content) return null;
      return <li key={index} className="text-sm leading-relaxed mb-1">{content}</li>
    }).filter(Boolean);
  };
  
  const getFontClass = () => {
    switch (styles?.fontFamily) {
        case 'serif': return 'font-serif';
        case 'mono': return 'font-mono';
        default: return 'font-sans';
    }
  };
  
  const renderSection = (sectionId: string) => {
    const sectionComponents: Record<string, React.ReactNode> = {
        'summary': data.summary ? (
            <SortableSection id="summary" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-1 text-gray-700">Summary</h2>
                <div className="w-10 border-b-2 border-gray-300 mb-2"></div>
                <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{data.summary}</p>
            </SortableSection>
        ) : null,
        'skills': data.skills && data.skills.length > 0 ? (
            <SortableSection id="skills" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-1 text-gray-700">Skills</h2>
                <div className="w-10 border-b-2 border-gray-300 mb-2"></div>
                <p className="text-xs text-gray-600">{data.skills.join(', ')}</p>
            </SortableSection>
        ) : null,
        'education': data.education && data.education.length > 0 ? (
            <SortableSection id="education" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-1 text-gray-700">Education</h2>
                <div className="w-10 border-b-2 border-gray-300 mb-2"></div>
                {data.education.map((edu, index) => (
                    <div key={edu.id || index} className="mb-2 text-xs">
                        <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.university}, {edu.graduationYear}</p>
                    </div>
                ))}
            </SortableSection>
        ) : null,
        'experience': data.experience && data.experience.length > 0 ? (
            <SortableSection id="experience" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                <h2 className="text-lg font-bold uppercase tracking-wider mb-1 text-gray-800">Work Experience</h2>
                <div className="w-16 border-b-2 border-gray-300 mb-3"></div>
                {data.experience.map((exp, index) => (
                <div key={exp.id || index} className="mb-4 grid grid-cols-[80px_1fr] gap-x-4">
                    <div className="text-xs text-gray-500 font-medium pt-1">
                        <p>{exp.startDate}</p>
                        <p>{exp.isCurrent ? 'Current' : exp.endDate}</p>
                    </div>
                    <div>
                        <h3 className="text-md font-bold text-gray-800">{exp.jobTitle}</h3>
                        <p className="text-sm font-semibold text-gray-600 mb-1">{exp.company}</p>
                        {exp.responsibilities && <ul className="list-disc list-outside space-y-1 ml-4 text-gray-700">{formatResponsibilities(exp.responsibilities)}</ul>}
                    </div>
                </div>
                ))}
            </SortableSection>
        ) : null
    };

    if (sectionId.startsWith('custom-')) {
        const key = sectionId.replace('custom-', '');
        const value = data.additionalDetails?.main[key] || data.additionalDetails?.sidebar[key];
        if (!value) return null;
        return (
            <SortableSection id={sectionId} onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-1 text-gray-700">{key.replace(/_/g, ' ')}</h2>
                <div className="w-10 border-b-2 border-gray-300 mb-2"></div>
                <p className="text-xs text-gray-600 whitespace-pre-line">{value}</p>
            </SortableSection>
        );
    }

    return sectionComponents[sectionId] || null;
  };
  
  const mainSections = sectionOrder.filter(id => !['summary', 'skills', 'education'].some(sidebarId => id.includes(sidebarId)));
  const sidebarSections = sectionOrder.filter(id => ['summary', 'skills', 'education'].some(sidebarId => id.includes(sidebarId)));
  
  const SidebarContent = () => (
     <div className="space-y-4">
        <div className={cn("text-xs text-gray-600 space-y-1 cursor-pointer p-2 rounded transition-colors duration-200", selectedElementId === 'header' ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-primary/5")} onClick={() => onSelectElement('header')}>
          {data.header.address && <div className="flex items-center gap-2"><Home className="h-3 w-3 shrink-0" /><span>{data.header.address}</span></div>}
          {data.header.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3 shrink-0" /><span>{data.header.phone}</span></div>}
          {data.header.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3 shrink-0" /><span>{data.header.email}</span></div>}
          {data.header.linkedin && <div className="flex items-center gap-2"><Linkedin className="h-3 w-3 shrink-0" /><span>{data.header.linkedin}</span></div>}
        </div>
        <div className="border-b border-gray-300"></div>
        {sidebarSections.map(id => <div key={id}>{renderSection(id)}</div>)}
     </div>
  );

  const MainContent = () => (
     <div className="space-y-4">
        <div className={cn("pb-2 cursor-pointer p-2 rounded transition-colors duration-200", selectedElementId === 'header' ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-primary/5")} onClick={() => onSelectElement('header')}>
            <h1 className="text-4xl font-bold text-gray-900">{data.header.fullName}</h1>
            <p className="text-lg font-medium text-gray-700">{data.header.jobTitle}</p>
        </div>
        <div className="border-b-2 border-gray-400"></div>
        {mainSections.map(id => <div key={id}>{renderSection(id)}</div>)}
     </div>
  );

  return (
    <div 
        className={cn("p-8 text-gray-800 bg-white shadow-lg w-[210mm] min-h-[297mm] aspect-[210/297]", getFontClass())}
        style={{ color: styles?.bodyColor }}
    >
        {layout && layout.startsWith('two-column') ? (
            <div className={cn(
              "flex gap-6 h-full",
              layout === 'two-column-right' ? 'flex-row-reverse' : 'flex-row'
            )}>
                <aside className="w-1/3">
                    <SidebarContent/>
                </aside>
                <div className="w-px bg-gray-300"></div>
                <main className="w-2/3" style={{ textAlign: styles?.textAlign }}>
                    <MainContent/>
                </main>
            </div>
        ) : (
             <div className="space-y-4">
                <MainContent />
                <div className="border-t-2 my-4"></div>
                <SidebarContent />
             </div>
        )}
    </div>
  );
};

export default CreativeTemplate;
