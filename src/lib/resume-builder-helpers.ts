
"use client";

import type { UserProfile, ResumeBuilderData } from "@/types";

export const getInitialResumeData = (user: UserProfile | null): ResumeBuilderData => {
  // Now returns a blank structure with common sections pre-ordered but empty.
  const defaultSectionOrder = ['summary', 'experience', 'education', 'skills'];
  
  return {
    header: {
      fullName: user?.name || "Your Name",
      phone: user?.mobileNumber || "",
      email: user?.email || "",
      linkedin: user?.linkedInProfile || "",
      portfolio: "",
      address: user?.currentAddress || "",
      jobTitle: user?.currentJobTitle || "Your Job Title",
    },
    summary: "", // Start with an empty summary
    experience: [], // Start with no experience entries
    education: [], // Start with no education entries
    skills: [], // Start with no skills
    additionalDetails: { main: {}, sidebar: {} },
    templateId: 'template1', // Fallback templateId
    layout: 'single-column',
    sectionOrder: defaultSectionOrder,
    styles: {
      textAlign: 'left',
      headerFontSize: '24px',
    },
  };
};
