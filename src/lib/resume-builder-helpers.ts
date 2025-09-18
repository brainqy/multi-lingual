
"use client";

import type { UserProfile, ResumeBuilderData } from "@/types";

export const getInitialResumeData = (user: UserProfile | null): ResumeBuilderData => {
  const defaultSectionOrder = ['summary', 'experience', 'education', 'skills'];
  
  if (!user) {
    return {
      header: { fullName: "", phone: "", email: "", linkedin: "", portfolio: "", address: "" },
      experience: [],
      education: [],
      skills: [],
      summary: "",
      additionalDetails: { main: {}, sidebar: {} },
      templateId: 'template1', // Fallback templateId
      layout: 'single-column',
      sectionOrder: defaultSectionOrder,
      styles: {
        textAlign: 'left',
      },
    };
  }
  return {
    header: {
      fullName: user.name || "",
      phone: user.mobileNumber || "",
      email: user.email || "",
      linkedin: user.linkedInProfile || "",
      portfolio: "",
      address: user.currentAddress || "",
    },
    experience: [],
    education: [],
    skills: user.skills || [],
    summary: user.bio || "",
    additionalDetails: {
      main: {
        interests: (user.interests || []).join(", "),
      },
      sidebar: {}
    },
    templateId: 'template1', // Default templateId
    layout: 'single-column',
    sectionOrder: defaultSectionOrder,
    styles: {
      textAlign: 'left',
    },
  };
};
