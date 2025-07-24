import type { UserProfile, AlumniProfile, CommunityPost } from '@/types';
import { AreasOfSupport } from '@/types';

// This file now primarily provides a single sample user for client-side fallbacks
// and utility functions. The main source of truth for users is the database.

export let sampleUserProfile: UserProfile = {
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
  challengeTopics: [],
  challengeProgress: {
    refer: { action: 'refer', current: 2, target: 5 },
    analyze_resume: { action: 'analyze_resume', current: 3, target: 3 },
  },
  sessionId: undefined,
};


export let sampleAlumni: AlumniProfile[] = [
  // This can be populated dynamically from the database in the future,
  // but for now, we can derive a smaller sample for components that need it.
  {
    id: 'alumni1',
    tenantId: 'Brainqy',
    role: 'admin',
    name: 'Alice Wonderland',
    email: 'alice.wonderland@example.com',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    currentJobTitle: 'Senior Software Engineer',
    company: 'Google',
    shortBio: 'Passionate about AI and cloud computing. Graduated in 2015. Currently a Senior Software Engineer at Google.',
    university: 'State University',
    profilePictureUrl: 'https://picsum.photos/seed/alice/200/200',
    skills: ['Java', 'Python', 'Machine Learning', 'Cloud Computing', 'Algorithms', 'React', 'Next.js'],
    interests: ['Hiking', 'Photography', 'Open Source Contributions', 'AI Ethics'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[2], AreasOfSupport[4]],
    appointmentCoinCost: 10,
    xpPoints: 3500,
    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
    isDistinguished: true
  },
];

const ensureFullUserProfile = (
  user: Partial<UserProfile> & Pick<UserProfile, 'name' | 'email' | 'role' | 'tenantId'>
): UserProfile => ({
  id: user.id || `user-${Date.now()}`,
  status: user.status || 'active',
  lastLogin: user.lastLogin || new Date().toISOString(),
  currentJobTitle: user.currentJobTitle || '',
  company: user.company || '',
  skills: user.skills || [],
  bio: user.bio || '',
  profilePictureUrl: user.profilePictureUrl || `https://avatar.vercel.sh/${user.email}.png`,
  xpPoints: user.xpPoints || 0,
  dailyStreak: user.dailyStreak || 0,
  longestStreak: user.longestStreak || 0,
  totalActiveDays: user.totalActiveDays || 0,
  weeklyActivity: user.weeklyActivity || Array(7).fill(false),
  earnedBadges: user.earnedBadges || [],
  interviewCredits: user.interviewCredits || 5,
  createdAt: user.createdAt || new Date().toISOString(),
  isDistinguished: user.isDistinguished || false,
  shortBio: user.shortBio || 'New user on the platform.',
  university: user.university || 'N/A',
  areasOfSupport: user.areasOfSupport || [],
  interests: user.interests || [],
  offersHelpWith: user.offersHelpWith || [],
  pastInterviewSessions: user.pastInterviewSessions || [],
  challengeTopics: user.challengeTopics || [],
  referralCode: user.referralCode || `REF-${user.name.substring(0,4).toUpperCase()}${Date.now().toString().slice(-4)}`,
  ...user,
});


// Re-introducing samplePlatformUsers for UI components that depend on it.
// In a real app, this would be replaced by API calls fetching user lists.
export let samplePlatformUsers: UserProfile[] = [
  sampleUserProfile, // Alice Wonderland (Admin)
  ensureFullUserProfile({ id: 'alumni2', tenantId: 'Brainqy', role: 'user', name: 'Bob The Builder', email: 'bob.builder@example.com', currentJobTitle: 'Product Manager', company: 'Innovate LLC', skills: ['Agile', 'Product Roadmapping'], shortBio: 'Building great products.', university: 'State University', xpPoints: 1250, dailyStreak: 5, profilePictureUrl: 'https://picsum.photos/seed/bob/200/200', isDistinguished: true }),
  ensureFullUserProfile({ id: 'alumni3', tenantId: 'tenant-2', role: 'user', name: 'Charlie Brown', email: 'charlie.brown@example.com', currentJobTitle: 'Data Scientist', company: 'Data Corp', skills: ['SQL', 'Tableau', 'R'], shortBio: 'Loves data visualization.', university: 'Tech University', xpPoints: 800, dailyStreak: 2, profilePictureUrl: 'https://picsum.photos/seed/charlie/200/200' }),
  ensureFullUserProfile({ id: 'alumni4', tenantId: 'Brainqy', role: 'user', name: 'Diana Prince', email: 'diana.prince@example.com', currentJobTitle: 'UX Designer', company: 'Web Wizards', skills: ['Figma', 'User Research'], shortBio: 'Creating user-centric designs.', university: 'State University', xpPoints: 2100, dailyStreak: 12, profilePictureUrl: 'https://picsum.photos/seed/diana/200/200' }),
  ensureFullUserProfile({ id: 'managerUser1', tenantId: 'tenant-2', role: 'manager', name: 'Manager Mike', email: 'manager.mike@tenant2.com', currentJobTitle: 'Engagement Lead', company: 'Corporate Partner Inc.', shortBio: 'Managing the corporate partnership program.', university: 'Business College', xpPoints: 1500, dailyStreak: 10, profilePictureUrl: 'https://avatar.vercel.sh/managermike.png' }),
];

export const USE_MOCK_DATA = false;
export let sampleCommunityPosts: CommunityPost[] = [];
