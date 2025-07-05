import type { UserProfile, AlumniProfile } from '@/types';
import { SAMPLE_TENANT_ID } from './platform';
import { AreasOfSupport } from '@/types';

export let samplePlatformUsers: UserProfile[] = [
  {
    id: 'alumni1',
    tenantId: 'Brainqy',
    role: 'admin',
    name: 'Alice Wonderland',
    email: 'alice.wonderland@example.com',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    dateOfBirth: '1993-03-15',
    gender: 'Female',
    mobileNumber: '+15551112222',
    currentAddress: '123 Main St, Anytown, CA, USA',
    graduationYear: '2015',
    degreeProgram: 'Master of Science (M.Sc)',
    department: 'Computer Science',
    currentJobTitle: 'Senior Software Engineer',
    company: 'Google',
    currentOrganization: 'Google',
    industry: 'IT/Software',
    workLocation: 'Mountain View, CA',
    linkedInProfile: 'https://linkedin.com/in/alicewonder',
    yearsOfExperience: '7',
    skills: ['Java', 'Python', 'Machine Learning', 'Cloud Computing', 'Algorithms', 'React', 'Next.js'],
    areasOfSupport: ['Mentoring Students', 'Sharing Job Referrals', 'Guest Lecturing'],
    timeCommitment: '1-2 hours',
    preferredEngagementMode: 'Online',
    otherComments: 'Happy to help with technical interview prep!',
    lookingForSupportType: undefined,
    helpNeededDescription: undefined,
    shareProfileConsent: true,
    featureInSpotlightConsent: true,
    shortBio: 'Passionate about AI and cloud computing. Graduated in 2015. Currently a Senior Software Engineer at Google.',
    university: 'State University',
    profilePictureUrl: 'https://picsum.photos/seed/alice/200/200',
    interests: ['Hiking', 'Photography', 'Open Source Contributions', 'AI Ethics'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[2], AreasOfSupport[4]],
    appointmentCoinCost: 10,
    resumeText: `Alice Wonderland
(123) 456-7890 | alice.wonderland@email.com | linkedin.com/in/alicewonder | github.com/alicew | alicew.dev

Summary
Highly skilled Senior Software Engineer with 7+ years of experience specializing in architecting and implementing responsive, accessible, and performant web applications using React, TypeScript, and Next.js. Proven ability to lead development efforts, mentor junior engineers, and collaborate effectively with cross-functional teams to deliver exceptional user experiences. Passionate about clean code, user-centric design, and staying current with cutting-edge frontend technologies. Seeking to leverage expertise to contribute to Innovatech Solutions' mission of revolutionizing data analytics.

Skills
Languages: JavaScript (ESNext), TypeScript, HTML5, CSS3, Python (Basic)
Frameworks/Libraries: React, Next.js, Redux, Context API, React Router, Jest, React Testing Library, GraphQL, Apollo Client, Tailwind CSS, Styled Components
Tools: Git, Webpack, Babel, ESLint, Prettier, Figma, Jira, Jenkins (CI/CD)
Methodologies: Agile/Scrum, Mobile-First Development, Responsive Design, WCAG 2.1 AA Accessibility
Soft Skills: Leadership, Mentorship, Code Review, Problem-Solving, Communication (Verbal & Written), Teamwork, Project Management, Time Management, Adaptability

Experience
Senior Frontend Developer | WebSolutions Co. | San Francisco, CA (Remote) | June 2019 – Present
- Led the development of a new SaaS analytics platform frontend using React, TypeScript, and Next.js, resulting in a 30% improvement in user engagement and a 25% reduction in page load times.
- Architected and implemented a reusable UI component library, adopted by 5 development teams, increasing development velocity by 40%.
- Collaborated closely with UX/UI designers to translate complex wireframes into intuitive and visually appealing interfaces, consistently meeting project deadlines.
- Championed and enforced WCAG 2.1 AA accessibility standards, achieving 95% compliance across all new features.
- Authored comprehensive unit and integration tests using Jest and React Testing Library, achieving 90% code coverage for critical components.
- Mentored 3 junior frontend developers, improving their code quality and productivity by an average of 20% within 6 months.
- Managed frontend project timelines and deliverables for 4 major product releases, ensuring 100% on-time completion.
- Proactively identified and resolved over 50 critical UI bugs, enhancing application stability and user satisfaction.
- Contributed significantly to frontend architectural decisions and established team-wide coding best practices.

Frontend Developer | AppBuilders Inc. | Oakland, CA | May 2017 – June 2019
- Developed and maintained responsive user interfaces for multiple client projects using React and JavaScript.
- Increased application performance by 15% through targeted code optimizations and lazy loading techniques.
- Successfully integrated third-party APIs for payment processing and social media functionalities.
- Participated actively in an Agile/Scrum development process, contributing to sprint planning and daily stand-ups.

Education
Bachelor of Science in Computer Science | State University | Berkeley, CA | May 2017
- Minor in Web Design
- Dean's List: 2015, 2016, 2017
- Senior Project: "Interactive Data Visualization Tool" (React, D3.js)

Projects
- Open-Source UI Kit: Contributed 10+ components to a popular open-source React UI library on GitHub. (github.com/alicew/ui-kit-contribution)
`,
    careerInterests: 'AI Research, Large-Scale Systems, Technical Leadership',
    xpPoints: 3500,
    dailyStreak: 25,
    longestStreak: 50,
    totalActiveDays: 300,
    weeklyActivity: [true, true, true, false, true, true, true],
    referralCode: 'ALICEWONDER1',
    earnedBadges: ['networker', 'contributor', 'profile-pro', 'analyzer-ace', 'admin-master'],
    affiliateCode: 'AFFALICE123',
    pastInterviewSessions: ['session-hist-1'],
    interviewCredits: 8,
    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
    isDistinguished: true,
    userApiKey: '',
    bio: '',
    challengeProgress: {
      refer: { action: 'refer', current: 2, target: 5 },
      analyze_resume: { action: 'analyze_resume', current: 3, target: 3 },
    },
    sessionId: undefined,
  },
  {
    id: 'alumni2',
    tenantId: 'Brainqy',
    name: 'Bob The Builder',
    email: "bob.builder@example.com",
    role: 'user',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
    profilePictureUrl: 'https://picsum.photos/seed/bob/200/200',
    currentJobTitle: 'Product Manager',
    company: 'Microsoft',
    shortBio: 'Focused on user-centric product development. Class of 2018.',
    university: 'Tech Institute',
    skills: ['Product Management', 'Agile', 'UX Research', 'Roadmapping'],
    interests: ['Woodworking', 'Community Volunteering', 'Travel'],
    offersHelpWith: [AreasOfSupport[1], AreasOfSupport[3], AreasOfSupport[8]],
    appointmentCoinCost: 15,
    xpPoints: 1800,
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    isDistinguished: true,
    bio: "Product Manager at Microsoft, skilled in Agile and UX research.",
    careerInterests: "Leading product teams",
    dailyStreak: 5,
    earnedBadges: ['contributor'],
    interviewCredits: 3,
    referralCode: 'BOB123',
    userApiKey: '',
    currentOrganization: 'Microsoft',
    sessionId: undefined,
  },
  {
    id: 'alumni3',
    tenantId: 'tenant-2',
    name: 'Charlie Brown',
    email: "charlie.brown@example.com",
    role: 'user',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000 * 30).toISOString(),
    profilePictureUrl: 'https://picsum.photos/seed/charlie/200/200',
    currentJobTitle: 'Data Scientist',
    company: 'Meta',
    shortBio: 'Exploring large-scale data and its implications. Alumnus of 2017.',
    university: 'State University',
    skills: ['R', 'Statistics', 'Big Data', 'Python', 'Data Visualization'],
    interests: ['Chess', 'Reading Sci-Fi', 'Data For Good'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[7]],
    appointmentCoinCost: 10,
    xpPoints: 1200,
    createdAt: new Date(Date.now() - 86400000 * 500).toISOString(),
    isDistinguished: false,
    bio: "Data Scientist at Meta, working on large scale data.",
    careerInterests: "AI Ethics",
    dailyStreak: 0,
    earnedBadges: [],
    interviewCredits: 2,
    referralCode: 'CHARLIE789',
    userApiKey: '',
    currentOrganization: 'Meta',
    sessionId: undefined,
  },
  {
    id: 'alumni4',
    tenantId: 'Brainqy',
    name: 'Diana Prince',
    profilePictureUrl: 'https://picsum.photos/seed/diana/200/200',
    currentJobTitle: 'Cybersecurity Analyst',
    company: 'SecureNet Solutions',
    shortBio: 'Dedicated to protecting digital assets and ensuring information security. Graduated in 2019.',
    university: 'Cyber Security Institute',
    skills: ['Network Security', 'Ethical Hacking', 'Cryptography', 'SIEM', 'Incident Response'],
    email: "diana.prince@example.com",
    role: 'user',
    status: 'active',
    lastLogin: new Date(Date.now() - 0.75 * 86400000).toISOString(),
    interests: ['Digital Forensics', 'Martial Arts', 'Ancient History'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[6]],
    appointmentCoinCost: 12,
    xpPoints: 1500,
    createdAt: new Date(Date.now() - 86400000 * 250).toISOString(),
    isDistinguished: true,
    bio: "Cybersecurity analyst with a focus on threat detection.",
    careerInterests: "Cybersecurity leadership",
    dailyStreak: 7,
    earnedBadges: ['analyzer-ace'],
    interviewCredits: 4,
    referralCode: 'DIANA456',
    userApiKey: '',
    currentOrganization: 'SecureNet Solutions',
    sessionId: undefined,
  },
  {
    id: 'managerUser1',
    tenantId: 'tenant-2',
    role: 'user',
    name: 'Manager Mike',
    email: 'manager.mike@tenant2.com',
    status: 'active',
    lastLogin: new Date().toISOString(),
    dateOfBirth: '1985-08-15',
    gender: 'Male',
    mobileNumber: '+15552223333',
    currentAddress: '123 Corporate Ave, Business City, TX, USA',
    graduationYear: '2007',
    degreeProgram: 'Bachelor of Business Administration (BBA)',
    department: 'Management',
    currentJobTitle: 'Engagement Lead',
    company: 'Corporate Partner Inc.',
    currentOrganization: 'Corporate Partner Inc.',
    industry: 'Consulting',
    workLocation: 'Dallas, TX',
    linkedInProfile: 'https://linkedin.com/in/managermike',
    yearsOfExperience: '15',
    skills: ['Team Leadership', 'Project Management', 'Alumni Relations', 'Strategic Planning', 'Communication'],
    areasOfSupport: ['Mentoring Students', 'Sharing Job Referrals', 'Organizing Alumni Events'],
    timeCommitment: '3-5 hours',
    preferredEngagementMode: 'Online',
    otherComments: 'Leading engagement initiatives and fostering alumni connections for Corporate Partner Inc.',
    lookingForSupportType: 'General Networking',
    helpNeededDescription: 'Interested in connecting with other managers and sharing best practices for alumni engagement.',
    shareProfileConsent: true,
    featureInSpotlightConsent: false,
    shortBio: 'Dedicated Engagement Lead at Corporate Partner Inc., focused on maximizing alumni potential and fostering a strong professional network within Tenant-2. My expertise includes team leadership, project management, and strategic planning for alumni relations. Committed to creating valuable connections and opportunities for our members.',
    university: 'Business School of Excellence',
    profilePictureUrl: 'https://avatar.vercel.sh/managermike.png',
    interests: ['Leadership Development', 'Corporate Strategy', 'Golf'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[2], AreasOfSupport[8]],
    appointmentCoinCost: 0,
    resumeText: `Manager Mike
Email: manager.mike@tenant2.com | LinkedIn: linkedin.com/in/managermike | Mobile: +15552223333
side
Summary:
Results-oriented Engagement Lead with 15 years of experience in fostering alumni relations and driving community growth for Corporate Partner Inc. (Tenant-2). Expertise in strategic planning, team leadership, and project management. Passionate about creating impactful programs that connect alumni and enhance their professional development.

Experience:
Engagement Lead, Corporate Partner Inc. (Tenant-2) (Present)
- Spearhead alumni engagement strategies and initiatives for Tenant-2.
- Manage a team to organize networking events, mentorship programs, and communication campaigns.
- Develop and implement programs to increase alumni participation and satisfaction.
- Collaborate with stakeholders to align alumni activities with organizational goals.

Senior Project Manager, Global Solutions Ltd. (Previous)
- Led cross-functional teams to deliver complex projects on time and within budget.
- Managed stakeholder expectations and communication across all project phases.

Education:
Bachelor of Business Administration (BBA), Business School of Excellence (2003 - 2007)

Skills:
Team Leadership, Project Management, Alumni Relations, Strategic Planning, Stakeholder Management, Event Management, Communication, Public Speaking, Data Analysis (for engagement tracking).
`,
    careerInterests: 'Executive Leadership, Organizational Development, Alumni Network Growth',
    xpPoints: 3200,
    dailyStreak: 15,
    longestStreak: 40,
    totalActiveDays: 200,
    weeklyActivity: [true, false, true, true, false, true, true],
    referralCode: 'MANAGERMIKE1',
    earnedBadges: ['networker', 'contributor', 'profile-pro'],
    affiliateCode: 'AFFMIKE789',
    pastInterviewSessions: [],
    interviewCredits: 5,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    isDistinguished: false,
    userApiKey: '',
    sessionId: undefined,
    bio: "Dedicated Engagement Lead at Corporate Partner Inc., focused on maximizing alumni potential and fostering a strong professional network within Tenant-2.",
  },
];

export let sampleUserProfile: UserProfile = samplePlatformUsers.find(u => u.id === 'managerUser1')!;

export let sampleAlumni: AlumniProfile[] = samplePlatformUsers.map(user => {
  const {
    // Exclude fields not in AlumniProfile
    dateOfBirth,
    gender,
    mobileNumber,
    currentAddress,
    graduationYear,
    degreeProgram,
    department,
    currentOrganization,
    industry,
    workLocation,
    linkedInProfile,
    yearsOfExperience,
    areasOfSupport,
    timeCommitment,
    preferredEngagementMode,
    otherComments,
    lookingForSupportType,
    helpNeededDescription,
    shareProfileConsent,
    featureInSpotlightConsent,
    resumeText,
    careerInterests,
    dailyStreak,
    longestStreak,
    totalActiveDays,
    weeklyActivity,
    referralCode,
    earnedBadges,
    affiliateCode,
    pastInterviewSessions,
    interviewCredits,
    challengeTopics,
    sessionId,
    ...alumniProfile
  } = user;
  return alumniProfile;
});

// Utility function to ensure UserProfile has all fields, especially for sample data
export function ensureFullUserProfile(partialProfile: Partial<UserProfile>): UserProfile {
  const defaultUser: UserProfile = {
    id: `user-${Date.now()}`,
    tenantId: SAMPLE_TENANT_ID,
    role: 'user',
    name: 'New User',
    email: `user${Date.now()}@example.com`,
    status: 'active',
    lastLogin: new Date().toISOString(),
    currentJobTitle: '',
    company: '', // Ensure 'company' (from AlumniProfile) is present
    currentOrganization: '', // Ensure 'currentOrganization' (from UserProfile) is present
    skills: [],
    bio: '',
    profilePictureUrl: `https://avatar.vercel.sh/user${Date.now()}.png`,
    xpPoints: 0,
    dailyStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    weeklyActivity: [false,false,false,false,false,false,false],
    earnedBadges: [],
    interviewCredits: 0,
    createdAt: new Date().toISOString(),
    // Ensure all other UserProfile fields have defaults
    dateOfBirth: undefined,
    gender: undefined,
    mobileNumber: '',
    currentAddress: '',
    graduationYear: '',
    degreeProgram: undefined,
    department: '',
    industry: undefined,
    workLocation: '',
    linkedInProfile: '',
    yearsOfExperience: '',
    areasOfSupport: [],
    timeCommitment: undefined,
    preferredEngagementMode: undefined,
    otherComments: '',
    lookingForSupportType: undefined,
    helpNeededDescription: '',
    shareProfileConsent: true,
    featureInSpotlightConsent: false,
    isDistinguished: false,
    resumeText: '',
    careerInterests: '',
    interests: [],
    offersHelpWith: [],
    appointmentCoinCost: 10,
    referralCode: `REF${Date.now().toString().slice(-6)}`,
    affiliateCode: undefined,
    pastInterviewSessions: [],
    challengeTopics: [],
    challengeProgress: {},
    shortBio: '', // From AlumniProfile
    university: '', // From AlumniProfile,
    userApiKey: '',
    sessionId: undefined,
  };
  return { ...defaultUser, ...partialProfile };
}
