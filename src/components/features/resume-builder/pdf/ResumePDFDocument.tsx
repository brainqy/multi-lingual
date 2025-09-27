
"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Font } from '@react--pdf/renderer';
import type { ResumeBuilderData, ResumeExperienceEntry, ResumeEducationEntry } from '@/types';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Times-Roman',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Open_Sans/OpenSans-Regular-webfont.ttf', // Fallback
});
Font.register({
  family: 'Courier',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Droid_Sans_Mono/DroidSansMono-webfont.ttf', // Fallback
});


interface ResumePDFDocumentProps {
    data: ResumeBuilderData | null;
}

// This function ensures every required property has a safe default value.
const sanitizeData = (d: ResumeBuilderData | null): ResumeBuilderData => {
  const defaultHeader = { fullName: 'Your Name', phone: '', email: '', linkedin: '', portfolio: '', address: '', jobTitle: '' };
  const defaultAdditionalDetails = { awards: '', certifications: '', languages: '', interests: '', main: {}, sidebar: {} };
  
  return {
    header: d?.header || defaultHeader,
    summary: d?.summary || '',
    experience: d?.experience || [],
    education: d?.education || [],
    skills: d?.skills || [],
    additionalDetails: {
      ...defaultAdditionalDetails,
      ...(d?.additionalDetails || {}),
      main: d?.additionalDetails?.main || {},
      sidebar: d?.additionalDetails?.sidebar || {},
    },
    templateId: d?.templateId || 'template1',
    layout: d?.layout || 'single-column',
    sectionOrder: d?.sectionOrder || ['summary', 'experience', 'education', 'skills'],
    styles: d?.styles || {},
  };
};


const ResumePDFDocument: React.FC<ResumePDFDocumentProps> = ({ data: unsafeData }) => {
  const data = sanitizeData(unsafeData);

  const getFontFamily = () => {
    switch (data.styles?.fontFamily) {
        case 'serif': return 'Times-Roman';
        case 'mono': return 'Courier';
        default: return 'Helvetica';
    }
  };

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 30,
      fontFamily: getFontFamily(),
      fontSize: 10,
      lineHeight: 1.4,
      color: data.styles?.bodyColor || '#333333',
    },
    twoColumnContainer: {
        flexDirection: 'row',
        flexGrow: 1,
    },
    mainColumn: {
        width: '65%',
        paddingRight: 15,
    },
    sidebarColumn: {
        width: '35%',
        paddingLeft: 15,
        borderLeftWidth: 1,
        borderLeftColor: '#f0f0f0',
    },
    header: {
      textAlign: data.styles?.textAlign === 'center' ? 'center' : data.styles?.textAlign === 'right' ? 'right' : 'left',
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eeeeee',
      paddingBottom: 10,
    },
    fullName: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 2,
      color: data.styles?.headerColor || '#111111',
    },
    jobTitleHeader: {
      fontSize: 12,
      fontWeight: 'normal',
      color: '#555555',
    },
    contactInfo: {
      fontSize: 9,
      color: '#444444',
      marginTop: 5,
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: data.styles?.headerColor || '#008080',
      borderBottomWidth: 1,
      borderBottomColor: '#cccccc',
      paddingBottom: 2,
      marginBottom: 6,
    },
    content: {
      fontSize: 10,
      whiteSpace: 'pre-wrap',
    },
    experienceEntry: {
      marginBottom: 8,
    },
    jobTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#111111',
    },
    companyInfo: {
      fontSize: 10,
      fontStyle: 'italic',
      color: '#555555',
      marginBottom: 2,
    },
    responsibilities: {
      paddingLeft: 10,
    },
    responsibilityItem: {
      marginBottom: 2,
    },
    educationEntry: {
        marginBottom: 6,
    },
    degree: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    university: {
        fontSize: 10,
    },
    skills: {
        fontSize: 10,
    },
    link: {
        color: '#008080',
        textDecoration: 'none',
    }
  });

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'summary':
        return data.summary ? (
          <View key="summary" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.content}>{data.summary}</Text>
          </View>
        ) : null;
      case 'skills':
        return data.skills && data.skills.length > 0 ? (
          <View key="skills" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skills}>{data.skills.join(' • ')}</Text>
          </View>
        ) : null;
      case 'experience':
        return data.experience && data.experience.length > 0 ? (
          <View key="experience" style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {data.experience.map((exp: ResumeExperienceEntry, index: number) => (
              <View key={exp.id || index} style={styles.experienceEntry} wrap={false}>
                <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                <Text style={styles.companyInfo}>{exp.company} | {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</Text>
                {exp.responsibilities && (
                  <View style={styles.responsibilities}>
                    {exp.responsibilities.split('\n').map((line, i) => (
                      <Text key={i} style={styles.responsibilityItem}>• {line.replace(/^-/, '').trim()}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : null;
      case 'education':
        return data.education && data.education.length > 0 ? (
          <View key="education" style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu: ResumeEducationEntry, index: number) => (
              <View key={edu.id || index} style={styles.educationEntry} wrap={false}>
                <Text style={styles.degree}>{edu.degree} {edu.major && `- ${edu.major}`}</Text>
                <Text style={styles.university}>{edu.university}, {edu.graduationYear}</Text>
              </View>
            ))}
          </View>
        ) : null;
      default:
        if (sectionId.startsWith('custom-')) {
          const key = sectionId.replace('custom-', '');
          const value = data.additionalDetails?.main?.[key] || data.additionalDetails?.sidebar?.[key];
          if (!value) return null;
          return (
            <View key={sectionId} style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>{key.replace(/_/g, ' ')}</Text>
              <Text style={styles.content}>{value}</Text>
            </View>
          );
        }
        return null;
    }
  };

  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.fullName}>{data.header.fullName}</Text>
      {data.header.jobTitle && <Text style={styles.jobTitleHeader}>{data.header.jobTitle}</Text>}
      <Text style={styles.contactInfo}>
        {data.header.phone || ''}
        {data.header.email ? ` | ${data.header.email}` : ''}
        {data.header.linkedin && ` | `}
        {data.header.linkedin && <Link src={`https://${data.header.linkedin.replace(/^https?:\/\//, '')}`} style={styles.link}>LinkedIn</Link>}
        {data.header.address && ` | ${data.header.address}`}
      </Text>
    </View>
  );

  const mainSections = data.layout?.startsWith('two-column') 
    ? data.sectionOrder.filter(id => !['summary', 'skills', 'education'].some(sidebarId => id.includes(sidebarId))) 
    : data.sectionOrder;
  const sidebarSections = data.layout?.startsWith('two-column') 
    ? data.sectionOrder.filter(id => ['summary', 'skills', 'education'].some(sidebarId => id.includes(sidebarId)))
    : [];

  return (
    <Document author={data.header.fullName} title={`${data.header.fullName} - Resume`}>
      <Page size="A4" style={styles.page}>
        <Header />
        {data.layout?.startsWith('two-column') ? (
            <View style={styles.twoColumnContainer}>
                <View style={styles.mainColumn}>
                    {mainSections.map(sectionId => renderSectionContent(sectionId))}
                </View>
                <View style={styles.sidebarColumn}>
                    {sidebarSections.map(sectionId => renderSectionContent(sectionId))}
                </View>
            </View>
        ) : (
            <>
              {data.sectionOrder.map(sectionId => renderSectionContent(sectionId))}
            </>
        )}
      </Page>
    </Document>
  );
};

export default ResumePDFDocument;
