
"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import type { ResumeBuilderData } from '@/types';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#333333',
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
    borderBottom: '1px solid #eeeeee',
    paddingBottom: 10,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#111111',
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
    color: '#008080',
    borderBottom: '1px solid #cccccc',
    paddingBottom: 2,
    marginBottom: 6,
  },
  content: {
    fontSize: 10,
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

interface ResumePDFDocumentProps {
    data: ResumeBuilderData | null;
}

const ResumePDFDocument: React.FC<ResumePDFDocumentProps> = ({ data: unsafeData }) => {
  // Robustly sanitize the data to prevent any crashes from undefined properties.
  // This is the definitive fix for the 'hasOwnProperty' error.
  const sanitizeData = (d: ResumeBuilderData | null): ResumeBuilderData => {
    if (!d) {
      return {
        header: { fullName: 'Error', phone: '', email: 'No data', linkedin: '', portfolio: '', address: '', jobTitle: '' },
        summary: 'Could not load resume data.',
        experience: [],
        education: [],
        skills: [],
        templateId: 'template1',
        layout: 'single-column',
        sectionOrder: [],
        styles: {},
      };
    }
    return {
      header: d.header || { fullName: '', phone: '', email: '', linkedin: '', portfolio: '', address: '', jobTitle: '' },
      summary: d.summary || '',
      experience: d.experience || [],
      education: d.education || [],
      skills: d.skills || [],
      templateId: d.templateId || 'template1',
      layout: d.layout || 'single-column',
      sectionOrder: d.sectionOrder || [],
      styles: d.styles || {},
    };
  };

  const data = sanitizeData(unsafeData);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
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

        {/* Summary Section */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.content}>{data.summary}</Text>
          </View>
        )}

        {/* Skills Section */}
        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skills}>{data.skills.join(' • ')}</Text>
          </View>
        )}

        {/* Experience Section */}
        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={exp.id || index} style={styles.experienceEntry}>
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
        )}

        {/* Education Section */}
        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={edu.id || index} style={styles.educationEntry}>
                <Text style={styles.degree}>{edu.degree} {edu.major && `- ${edu.major}`}</Text>
                <Text style={styles.university}>{edu.university}, {edu.graduationYear}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ResumePDFDocument;
