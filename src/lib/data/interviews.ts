
import type { MockInterviewSession, PracticeSession, LiveInterviewSession, InterviewQuestionCategory, InterviewQuestionDifficulty } from '@/types';
import { SAMPLE_DATA_BASE_DATE } from './platform';
import { LiveInterviewSessionStatuses } from '@/types';
import { sampleInterviewQuestions } from './questions';

const MOCK_USER_ID = 'alumni1';

export const sampleMockInterviewSessions: MockInterviewSession[] = [
  {
    id: 'session-hist-1',
    userId: MOCK_USER_ID,
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
    userId: MOCK_USER_ID,
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
    id: "ps-ai-1",
    userId: 'alumni1',
    date: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
    category: "Practice with AI",
    type: "React Hooks & State Management",
    language: "English",
    status: "SCHEDULED",
    notes: "AI interview focusing on React concepts.",
    topic: "React Hooks & State Management",
    createdAt: new Date().toISOString(),
    aiTopicOrRole: "React Developer",
    aiNumQuestions: 5,
    aiDifficulty: 'medium',
    aiTimerPerQuestion: 120,
    aiQuestionCategories: ['Technical', 'Coding'],
  },
  {
    id: "ps-expert-2",
    userId: 'managerUser1',
    date: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
    category: "Practice with Experts",
    type: "Leadership & Management",
    language: "English",
    status: "SCHEDULED",
    notes: "Session to discuss team leadership strategies and conflict resolution.",
    topic: "Leadership & Management",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ps-friend-1",
    userId: 'alumni2', // Bob
    date: new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow
    category: "Practice with Friends",
    type: "Product Management Case Study",
    language: "English",
    status: "SCHEDULED",
    notes: "Practice with Alice Wonderland for upcoming PM interview.",
    topic: "Product Management Case Study",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ps1",
    userId: 'managerUser1',
    date: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 86400000 * 3).toISOString(),
    category: "Practice with Experts",
    type: "Angular Frontend",
    language: "English",
    status: "SCHEDULED",
    notes: "Focus on advanced component architecture and state management for the candidate.",
    topic: "Angular Frontend",
    createdAt: new Date().toISOString(),
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
    topic: "System Design Interview",
    createdAt: new Date().toISOString(),
  },
];

export let sampleLiveInterviewSessions: LiveInterviewSession[] = [
  {
    id: 'ps1',
    tenantId: 'tenant-2',
    title: 'Angular Frontend Practice (Expert Mock for Mike)',
    participants: [
      { userId: 'managerUser1', name: 'Manager Mike', role: 'interviewer', profilePictureUrl: `https://avatar.vercel.sh/managerUser1.png` },
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
      { userId: 'alumni1', name: 'Alice Wonderland', role: 'candidate', profilePictureUrl: `https://avatar.vercel.sh/alumni1.png` }
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
      { userId: 'alumni1', name: 'Alice Wonderland', role: 'interviewer', profilePictureUrl: `https://avatar.vercel.sh/alumni1.png` },
      { userId: 'alumni2', name: 'Bob The Builder', role: 'candidate', profilePictureUrl: `https://avatar.vercel.sh/alumni2.png` }
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
      { userId: 'managerUser1', name: 'Manager Mike', role: 'interviewer', profilePictureUrl: `https://avatar.vercel.sh/managerUser1.png` },
      { userId: 'alumni3', name: 'Charlie Brown', role: 'candidate', profilePictureUrl: `https://avatar.vercel.sh/alumni3.png` }
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
