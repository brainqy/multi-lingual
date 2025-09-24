
"use client";

import type { UserProfile, ResumeBuilderData } from "@/types";

export const getInitialResumeData = (user: UserProfile | null): ResumeBuilderData => {
  // This now returns a pre-filled structure matching the "Research Analyst" example
  const defaultSectionOrder = ['summary', 'experience', 'education', 'skills'];
  
  return {
    header: {
      fullName: user?.name || "Robert Wilmington",
      phone: user?.mobileNumber || "555-555-5555",
      email: user?.email || "example@example.com",
      linkedin: "linkedin.com/in/robertwilmington",
      portfolio: "",
      address: "Mississauga, ON",
      jobTitle: "Research Analyst",
    },
    summary: "An experienced and self-driven professional with an analytical mind, excellent oral & written communication and data interpretation skills, and a proven track record in market research, project management, and direct client engagement. Possessing all the leadership qualities required to manage a team. Having critical reasoning skills and the ability to \"think outside the box\" as well as proficient in statistical analysis.",
    experience: [
      {
        id: 'exp1',
        jobTitle: 'Senior Research Analyst',
        company: 'Invenio Marketing Solutions, Inc.',
        location: '',
        startDate: '2017-07',
        endDate: 'Current',
        isCurrent: true,
        responsibilities: "- Managing a team of 2-3 research analysts across industry verticals, with focus area as Chemicals & Materials and Food & Beverages and mentoring 4-5 junior analysts.\\n- Conducting extensive primary and secondary research for delivering research projects involving competitor analysis & benchmarking, company profiling, go-to-market strategy, market assessment & sizing, and industry/sector analysis.\\n- Responsible for enhancing the quality of research reports & handling client queries."
      },
      {
        id: 'exp2',
        jobTitle: 'Research Analyst',
        company: 'Infiniti Research Marketing Solutions',
        location: '',
        startDate: '2013-05',
        endDate: '2017-06',
        isCurrent: false,
        responsibilities: "- Report Creation: Assisted in the creation, data population, visual formatting, data verification, and writing of over 500 client reports.\\n- Project Sustentation: Continually completed multiple ongoing processes related to operations.\\n- Data Verification: Responsible for checking data for both internal data files and client deliverables to ensure the accuracy of the presented results."
      }
    ],
    education: [
      {
        id: 'edu1',
        degree: 'Master of Science',
        major: 'Marketing Research',
        university: 'University of Texas',
        location: '',
        graduationYear: '2007',
        details: ''
      },
       {
        id: 'edu2',
        degree: 'Bachelor of Arts',
        major: 'International Affairs',
        university: 'School of Diplomacy and International Relations',
        location: '',
        graduationYear: '2005',
        details: ''
      }
    ],
    skills: [
      'Exceptional and improvisational problem-solving skills.',
      'Thorough, accountable, clear, and timely written research and reports.',
      'Highly efficient and organized at handling multiple complex tasks simultaneously.',
      'Excellent written and verbal communication skills in English.',
      'Ability to communicate and interact with senior business executives.'
    ],
    additionalDetails: { main: {}, sidebar: {} }, // Ensure this is always initialized
    templateId: 'template2', // Default to Creative for two-column
    layout: 'two-column-left',
    sectionOrder: defaultSectionOrder,
    styles: {
      textAlign: 'left',
      headerFontSize: '24px',
      fontFamily: 'sans',
    },
  };
};

    
