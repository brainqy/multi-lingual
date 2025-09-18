
"use client";

import type { UserProfile, ResumeBuilderData } from "@/types";

export const getInitialResumeData = (user: UserProfile | null): ResumeBuilderData => {
  if (!user) {
    return {
      header: { fullName: "", phone: "", email: "", linkedin: "", portfolio: "", address: "" },
      experience: [],
      education: [],
      skills: [],
      summary: "",
      additionalDetails: { awards: "", certifications: "", languages: "", interests: "" },
      templateId: 'template1', // Fallback templateId
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
      awards: "",
      certifications: "",
      languages: "",
      interests: (user.interests || []).join(", "),
    },
    templateId: 'template1', // Default templateId
  };
};
