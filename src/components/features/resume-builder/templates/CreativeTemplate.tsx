
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

  const renderSection = (sectionId: string, location: 'main' | 'sidebar' | 'header') => {
    switch (sectionId) {
        case 'header':
            return (
                 <div className={getSectionClasses('header')} onClick={() => onSelectElement('header')}>
                    <h1 
                      className="text-2xl font-bold text-gray-900" 
                      style={{ color: styles?.headerColor, fontSize: styles?.headerFontSize }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => onDataChange('header.fullName', e.currentTarget.textContent || '')}
                    >
                      {data.header.fullName}
                    </h1>
                    <p 
                      className="text-md font-medium mb-4" 
                      style={{ color: styles?.headerColor }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => onDataChange('header.jobTitle', e.currentTarget.textContent || '')}
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
            return data.skills.length > 0 ? (
                <SortableSection id="skills" onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: styles?.headerColor }}>Skills</h2>
                    <div className="flex flex-wrap gap-1">
                        {data.skills.map(skill => <span key={skill} className="bg-primary/20 text-primary-darker text-xs px-2 py-0.5 rounded-full">{skill}</span>)}
                    </div>
                </SortableSection>
            ) : null;
        case 'education':
            return data.education.length > 0 ? (
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
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => onDataChange('summary', e.currentTarget.textContent || '')}
                    >
                        {data.summary}
                    </p>
                </SortableSection>
            ) : null;
        case 'experience':
            return data.experience.length > 0 ? (
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
                const isMainSection = data.additionalDetails?.main.hasOwnProperty(key);
                const value = isSidebarSection ? data.additionalDetails?.sidebar[key] : data.additionalDetails?.main[key];
                
                if (!value || (location === 'main' && !isMainSection) || (location === 'sidebar' && !isSidebarSection)) return null;

                const headingClass = location === 'main' 
                    ? "text-lg font-bold tracking-wide border-b-2 pb-1 mb-2"
                    : "text-sm font-bold uppercase tracking-wider mb-1";
                
                return (
                    <SortableSection id={sectionId} onSelectElement={onSelectElement} selectedElementId={selectedElementId}>
                        <h2 className={headingClass} style={{ color: styles?.headerColor, borderColor: location === 'main' && styles?.headerColor ? `${styles.headerColor}30` : undefined }}>
                            {key.replace(/_/g, ' ')}
                        </h2>
                        <p 
                            className="text-xs text-gray-700 whitespace-pre-line"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => onDataChange(`custom-${key}`, e.currentTarget.textContent || '')}
                        >
                            {value}
                        </p>
                    </SortableSection>
                );
            }
            return null;
    }
  };
  
  const SidebarContent = () => (
     <div className="space-y-4">
        {renderSection('header', 'header')}
        {sectionOrder.map(id => renderSection(id, 'sidebar'))}
     </div>
  );

  const MainContent = () => (
     <div className="space-y-4">
        {sectionOrder.map(id => renderSection(id, 'main'))}
     </div>
  );

  return (
    <div className="p-6 font-sans text-gray-800 bg-white" style={{ color: styles?.bodyColor }}>
        {layout.startsWith('two-column') ? (
            <div className={cn(
              "flex",
              layout === 'two-column-right' ? 'flex-row-reverse' : 'flex-row'
            )}>
                <aside className="w-1/3 bg-gray-100 p-4 rounded-lg">
                    <SidebarContent/>
                </aside>
                <main className="w-2/3 p-6" style={{ textAlign: styles?.textAlign }}>
                    <MainContent/>
                </main>
            </div>
        ) : (
            <div>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                   <SidebarContent/>
                </div>
                <main className="p-6" style={{ textAlign: styles?.textAlign }}>
                   <MainContent/>
                </main>
            </div>
        )}
    </div>
  );
};

export default CreativeTemplate;
