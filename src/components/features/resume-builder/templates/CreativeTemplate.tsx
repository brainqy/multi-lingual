
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

const CreativeTemplate = ({ data, onSelectElement, selectedElementId, onDataChange }: TemplateProps) => {
  const { layout, styles, sectionOrder } = data;

  const formatResponsibilities = (text: string) => {
    return text.split('\n').map((line, index) => (
      <li key={index} className="text-sm">{line.startsWith('-') ? line.substring(1).trim() : line.trim()}</li>
    ));
  };
  
  const getSectionClasses = (id: string) => {
    return cn(
        "cursor-pointer p-2 rounded transition-colors duration-200",
        selectedElementId === id ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-primary/5"
    );
  };

  const getFontClass = () => {
    switch (styles?.fontFamily) {
        case 'serif': return 'font-serif';
        case 'mono': return 'font-mono';
        default: return 'font-sans';
    }
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
        case 'header':
            return (
                 <div className={getSectionClasses('header')} onClick={() => onSelectElement('header')}>
                    <h1 
                      className="text-2xl font-bold text-gray-900" 
                      style={{ color: styles?.headerColor, fontSize: styles?.headerFontSize }}
                    >
                      {data.header.fullName}
                    </h1>
                    <p 
                      className="text-md font-medium mb-4" 
                      style={{ color: styles?.headerColor }}
                    >
                      {data.header.jobTitle || 'Aspiring Professional'}
                    </p>
                    
                    <div className="space-y-3 text-xs">
                    {data.header.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3" style={{ color: styles?.headerColor }}/><span>{data.header.email}</span></div>}
                    {data.header.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" style={{ color: styles?.headerColor }}/><span>{data.header.phone}</span></div>}
                    {data.header.address && <div className="flex items-center gap-2"><Home className="h-3 w-3" style={{ color: styles?.headerColor }}/><span>{data.header.address}</span></div>}
                    {data.header.linkedin && <div className="flex items-center gap-2"><Linkedin className="h-3 w-3" style={{ color: styles?.headerColor }}/><a href={`https://${data.header.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></div>}
                    </div>
                </div>
            );
        case 'skills':
            return data.skills && data.skills.length > 0 ? (
                <SortableSection id="skills" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Skills</h2>
                    <div className="flex flex-wrap gap-1">
                        {data.skills.map(skill => <span key={skill} className="bg-primary/20 text-primary-darker text-xs px-2 py-0.5 rounded-full">{skill}</span>)}
                    </div>
                </SortableSection>
            ) : null;
        case 'education':
            return data.education && data.education.length > 0 ? (
                <SortableSection id="education" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Education</h2>
                    {data.education.map((edu, index) => (
                        <div key={edu.id || index} className="mb-2 text-xs">
                            <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                            <p className="text-gray-600">{edu.university}</p>
                            <p className="text-gray-500">{edu.graduationYear}</p>
                        </div>
                    ))}
                </SortableSection>
            ) : null;
        case 'summary':
            return data.summary ? (
                <SortableSection id="summary" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                    <h2 className="text-lg font-bold tracking-wide border-b-2 pb-1 mb-2" style={{ color: styles?.headerColor, borderColor: styles?.headerColor ? `${styles.headerColor}30` : undefined }}>Profile</h2>
                    <p 
                        className="text-sm text-gray-700 whitespace-pre-line"
                    >
                        {data.summary}
                    </p>
                </SortableSection>
            ) : null;
        case 'experience':
            return data.experience && data.experience.length > 0 ? (
                <SortableSection id="experience" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                    <h2 className="text-lg font-bold tracking-wide border-b-2 pb-1 mb-2" style={{ color: styles?.headerColor, borderColor: styles?.headerColor ? `${styles.headerColor}30` : undefined }}>Experience</h2>
                    {data.experience.map((exp, index) => (
                    <div key={exp.id || index} className="mb-3">
                        <h3 className="text-md font-semibold text-gray-800">{exp.jobTitle}</h3>
                        <p className="text-sm font-medium text-gray-600">{exp.company} | {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</p>
                        {exp.responsibilities && <ul className="list-disc list-outside mt-1 ml-4 text-gray-700">{formatResponsibilities(exp.responsibilities)}</ul>}
                    </div>
                    ))}
                </SortableSection>
            ) : null;
        default:
            if (sectionId.startsWith('custom-')) {
                const key = sectionId.replace('custom-', '');
                const isSidebarSection = data.additionalDetails?.sidebar.hasOwnProperty(key);
                const value = isSidebarSection ? data.additionalDetails?.sidebar[key] : data.additionalDetails?.main[key];
                
                if (!value) return null;

                const headingClass = isSidebarSection
                    ? "text-sm font-bold uppercase tracking-wider mb-1"
                    : "text-lg font-bold tracking-wide border-b-2 pb-1 mb-2";
                
                return (
                    <SortableSection id={sectionId} onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                        <h2 className={headingClass} style={{ color: styles?.headerColor, borderColor: !isSidebarSection && styles?.headerColor ? `${styles.headerColor}30` : undefined }}>
                            {key.replace(/_/g, ' ')}
                        </h2>
                        <div 
                            className={isSidebarSection ? "text-xs text-gray-700 whitespace-pre-line" : "text-sm text-gray-700 whitespace-pre-line"}
                        >
                            {value}
                        </div>
                    </SortableSection>
                );
            }
            return null;
    }
  };
  
  const mainSections = sectionOrder.filter(id => {
    if (id.startsWith('custom-')) {
      const key = id.replace('custom-', '');
      return data.additionalDetails?.main.hasOwnProperty(key);
    }
    // Standard sections for main column
    return ['summary', 'experience'].includes(id);
  });
  
  const sidebarSections = sectionOrder.filter(id => {
     if (id.startsWith('custom-')) {
      const key = id.replace('custom-', '');
      return data.additionalDetails?.sidebar.hasOwnProperty(key);
    }
    // Standard sections for sidebar
    return ['skills', 'education'].includes(id);
  });
  
  const SidebarContent = () => (
     <div className="space-y-4">
        {renderSection('header')}
        {sidebarSections.map(id => renderSection(id))}
     </div>
  );

  const MainContent = () => (
     <div className="space-y-4">
        {mainSections.map(id => renderSection(id))}
     </div>
  );

  return (
    <div 
        className={cn("p-4 text-gray-800 bg-white shadow-lg w-[210mm] min-h-[297mm] aspect-[210/297]", getFontClass())}
        style={{ color: styles?.bodyColor }}
    >
        {layout && layout.startsWith('two-column') ? (
            <div className={cn(
              "flex gap-4 h-full",
              layout === 'two-column-right' ? 'flex-row-reverse' : 'flex-row'
            )}>
                <aside className="w-1/3 bg-gray-100 p-4 rounded-lg">
                    <SidebarContent/>
                </aside>
                 <div className="w-px bg-gray-200"></div>
                <main className="w-2/3 p-4" style={{ textAlign: styles?.textAlign }}>
                    <MainContent/>
                </main>
            </div>
        ) : (
             <div className="space-y-4">
                {renderSection('header')}
                {sectionOrder.filter(id => id !== 'header').map(id => renderSection(id))}
             </div>
        )}
    </div>
  );
};

export default CreativeTemplate;
