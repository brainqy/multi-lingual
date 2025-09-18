
"use client";

import type { UserProfile, ResumeBuilderData } from "@/types";

export const getInitialResumeData = (user: UserProfile | null): ResumeBuilderData => {
  // Now returns a pre-filled structure with example data.
  const defaultSectionOrder = ['summary', 'experience', 'education', 'skills'];
  
  return {
    header: {
      fullName: user?.name || "Alex Doe",
      phone: user?.mobileNumber || "555-123-4567",
      email: user?.email || "alex.doe@email.com",
      linkedin: user?.linkedInProfile || "linkedin.com/in/alexdoe",
      portfolio: "github.com/alexdoe",
      address: user?.currentAddress || "San Francisco, CA",
      jobTitle: user?.currentJobTitle || "Software Engineer",
    },
    summary: "Innovative Software Engineer with 5+ years of experience in developing, testing, and maintaining scalable web applications. Proficient in JavaScript, React, and Node.js with a proven ability to deliver high-quality code and collaborate effectively in agile environments. Seeking to leverage strong problem-solving skills to build impactful solutions.",
    experience: [
      {
        id: 'exp1',
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Solutions Inc.',
        location: 'San Francisco, CA',
        startDate: '2021-08',
        endDate: 'Present',
        isCurrent: true,
        responsibilities: '- Led the development of a new customer-facing analytics dashboard using React and D3.js, resulting in a 20% increase in user engagement.\n- Mentored junior engineers, providing code reviews and guidance on best practices.\n- Optimized application performance, reducing page load times by 30%.'
      },
      {
        id: 'exp2',
        jobTitle: 'Software Engineer',
        company: 'Innovate Corp.',
        location: 'Palo Alto, CA',
        startDate: '2019-06',
        endDate: '2021-07',
        isCurrent: false,
        responsibilities: '- Contributed to a large-scale migration from a monolithic architecture to microservices.\n- Developed and maintained RESTful APIs using Node.js and Express.\n- Wrote unit and integration tests, improving code coverage by 15%.'
      }
    ],
    education: [
      {
        id: 'edu1',
        degree: 'B.Sc',
        major: 'Computer Science',
        university: 'State University',
        location: 'San Jose, CA',
        graduationYear: '2019',
        details: '- Graduated Magna Cum Laude\n- President of the Coding Club'
      }
    ],
    skills: [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'SQL', 'MongoDB', 'Docker', 'AWS', 'Agile Methodologies', 'CI/CD'
    ],
    additionalDetails: { main: {}, sidebar: {} },
    templateId: 'template1', // Fallback templateId
    layout: 'single-column',
    sectionOrder: defaultSectionOrder,
    styles: {
      textAlign: 'left',
      headerFontSize: '24px',
      fontFamily: 'sans',
    },
  };
};
