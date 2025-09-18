import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ResumeBuilderData } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const graduationYears = Array.from({ length: new Date().getFullYear() - 1959 }, (_, i) => String(new Date().getFullYear() - i));

/**
 * Converts structured resume data from the builder into a plain text string.
 * @param data The ResumeBuilderData object.
 * @returns A formatted, plain text string representing the resume.
 */
export function convertResumeDataToText(data: ResumeBuilderData): string {
  let text = '';

  // Header
  text += `${data.header.fullName}\n`;
  const contactInfo = [
    data.header.phone,
    data.header.email,
    data.header.address,
    data.header.linkedin,
    data.header.portfolio
  ].filter(Boolean).join(' | ');
  if (contactInfo) {
    text += `${contactInfo}\n\n`;
  }

  // Summary
  if (data.summary) {
    text += `SUMMARY\n${data.summary}\n\n`;
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    text += `SKILLS\n${data.skills.join(', ')}\n\n`;
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    text += `EXPERIENCE\n`;
    data.experience.forEach(exp => {
      text += `${exp.jobTitle}, ${exp.company}, ${exp.location}\n`;
      text += `${exp.startDate} - ${exp.endDate || 'Present'}\n`;
      if (exp.responsibilities) {
        exp.responsibilities.split('\n').forEach(line => {
          text += `  - ${line.replace(/^-/, '').trim()}\n`;
        });
      }
      text += '\n';
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    text += `EDUCATION\n`;
    data.education.forEach(edu => {
      text += `${edu.degree} - ${edu.university}, ${edu.location}\n`;
      text += `Graduation: ${edu.graduationYear}\n`;
      if (edu.details) {
        text += `${edu.details}\n`;
      }
      text += '\n';
    });
  }

  // Additional Details
  if (data.additionalDetails) {
    const { awards, certifications, languages, interests } = data.additionalDetails;
    if (awards || certifications || languages || interests) {
      text += `ADDITIONAL INFORMATION\n`;
      if (awards) text += `Awards: ${awards}\n`;
      if (certifications) text += `Certifications: ${certifications}\n`;
      if (languages) text += `Languages: ${languages}\n`;
      if (interests) text += `Interests: ${interests}\n`;
    }
  }

  return text.trim();
}
