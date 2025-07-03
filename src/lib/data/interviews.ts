
import type { MockInterviewSession, PracticeSession, LiveInterviewSession, InterviewQuestionCategory, InterviewQuestionDifficulty, SurveyStep } from '@/types';
import { sampleUserProfile } from './users';
import { SAMPLE_DATA_BASE_DATE } from './platform';
import { Genders, DegreePrograms, Industries, AreasOfSupport, TimeCommitments, EngagementModes, SupportTypesSought, LiveInterviewSessionStatuses } from '@/types';
import { graduationYears } from './platform';
import { sampleInterviewQuestions } from './questions';

export const sampleMockInterviewSessions: MockInterviewSession[] = [
  {
    id: 'session-hist-1',
    userId: sampleUserProfile.id,
    topic: 'Frontend Developer Interview',
    jobDescription: 'Looking for a skilled frontend dev for a challenging role requiring React, TypeScript, and state management expertise.',
    questions: sampleInterviewQuestions.slice(0, 2).map(q => ({ id: q.id, questionText: q.questionText, category: q.category, difficulty: q.difficulty, baseScore: q.baseScore || 10 })),
    answers: [
      { questionId: 'iq1', questionText: sampleInterviewQuestions[0].questionText, userAnswer: "I once tried to implement a feature too quickly without fully understanding the requirements, which led to significant rework. I learned the importance of thorough planning and asking clarifying questions upfront. Since then, I always create a detailed plan and confirm requirements before starting development, which has greatly reduced errors and delays.", aiFeedback: "Good attempt at STAR, but be more specific about the situation and the exact results of your corrective actions. Quantify if possible.", aiScore: 70, strengths: ["Honesty", "Acknowledged learning"], areasForImprovement: ["Specificity (STAR)", "Quantifiable results"] },
      { questionId: 'iq2', questionText: sampleInterviewQuestions[1].questionText, userAnswer: "In a previous project, a senior team member was consistently dismissive of junior developers' ideas. I scheduled a one-on-one with them, explained how their approach was impacting team morale and innovation, and suggested they actively solicit input during design reviews. They were receptive, and the team dynamic improved.", aiFeedback: "Excellent use of the STAR method. Clear actions and positive outcome. Well done.", aiScore: 90, strengths: ["Proactive communication", "Problem-solving", "Empathy"], areasForImprovement: ["Could mention the specific positive impact on a project metric if applicable."] },
    ],
    overallFeedback: {
      overallSummary: 'The user demonstrated good problem-solving approaches and an ability to learn from past experiences. Answers could be more consistently structured using the STAR method for maximum impact.',
      keyStrengths: ['Self-awareness', 'Proactive communication', 'Willingness to learn'],
      keyAreasForImprovement: ['Consistent STAR method application', 'Quantifying impact of actions'],
      finalTips: ['Practice framing all behavioral answers using the STAR method.', 'Prepare specific examples with measurable results for common interview questions.'],
      overallScore: 80,
    },
    overallScore: 80,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    timerPerQuestion: 120,
    questionCategories: ['Behavioral'],
    difficulty: 'Medium'
  },
  {
    id: 'session-hist-2',
    userId: sampleUserProfile.id,
    topic: 'Data Analyst Role',
    questions: sampleInterviewQuestions.slice(2, 3).map(q => ({ id: q.id, questionText: q.questionText, category: q.category, difficulty: q.difficulty, baseScore: q.baseScore || 10 })),
    answers: [
      { questionId: 'iq3', questionText: sampleInterviewQuestions[2].questionText, userAnswer: 'An abstract class can have constructors and implemented methods, while an interface traditionally only defines a contract with method signatures and constants. A class can inherit from only one abstract class but implement multiple interfaces.', aiFeedback: 'Correct and comprehensive explanation of the key differences.', aiScore: 95, strengths: ["Technical accuracy", "Clarity"], areasForImprovement: ["None for this answer"] },
    ],
    overallFeedback: {
      overallSummary: 'Strong technical knowledge demonstrated regarding OOP principles.',
      keyStrengths: ['Precise technical definitions', 'Clear communication of complex concepts'],
      keyAreasForImprovement: ['N/A for this short session'],
      finalTips: ['Continue to provide such clear and accurate technical explanations.'],
      overallScore: 95,
    },
    overallScore: 95,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    timerPerQuestion: 0,
    questionCategories: ['Technical'],
    difficulty: 'Medium'
  },
];

export let sampleCreatedQuizzes: MockInterviewSession[] = [
  {
    id: 'quiz-java-basics',
    userId: 'system',
    topic: 'Java Basics Quiz',
    description: "Test your fundamental knowledge of Java programming concepts. Covers data types, OOP, and common library functions.",
    questions: sampleInterviewQuestions.filter(q => q.tags?.includes('java') && q.isMCQ).slice(0, 5).map(q => ({ id: q.id, questionText: q.questionText, category: q.category, difficulty: q.difficulty, baseScore: q.baseScore || 10 })),
    answers: [],
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    questionCategories: ['Technical', 'Coding'],
    difficulty: 'Easy',
  },
  {
    id: 'quiz-behavioral-common',
    userId: 'system',
    topic: 'Common Behavioral Questions',
    description: "Practice how you'd respond to frequently asked behavioral interview questions. Focus on structuring your answers using STAR.",
    questions: sampleInterviewQuestions.filter(q => q.category === 'Behavioral' && q.isMCQ).slice(0, 7).map(q => ({ id: q.id, questionText: q.questionText, category: q.category, difficulty: q.difficulty, baseScore: q.baseScore || 10 })),
    answers: [],
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    questionCategories: ['Behavioral', 'Common'],
    difficulty: 'Medium',
  },
  {
    id: 'quiz-pm-roleplay',
    userId: 'managerUser1',
    topic: 'Product Manager Role Scenarios',
    description: "A challenging quiz with scenario-based questions for aspiring Product Managers. Tests decision-making and prioritization skills.",
    questions: sampleInterviewQuestions.filter(q => q.category === 'Role-Specific' && q.tags?.includes('product management') && q.isMCQ).slice(0, 3).map(q => ({ id: q.id, questionText: q.questionText, category: q.category, difficulty: q.difficulty, baseScore: q.baseScore || 10 })),
    answers: [],
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    questionCategories: ['Role-Specific', 'Analytical'],
    difficulty: 'Hard',
  },
];

export let samplePracticeSessions: PracticeSession[] = [
  {
    id: "ps1",
    userId: 'managerUser1',
    date: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 86400000 * 3).toISOString(),
    category: "Practice with Experts",
    type: "Angular Frontend",
    language: "English",
    status: "SCHEDULED",
    notes: "Focus on advanced component architecture and state management for the candidate.",
  },
   {
    id: "ps2",
    userId: 'alumni1',
    date: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 86400000 * 5).toISOString(),
    category: "Practice with Experts",
    type: "System Design Interview",
    language: "English",
    status: "SCHEDULED",
    notes: "Candidate wants to practice system design for a large-scale e-commerce platform.",
  },
];

export let sampleLiveInterviewSessions: LiveInterviewSession[] = [
  {
    id: 'ps1',
    tenantId: 'tenant-2',
    title: 'Angular Frontend Practice (Expert Mock for Mike)',
    participants: [
      { userId: 'managerUser1', name: 'Manager Mike', role: 'interviewer', profilePictureUrl: sampleUserProfile.profilePictureUrl },
      { userId: 'expert-angular-candidate', name: 'Expert Angular Interviewer', role: 'candidate', profilePictureUrl: 'https://avatar.vercel.sh/expert-angular.png' }
    ],
    scheduledTime: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 86400000 * 3).toISOString(),
    status: LiveInterviewSessionStatuses[0], // 'Scheduled'
    meetingLink: 'https://meet.example.com/angular-live-ps1',
    interviewTopics: ['Angular Core Concepts', 'TypeScript', 'RxJS Problem Solving'],
    preSelectedQuestions: [
      sampleInterviewQuestions.find(q => q.id === 'iq1'), // Will get default baseScore of 10
      sampleInterviewQuestions.find(q => q.id === 'iq3'), // Has baseScore: 10
      sampleInterviewQuestions.find(q => q.id === 'coding1'), // Has baseScore: 5
      sampleInterviewQuestions.find(q => q.questionText && typeof q.questionText === 'string' && q.questionText.toLowerCase().includes("angular")) || {id: 'angular-generic-1', questionText: "Describe the role of NgModules in Angular.", category: "Technical" as InterviewQuestionCategory, difficulty: "Medium" as InterviewQuestionDifficulty, baseScore: 15},
    ].filter(Boolean).map(q => ({
        id: q!.id,
        questionText: q!.questionText,
        category: q!.category,
        difficulty: q!.difficulty,
        baseScore: q!.baseScore || 10
    })),
    recordingReferences: [],
    interviewerScores: [],
    finalScore: undefined,
  },
  {
    id: 'ps2',
    tenantId: 'Brainqy',
    title: 'System Design Practice (for Alice)',
    participants: [
      { userId: 'system-expert-sd', name: 'System Design Expert', role: 'interviewer', profilePictureUrl: 'https://avatar.vercel.sh/system-expert.png' },
      { userId: 'alumni1', name: 'Alice Wonderland', role: 'candidate', profilePictureUrl: sampleUserProfile.profilePictureUrl }
    ],
    scheduledTime: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 86400000 * 5).toISOString(),
    status: LiveInterviewSessionStatuses[0], // 'Scheduled'
    meetingLink: 'https://meet.example.com/system-design-ps2',
    interviewTopics: ['System Design', 'Scalability', 'Databases'],
    preSelectedQuestions: [
      sampleInterviewQuestions.find(q=>q.id === 'iq7'), // RESTful API
      sampleInterviewQuestions.find(q=>q.id === 'coding2'), // Big O
      {id: 'sd-generic-1', questionText: "How would you design a URL shortening service like TinyURL?", category: "System Design" as InterviewQuestionCategory, difficulty: "Hard" as InterviewQuestionDifficulty, baseScore: 20},
    ].filter(Boolean).map(q => ({id: q!.id, questionText: q!.questionText, category: q!.category, difficulty: q!.difficulty, baseScore: q!.baseScore || 10})),
    recordingReferences: [],
    interviewerScores: [],
    finalScore: undefined,
  },
  {
    id: 'live-session-1',
    tenantId: 'Brainqy',
    title: 'Frontend Developer Screening (Live)',
    participants: [
      { userId: 'alumni1', name: 'Alice Wonderland', role: 'interviewer', profilePictureUrl: sampleUserProfile.profilePictureUrl },
      { userId: 'alumni2', name: 'Bob The Builder', role: 'candidate', profilePictureUrl: sampleUserProfile.profilePictureUrl }
    ],
    scheduledTime: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: LiveInterviewSessionStatuses[0], // 'Scheduled'
    meetingLink: 'https://meet.example.com/live123',
    interviewTopics: ['React', 'JavaScript', 'CSS', 'Behavioral'],
    preSelectedQuestions: [
      sampleInterviewQuestions.find(q=>q.id === 'iq1'),
      sampleInterviewQuestions.find(q=>q.id === 'iq5'),
      sampleInterviewQuestions.find(q=>q.id === 'mcq1'),
    ].filter(Boolean).map(q => ({id: q!.id, questionText: q!.questionText, category: q!.category, difficulty: q!.difficulty, baseScore: q!.baseScore || 10})),
    recordingReferences: [],
    interviewerScores: [],
    finalScore: undefined,
  },
  {
    id: 'live-session-3',
    tenantId: 'tenant-2',
    title: 'Data Structures Practice with Mike',
    participants: [
      { userId: 'managerUser1', name: 'Manager Mike', role: 'interviewer', profilePictureUrl: sampleUserProfile.profilePictureUrl },
      { userId: 'alumni3', name: 'Charlie Brown', role: 'candidate', profilePictureUrl: sampleUserProfile.profilePictureUrl }
    ],
    scheduledTime: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 86400000 * 4).toISOString(),
    status: LiveInterviewSessionStatuses[0], // 'Scheduled'
    meetingLink: 'https://meet.example.com/ds-mike-charlie',
    interviewTopics: ['Data Structures', 'Algorithms', 'Problem Solving'],
    preSelectedQuestions: [
      sampleInterviewQuestions.find(q => q.id === 'coding2'),
      sampleInterviewQuestions.find(q => q.id === 'iq8'),
    ].filter(Boolean).map(q => ({id: q!.id, questionText: q!.questionText, category: q!.category, difficulty: q!.difficulty, baseScore: q!.baseScore || 15})),
    recordingReferences: [],
    interviewerScores: [],
    finalScore: undefined,
  },
];

export const profileCompletionSurveyDefinition: SurveyStep[] = [
  { id: 'pc_intro', type: 'botMessage', text: "Let's complete your profile! This will help us personalize your experience and connect you with better opportunities.", nextStepId: 'pc_s1_start' },
  { id: 'pc_s1_start', type: 'botMessage', text: "First, some personal details.", nextStepId: 'pc_s1_fullName' },
  { id: 'pc_s1_fullName', type: 'userInput', text: "What's your full name? (Required)", placeholder: "e.g., John Doe", variableName: 'fullName', nextStepId: 'pc_s1_dob' },
  { id: 'pc_s1_dob', type: 'userInput', inputType: 'date', text: "What's your date of birth? (YYYY-MM-DD)", placeholder: "YYYY-MM-DD", variableName: 'dateOfBirth', nextStepId: 'pc_s1_gender' },
  { id: 'pc_s1_gender', type: 'userDropdown', text: "What's your gender?", dropdownOptions: Genders.map(g => ({label: g, value: g})), variableName: 'gender', nextStepId: 'pc_s1_email' },
  { id: 'pc_s1_email', type: 'userInput', inputType: 'email', text: "What's your email ID? (Required)", placeholder: "you@example.com", variableName: 'email', nextStepId: 'pc_s1_mobile' },
  { id: 'pc_s1_mobile', type: 'userInput', inputType: 'tel', text: "What's your mobile number (with country code)?", placeholder: "+1 123 456 7890", variableName: 'mobileNumber', nextStepId: 'pc_s1_address' },
  { id: 'pc_s1_address', type: 'userInput', text: "What's your current address (City, State, Country)?", placeholder: "San Francisco, CA, USA", inputType: 'textarea', variableName: 'currentAddress', nextStepId: 'pc_s2_start' },
  { id: 'pc_s2_start', type: 'botMessage', text: "Great! Now, let's cover your academic background.", nextStepId: 'pc_s2_gradYear' },
  { id: 'pc_s2_gradYear', type: 'userDropdown', text: "What's your year of graduation/batch?", dropdownOptions: graduationYears.map(y => ({label: y, value: y})), variableName: 'graduationYear', nextStepId: 'pc_s2_degree' },
  { id: 'pc_s2_degree', type: 'userDropdown', text: "What's your degree/program?", dropdownOptions: DegreePrograms.map(d => ({label: d, value: d})), variableName: 'degreeProgram', nextStepId: 'pc_s2_department' },
  { id: 'pc_s2_department', type: 'userInput', text: "What's your department?", placeholder: "e.g., Computer Science", variableName: 'department', nextStepId: 'pc_s3_start' },
  { id: 'pc_s3_start', type: 'botMessage', text: "Excellent. Let's move on to your professional information.", nextStepId: 'pc_s3_jobTitle' },
  { id: 'pc_s3_jobTitle', type: 'userInput', text: "What's your current job title?", placeholder: "e.g., Software Engineer", variableName: 'currentJobTitle', nextStepId: 'pc_s3_organization' },
  { id: 'pc_s3_organization', type: 'userInput', text: "What's your current organization?", placeholder: "e.g., Tech Corp", variableName: 'currentOrganization', nextStepId: 'pc_s3_industry' },
  { id: 'pc_s3_industry', type: 'userDropdown', text: "What's your industry/sector?", dropdownOptions: Industries.map(i => ({label: i, value: i})), variableName: 'industry', nextStepId: 'pc_s3_workLocation' },
  { id: 'pc_s3_workLocation', type: 'userInput', text: "What's your work location (City, Country)?", placeholder: "e.g., London, UK", variableName: 'workLocation', nextStepId: 'pc_s3_linkedin' },
  { id: 'pc_s3_linkedin', type: 'userInput', inputType: 'url', text: "What's your LinkedIn profile URL? (Optional)", placeholder: "https://linkedin.com/in/yourprofile", variableName: 'linkedInProfile', nextStepId: 'pc_s3_experience' },
  { id: 'pc_s3_experience', type: 'userInput', text: "How many years of experience do you have?", placeholder: "e.g., 5 or 5+", variableName: 'yearsOfExperience', nextStepId: 'pc_s3_skills_prompt' },
  { id: 'pc_s3_skills_prompt', type: 'botMessage', text: "What are your key skills or areas of expertise? (Please list them, separated by commas)", nextStepId: 'pc_s3_skills_input' },
  { id: 'pc_s3_skills_input', type: 'userInput', placeholder: "e.g., React, Python, Data Analysis", inputType: 'textarea', variableName: 'skills', nextStepId: 'pc_s4_start' },
  { id: 'pc_s4_start', type: 'botMessage', text: "Let's talk about alumni engagement.", nextStepId: 'pc_s4_supportAreas_prompt' },
  { id: 'pc_s4_supportAreas_prompt', type: 'botMessage', text: `Which areas can you support? (Comma-separated from: ${AreasOfSupport.join(', ')})`, nextStepId: 'pc_s4_supportAreas_input' },
  { id: 'pc_s4_supportAreas_input', type: 'userInput', text: "Your areas of support:", placeholder: "e.g., Mentoring Students, Job Referrals", inputType: 'textarea', variableName: 'areasOfSupport', nextStepId: 'pc_s4_timeCommitment' },
  { id: 'pc_s4_timeCommitment', type: 'userDropdown', text: "How much time are you willing to commit per month?", dropdownOptions: TimeCommitments.map(tc => ({label: tc, value: tc})), variableName: 'timeCommitment', nextStepId: 'pc_s4_engagementMode' },
  { id: 'pc_s4_engagementMode', type: 'userDropdown', text: "What's your preferred mode of engagement?", dropdownOptions: EngagementModes.map(em => ({label: em, value: em})), variableName: 'preferredEngagementMode', nextStepId: 'pc_s4_otherComments' },
  { id: 'pc_s4_otherComments', type: 'userInput', text: "Any other comments or notes regarding engagement? (Optional)", inputType: 'textarea', variableName: 'otherComments', nextStepId: 'pc_s5_start' },
  { id: 'pc_s5_start', type: 'botMessage', text: "Now, optionally, tell us if you're looking for any specific support.", nextStepId: 'pc_s5_supportType' },
  { id: 'pc_s5_supportType', type: 'userDropdown', text: "What type of support are you looking for? (Optional)", dropdownOptions: [{label: "Not looking for support now", value: "none"}, ...SupportTypesSought.map(st => ({label: st, value: st}))], variableName: 'lookingForSupportType', nextStepId: 'pc_s5_helpNeeded' },
  { id: 'pc_s5_helpNeeded', type: 'userInput', text: "Briefly describe the help you need. (Optional, if you selected a support type)", inputType: 'textarea', variableName: 'helpNeededDescription', nextStepId: 'pc_s6_start' },
  { id: 'pc_s6_start', type: 'botMessage', text: "Almost done! Just a couple of consent questions.", nextStepId: 'pc_s6_shareProfile' },
  { id: 'pc_s6_shareProfile', type: 'userOptions', text: "Can we share your profile with other alumni for relevant collaboration?", options: [{text: 'Yes', value: 'true', nextStepId: 'pc_s6_featureSpotlight'}, {text: 'No', value: 'false', nextStepId: 'pc_s6_featureSpotlight'}], variableName: 'shareProfileConsent' },
  { id: 'pc_s6_featureSpotlight', type: 'userOptions', text: "Can we feature you on the alumni dashboard or spotlight?", options: [{text: 'Yes', value: 'true', nextStepId: 'pc_end'}, {text: 'No', value: 'false', nextStepId: 'pc_end'}], variableName: 'featureInSpotlightConsent' },
  { id: 'pc_end', type: 'botMessage', text: "Thank you for completing your profile information! Your profile is now more discoverable. 🎉", isLastStep: true },
];
