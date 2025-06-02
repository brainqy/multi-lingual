
import type { JobApplication, AlumniProfile, Activity, CommunityPost, FeatureRequest, GalleryEvent, JobOpening, UserProfile, UserRole, Gender, DegreeProgram, Industry, SupportArea, TimeCommitment, EngagementMode, SupportTypeSought, ResumeScanHistoryItem, Appointment, Wallet, ResumeProfile, Tenant, Badge, BlogPost, ReferralHistoryItem, GamificationRule, UserStatus, SurveyResponse, Affiliate, AffiliateClick, AffiliateSignup, AffiliateStatus, SurveyStep, ResumeTemplate, TourStep, CommunityComment, InterviewQuestion, InterviewQuestionCategory, BlogGenerationSettings, MockInterviewSession, InterviewQuestionDifficulty, InterviewQuestionUserComment, PracticeSession, PracticeSessionStatus, JobApplicationStatus, KanbanColumnId, PlatformSettings, Announcement, AnnouncementStatus, AnnouncementAudience, MockInterviewQuestion as AIMockQuestionType, LiveInterviewSession, LiveInterviewParticipant, RecordingReference, LiveInterviewSessionStatus, InterviewerScore, SystemAlert } from '@/types';
import { AreasOfSupport, AppointmentStatuses, Genders, DegreePrograms, Industries, TimeCommitments, EngagementModes, SupportTypesSought, JOB_APPLICATION_STATUSES, KANBAN_COLUMNS_CONFIG, PREDEFINED_INTERVIEW_TOPICS, PRACTICE_FOCUS_AREAS, ALL_CATEGORIES, ALL_DIFFICULTIES, MOCK_INTERVIEW_STEPS, RESUME_BUILDER_STEPS, PreferredTimeSlots, AnnouncementStatuses, AnnouncementAudiences, LiveInterviewSessionStatuses } from '@/types'; 

export let SAMPLE_TENANT_ID = 'Brainqy'; 

export let sampleJobApplications: JobApplication[] = [
  { id: '1', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'Tech Solutions Inc.', jobTitle: 'Software Engineer', status: 'Applied', dateApplied: '2024-07-01', notes: 'Applied via company portal.', location: 'Remote', reminderDate: new Date(Date.now() + 86400000 * 7).toISOString(), applicationUrl: 'https://example.com/apply/job1' }, 
  { id: '2', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'Innovate LLC', jobTitle: 'Frontend Developer', status: 'Interviewing', dateApplied: '2024-06-25', notes: 'First interview scheduled for 2024-07-10.', location: 'New York, NY', applicationUrl: 'https://example.com/apply/job2' },
  { id: '3', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'Data Corp', jobTitle: 'Data Analyst', status: 'Offer', dateApplied: '2024-06-15', notes: 'Received offer, considering.', location: 'San Francisco, CA', reminderDate: new Date(Date.now() + 86400000 * 3).toISOString(), applicationUrl: 'https://example.com/apply/job3' }, 
  { id: '4', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'Web Wizards', jobTitle: 'UX Designer', status: 'Rejected', dateApplied: '2024-06-20', notes: 'Did not proceed after initial screening.', location: 'Austin, TX', },
  { id: '5', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'CloudNetics', jobTitle: 'Cloud Engineer', status: 'Saved', dateApplied: '2024-07-05', notes: 'Interested, need to tailor resume.', location: 'Boston, MA', sourceJobOpeningId: 'job-board-cloudnetics-01' },
  { id: '6', tenantId: 'Brainqy', userId: 'managerUser1', companyName: 'AI Future', jobTitle: 'Machine Learning Eng.', status: 'Saved', dateApplied: '2024-07-15', notes: 'From scan report, good match.', location: 'Seattle, WA', sourceJobOpeningId: 'job-board-aifuture-02' },
  { id: '7', tenantId: 'Brainqy', userId: 'alumni1', companyName: 'Innovatech Solutions Inc.', jobTitle: 'Senior Frontend Developer', status: 'Applied', dateApplied: '2024-07-20', notes: 'Applied using AI generated cover letter.', location: 'San Francisco, CA', reminderDate: new Date(Date.now() + 86400000 * 5).toISOString(), applicationUrl: 'https://example.com/innovatech/apply' },
  { id: '8', tenantId: 'Brainqy', userId: 'alumni1', companyName: 'Web Solutions Co.', jobTitle: 'Frontend Developer', status: 'Interviewing', dateApplied: '2024-07-18', notes: 'Technical interview next week.', location: 'Remote', applicationUrl: 'https://example.com/websolutions/apply' },
];


export let sampleAlumni: AlumniProfile[] = [
  {
    id: 'alumni1',
    tenantId: 'Brainqy', 
    name: 'Alice Wonderland',
    profilePictureUrl: 'https://picsum.photos/seed/alice/200/200',
    currentJobTitle: 'Senior Software Engineer',
    company: 'Google',
    shortBio: 'Passionate about AI and cloud computing. Graduated in 2015.',
    university: 'State University',
    skills: ['Java', 'Python', 'Machine Learning', 'Cloud Computing', 'Algorithms'],
    email: "alice.wonderland@example.com",
    role: 'admin', 
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(), 
    interests: ['Hiking', 'Photography', 'Open Source'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[2], AreasOfSupport[4]], 
    appointmentCoinCost: 10,
    xpPoints: 2500,
    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(), 
    isDistinguished: true,
  },
  {
    id: 'alumni2',
    tenantId: 'Brainqy', 
    name: 'Bob The Builder',
    profilePictureUrl: 'https://picsum.photos/seed/bob/200/200',
    currentJobTitle: 'Product Manager',
    company: 'Microsoft',
    shortBio: 'Focused on user-centric product development. Class of 2018.',
    university: 'Tech Institute',
    skills: ['Product Management', 'Agile', 'UX Research', 'Roadmapping'],
    email: "bob.builder@example.com",
    role: 'user', 
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), 
    interests: ['Woodworking', 'Community Volunteering', 'Travel'],
    offersHelpWith: [AreasOfSupport[1], AreasOfSupport[3], AreasOfSupport[8]], 
    appointmentCoinCost: 15,
    xpPoints: 1800,
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(), 
    isDistinguished: true,
  },
  { 
    id: 'alumni3', 
    tenantId: 'tenant-2', 
    name: 'Charlie Brown',
    profilePictureUrl: 'https://picsum.photos/seed/charlie/200/200',
    currentJobTitle: 'Data Scientist',
    company: 'Meta', 
    shortBio: 'Exploring large-scale data and its implications. Alumnus of 2017.',
    university: 'State University',
    skills: ['R', 'Statistics', 'Big Data', 'Python', 'Data Visualization'],
    email: "charlie.brown@example.com",
    role: 'user',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000 * 5).toISOString(), 
    interests: ['Chess', 'Reading Sci-Fi', 'Data For Good'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[7]], 
    appointmentCoinCost: 10,
    xpPoints: 1200,
    createdAt: new Date(Date.now() - 86400000 * 500).toISOString(), 
    isDistinguished: false, 
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
  },
];

export const sampleActivities: Activity[] = [
  { id: 'act1', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), description: 'Uploaded resume "Software_Engineer_Resume.pdf".' },
  { id: 'act2', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), description: 'Analyzed resume for "Senior Product Manager" role at Innovate LLC.' },
  { id: 'act3', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: 'Connected with Bob The Builder.' },
  { id: 'act4', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), description: 'Tracked new job application for "Data Scientist" at Data Corp.' },
  { id: 'act5', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), description: 'Earned the "Profile Pro" badge.' },
  { id: 'act6', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), description: 'Posted in Community Feed: "Interview Tips?".' },
  { id: 'act7', tenantId: 'Brainqy', userId: 'alumni2', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), description: 'Shared a new job opening: "Junior Developer at Google".' },
  { id: 'act8', tenantId: 'Brainqy', userId: 'alumni1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), description: 'Commented on "Interview Tips?" post.' },
  { id: 'act9', tenantId: 'tenant-2', userId: 'managerUser1', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), description: 'Published a new announcement for Tenant-2.' },
  { id: 'act10', tenantId: 'Brainqy', userId: 'alumni4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), description: 'Registered for "Intro to Cloud Native" workshop.' },
];

export let sampleCommunityPosts: CommunityPost[] = [ 
  { 
    id: 'post1', 
    tenantId: 'Brainqy', 
    userId: 'alumni1', 
    userName: 'Alice Wonderland', 
    userAvatar: 'https://picsum.photos/seed/alice/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), 
    content: 'Anyone have experience with tackling take-home assignments for Senior Eng roles? Tips appreciated!', 
    type: 'text', 
    tags: ['jobsearch', 'interviewtips'], 
    moderationStatus: 'visible', 
    flagCount: 0,
    comments: [
      { id: 'comment1-1', userId: 'alumni2', userName: 'Bob The Builder', userAvatar: 'https://picsum.photos/seed/bob/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(), text: 'Focus on clean code and clear documentation for your solution. Good luck!' },
      { id: 'comment1-2', userId: 'alumni4', userName: 'Diana Prince', userAvatar: 'https://picsum.photos/seed/diana/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), text: 'Great question! I usually allocate specific time blocks for each part of the assignment.' },
    ]
  },
  { 
    id: 'post2', 
    tenantId: 'Brainqy', 
    userId: 'alumni2', 
    userName: 'Bob The Builder', 
    userAvatar: 'https://picsum.photos/seed/bob/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
    content: 'Looking for a mentor in the Product Management space. Any alumni willing to connect?', 
    type: 'request', 
    tags: ['mentorship', 'productmanagement'], 
    status: 'open', 
    moderationStatus: 'visible', 
    flagCount: 0,
    comments: [] 
  },
  { 
    id: 'post3', 
    tenantId: 'Brainqy', 
    userId: 'alumni1', 
    userName: 'Alice Wonderland', 
    userAvatar: 'https://picsum.photos/seed/alice/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), 
    content: 'Join our upcoming workshop: Intro to Cloud Native! Learn the fundamentals and best practices from industry experts.', 
    type: 'event', 
    eventTitle: 'Intro to Cloud Native', 
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), 
    eventLocation: 'Online (Zoom)',
    attendees: 55,
    capacity: 100, 
    tags: ['workshop', 'cloud', 'tech'], 
    moderationStatus: 'visible', 
    flagCount: 0,
    comments: [
       { id: 'comment3-1', userId: 'alumni2', userName: 'Bob The Builder', userAvatar: 'https://picsum.photos/seed/bob/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), text: 'Sounds interesting! Will there be a recording?' },
    ]
  },
  { 
    id: 'post4', 
    tenantId: 'Brainqy', 
    userId: 'alumni3', 
    userName: 'Charlie Brown', 
    userAvatar: 'https://picsum.photos/seed/charlie/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), 
    content: 'This is a borderline inappropriate post for testing moderation. Please review immediately.', 
    type: 'text', 
    tags: ['testing'], 
    moderationStatus: 'flagged', 
    flagCount: 1,
    comments: [] 
  },
  { 
    id: 'post5', 
    tenantId: 'Brainqy', 
    userId: 'alumni4', 
    userName: 'Diana Prince', 
    userAvatar: 'https://picsum.photos/seed/diana/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), 
    content: 'This post has been removed by admin for violating community guidelines.', 
    type: 'text', 
    tags: ['removed'], 
    moderationStatus: 'removed', 
    flagCount: 0,
    comments: [] 
  },
  { 
    id: 'post6', 
    tenantId: 'Brainqy', 
    userId: 'alumni1', 
    userName: 'Alice Wonderland', 
    userAvatar: 'https://picsum.photos/seed/alice/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), 
    content: 'Anyone have experience with tackling take-home assignments for Senior Eng roles? Tips appreciated!', 
    type: 'text', 
    tags: ['jobsearch', 'interviewtips'], 
    moderationStatus: 'visible', 
    flagCount: 0,
    comments: [],
    assignedTo: 'Bob The Builder', // Assigned to a user
  },
  { 
    id: 'post7', 
    tenantId: 'Brainqy', 
    userId: 'alumni2', 
    userName: 'Bob The Builder', 
    userAvatar: 'https://picsum.photos/seed/bob/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), 
    content: 'Looking for a mentor in the Product Management space. Any alumni willing to connect?', 
    type: 'request', 
    tags: ['mentorship', 'productmanagement'], 
    moderationStatus: 'visible', 
    flagCount: 0,
    comments: [],
    assignedTo: 'Alice Wonderland', // Assigned to another user
  },
  { 
    id: 'post', 
    tenantId: 'Brainqy', 
    userId: 'alumni3', 
    userName: 'Charlie Brown', 
    userAvatar: 'https://picsum.photos/seed/charlie/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), 
    content: 'Join our upcoming workshop: Intro to Cloud Native! Learn the fundamentals and best practices from industry experts.', 
    type: 'event', 
    eventTitle: 'Intro to Cloud Native', 
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), 
    eventLocation: 'Online (Zoom)',
    attendees: 55,
    capacity: 100, 
    tags: ['workshop', 'cloud', 'tech'],
    moderationStatus: 'visible', 
    flagCount: 0,
    comments: [],
    assignedTo: 'Diana Prince', // Assigned to another user
  },
];

export const sampleFeatureRequests: FeatureRequest[] = [
  { id: 'fr1', tenantId: 'Brainqy', userId: 'alumni1', userName: 'Alice Wonderland', userAvatar: 'https://picsum.photos/seed/alice/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), title: 'Integrate with LinkedIn for profile import', description: 'It would be great to automatically pull resume data from LinkedIn.', status: 'Pending', upvotes: 15 },
  { id: 'fr2', tenantId: 'Brainqy', userId: 'alumni2', userName: 'Bob The Builder', userAvatar: 'https://picsum.photos/seed/bob/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), title: 'Dark mode for the dashboard', description: 'A dark theme option would be easier on the eyes.', status: 'In Progress', upvotes: 28 },
  { id: 'fr3', tenantId: 'tenant-2', userId: 'managerUser1', userName: 'Manager Mike', userAvatar: 'https://avatar.vercel.sh/managermike.png', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), title: 'Tenant-specific branding options', description: 'Allow tenant managers to customize logos and color schemes.', status: 'Completed', upvotes: 42 },
];

export let sampleEvents: GalleryEvent[] = [ 
  { id: 'event1', tenantId: 'Brainqy', title: 'Annual Alumni Meet 2023', date: '2023-10-15T10:00:00Z', imageUrls: ['https://placehold.co/600x400.png?text=Annual+Meet+Pic+1', 'https://placehold.co/600x400.png?text=Networking+View', 'https://placehold.co/600x400.png?text=Awards+Ceremony'], description: 'A wonderful evening connecting with fellow alumni.' , dataAiHint: 'conference networking', approved: true, createdByUserId: 'alumni1', attendeeUserIds: ['managerUser1', 'alumni2', 'alumni4']},
  { id: 'event2', tenantId: 'Brainqy', title: 'Tech Talk Series: AI Today', date: '2024-03-22T10:00:00Z', imageUrls: ['https://placehold.co/600x400.png?text=AI+Presentation'], description: 'Insightful talks on the future of Artificial Intelligence.' , dataAiHint: 'presentation seminar', approved: true, createdByUserId: 'managerUser1', attendeeUserIds: ['alumni1', 'alumni2']},
  { id: 'event3', tenantId: 'Brainqy', title: 'Campus Job Fair Spring 2024', date: '2024-04-10T10:00:00Z', imageUrls: ['https://placehold.co/600x400.png?text=Job+Fair+Stalls', 'https://placehold.co/600x400.png?text=Students+Interacting', 'https://placehold.co/600x400.png?text=Company+Banners'], description: 'Connecting students with top employers.', dataAiHint: 'job fair students', approved: false, createdByUserId: 'managerUser1', attendeeUserIds: ['managerUser1', 'alumni4'] },
  { id: 'event4', tenantId: 'tenant-2', title: 'Tenant 2 Networking Mixer', date: '2024-05-10T10:00:00Z', imageUrls: ['https://placehold.co/600x400.png?text=Corporate+Event+Tenant2'], description: 'Exclusive networking event for Corporate Partner Inc. members.', dataAiHint: 'corporate networking', approved: true, createdByUserId: 'managerUser1', attendeeUserIds: ['alumni3', 'managerUser1'] },
];

export const sampleJobOpenings: JobOpening[] = [
  { id: 'job1', tenantId: 'Brainqy', title: 'Junior Developer', company: 'Google', postedByAlumniId: 'managerUser1', alumniName: 'Manager Mike', description: 'Exciting opportunity for recent graduates to join our engineering team. Key skills: Java, Python, Problem Solving.', datePosted: '2024-07-10', location: 'Mountain View, CA', type: 'Full-time', applicationLink: 'https://careers.google.com/jobs/results/' },
  { id: 'job2', tenantId: 'Brainqy', title: 'Marketing Intern (Summer)', company: 'Amazon', postedByAlumniId: 'alumni1', alumniName: 'Alice Wonderland', description: 'Gain hands-on experience in a fast-paced marketing environment. Focus on digital campaigns and market research.', datePosted: '2024-07-08', location: 'Seattle, WA', type: 'Internship', applicationLink: 'https://www.amazon.jobs/en/' },
  { id: 'job3', tenantId: 'Brainqy', title: 'Project Manager - Mentorship Program', company: 'Self-Employed (Mentorship)', postedByAlumniId: 'alumni2', alumniName: 'Bob The Builder', description: 'Looking to mentor aspiring Product Managers. Part-time commitment. Focus on agile methodologies and product strategy.', datePosted: '2024-07-05', location: 'Remote', type: 'Mentorship' },
  { id: 'job-board-cloudnetics-01', tenantId: 'Brainqy', title: 'Cloud Engineer', company: 'CloudNetics', postedByAlumniId: 'managerUser1', alumniName: 'Manager Mike', description: 'Join our innovative cloud solutions team. Experience with AWS/Azure required.', datePosted: '2024-07-03', location: 'Boston, MA', type: 'Full-time', applicationLink: 'https://example.com/cloudnetics/apply' },
  { id: 'job-board-aifuture-02', tenantId: 'Brainqy', title: 'Machine Learning Eng.', company: 'AI Future', postedByAlumniId: 'alumni3', alumniName: 'Charlie Brown', description: 'Work on cutting-edge ML projects. Strong Python and TensorFlow/PyTorch skills needed.', datePosted: '2024-07-14', location: 'Seattle, WA', type: 'Full-time' },
];

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
    bio: ''
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
    currentOrganization: 'Microsoft',
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
    currentOrganization: 'Meta',
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
    currentOrganization: 'SecureNet Solutions',
  },
  { 
    id: 'managerUser1', 
    tenantId: 'tenant-2', 
    role: 'admin', 
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
  },
];

export let sampleUserProfile: UserProfile = samplePlatformUsers.find(u => u.id === 'managerUser1')!; 


export const sampleAppointments: Appointment[] = [
    { id: 'appt1', tenantId: 'Brainqy', requesterUserId: 'alumni4', alumniUserId: 'alumni2', title: 'Mentorship Session with Bob B.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), withUser: 'Bob The Builder', status: 'Confirmed', costInCoins: 10, meetingLink: 'https://zoom.us/j/1234567890', reminderDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString() },
    { id: 'appt2', tenantId: 'Brainqy', requesterUserId: 'alumni2', alumniUserId: 'alumni1', title: 'Networking Call with Alice W.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), withUser: 'Alice Wonderland', status: 'Pending', costInCoins: 15, reminderDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString() },
    { id: 'appt3', tenantId: 'tenant-2', requesterUserId: 'alumni3', alumniUserId: 'managerUser1', title: 'Incoming Request: Career Advice', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 0).toISOString(), withUser: 'Charlie Brown', status: 'Pending', costInCoins: 10, reminderDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 0).toISOString() }, 
    { id: 'appt4', tenantId: 'Brainqy', requesterUserId: 'alumni1', alumniUserId: 'alumni2', title: 'Discuss Marketing Strategy', dateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), withUser: 'Bob The Builder', status: 'Completed', costInCoins: 20 },
    { id: 'appt5', tenantId: 'tenant-2', requesterUserId: 'managerUser1', alumniUserId: 'alumni3', title: 'Tenant 2 Strategy Meeting', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(), withUser: 'Charlie Brown', status: 'Confirmed', costInCoins: 0, reminderDate: new Date().toISOString() },
    { id: 'appt6', tenantId: 'Brainqy', requesterUserId: 'alumni1', alumniUserId: 'alumni4', title: 'Cybersecurity Career Chat', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(), withUser: 'Diana Prince', status: 'Confirmed', costInCoins: 12, reminderDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString() },
];

export const sampleWalletBalance: Wallet = {
    tenantId: sampleUserProfile.tenantId, 
    userId: sampleUserProfile.id, 
    coins: sampleUserProfile.role === 'manager' ? 500 : (sampleUserProfile.role === 'admin' ? 1000 : 150), 
    transactions: [
        { id: 'txn1', tenantId: sampleUserProfile.tenantId, userId: sampleUserProfile.id, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: 'Reward for profile completion', amount: 50, type: 'credit' },
        { id: 'txn2', tenantId: sampleUserProfile.tenantId, userId: sampleUserProfile.id, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), description: 'Used for premium report', amount: -20, type: 'debit' },
        { id: 'txn3', tenantId: sampleUserProfile.tenantId, userId: sampleUserProfile.id, date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: 'Appointment booking fee (Bob B.)', amount: -10, type: 'debit' },
        { id: 'txn4', tenantId: sampleUserProfile.tenantId, userId: sampleUserProfile.id, date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), description: 'Daily login bonus', amount: 5, type: 'credit' },
    ]
};

export let sampleResumeProfiles: ResumeProfile[] = [
  { id: 'resume1', tenantId: 'Brainqy', userId: 'alumni1', name: "Software Engineer Focused (Alice)", resumeText: samplePlatformUsers.find(u => u.id === 'alumni1')?.resumeText || "Alice Wonderland's resume focused on software engineering roles...", lastAnalyzed: "2024-07-15" },
  { id: 'resume2', tenantId: 'Brainqy', userId: 'alumni2', name: "Product Manager Application (Bob)", resumeText: "Bob The Builder's resume tailored for product management positions...", lastAnalyzed: "2024-07-10" },
  { id: 'resume3', tenantId: 'tenant-2', userId: 'alumni3', name: "Data Science General (Charlie)", resumeText: "Charlie Brown's general purpose resume for various data roles.", lastAnalyzed: "2024-06-20" },
  { id: 'resumeManager1', tenantId: 'tenant-2', userId: 'managerUser1', name: "Engagement Strategy Lead Resume (Mike)", resumeText: samplePlatformUsers.find(u => u.id === 'managerUser1')?.resumeText || "Resume for Manager Mike, focused on engagement and leadership.", lastAnalyzed: "2024-07-20" },
];

export const SAMPLE_DATA_BASE_DATE = new Date('2025-06-01T12:00:00Z');

const placeholderResumeText = `[Your Name]
[Your Contact Info]

Summary:
Experienced professional seeking a challenging role.

Experience:
Company A - Role 1 (2020-2022)
- Did task X
- Accomplished Y

Education:
University Z - Degree (2016-2020)
`;

const placeholderJobDescription = `Title: Sample Job
Company: Sample Corp
Location: Remote

Responsibilities:
- Do X
- Manage Y
- Achieve Z

Qualifications:
- Skill A
- Skill B
`;


export const sampleResumeScanHistory: ResumeScanHistoryItem[] = [
  {
    id: 'scan1',
    tenantId: 'Brainqy',
    userId: 'alumni1',
    resumeId: 'resume1',
    resumeName: 'Software_Engineer_Resume_v2.pdf',
    jobTitle: `Senior Software Engineer`,
    companyName: 'Innovate LLC',
    resumeTextSnapshot: placeholderResumeText.replace("professional", "software engineer for Innovate LLC"),
    jobDescriptionText: `Title: Senior Software Engineer\nCompany: Innovate LLC\n${placeholderJobDescription}`,
    scanDate: new Date(SAMPLE_DATA_BASE_DATE.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), 
    matchScore: 85,
    bookmarked: true, 
  },
  {
    id: 'scan2',
    tenantId: 'Brainqy',
    userId: 'alumni2',
    resumeId: 'resume2',
    resumeName: 'Product_Manager_Profile.docx',
    jobTitle: `Product Lead`,
    companyName: 'FutureTech Corp',
    resumeTextSnapshot: placeholderResumeText.replace("professional", "product manager for FutureTech"),
    jobDescriptionText: `Title: Product Lead\nCompany: FutureTech Corp\n${placeholderJobDescription}`,
    scanDate: new Date(SAMPLE_DATA_BASE_DATE.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(), 
    matchScore: 72,
    bookmarked: false,
  },
  {
    id: 'scan3',
    tenantId: 'tenant-2',
    userId: 'alumni3',
    resumeId: 'resume3',
    resumeName: 'General_Data_Resume.pdf',
    jobTitle: `Data Analyst`,
    companyName: 'Data Corp',
    resumeTextSnapshot: placeholderResumeText.replace("professional", "data analyst for Data Corp"),
    jobDescriptionText: `Title: Data Analyst\nCompany: Data Corp\n${placeholderJobDescription}`,
    scanDate: new Date(SAMPLE_DATA_BASE_DATE.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(), 
    matchScore: 91,
    bookmarked: false,
  },
   {
    id: 'scan4',
    tenantId: 'tenant-2', 
    userId: 'managerUser1',
    resumeId: 'resumeManager1',
    resumeName: 'CorpStrategyResume.pdf',
    jobTitle: `Strategy Consultant`,
    companyName: 'McKinsey',
    resumeTextSnapshot: samplePlatformUsers.find(u => u.id === 'managerUser1')?.resumeText || "Strategic resume content for McKinsey...",
    jobDescriptionText: `Title: Strategy Consultant\nCompany: McKinsey\n${placeholderJobDescription}`,
    scanDate: new Date(SAMPLE_DATA_BASE_DATE.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    matchScore: 88,
    bookmarked: false,
  },
];

export const graduationYears = Array.from({ length: 56 }, (_, i) => (new Date().getFullYear() + 5 - i).toString());


export const sampleTenants: Tenant[] = [
  {
    id: 'Brainqy', 
    name: 'Brainqy University', 
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), 
    domain: 'brainqy.resumematch.ai',
    settings: {
      allowPublicSignup: true,
      customLogoUrl: 'https://placehold.co/200x50/008080/FFFFFF&text=Brainqy+U', 
      primaryColor: 'hsl(180 100% 25%)', 
      accentColor: 'hsl(180 100% 30%)', 
      features: {
        communityFeedEnabled: true,
        jobBoardEnabled: true,
        gamificationEnabled: true,
        walletEnabled: true,
        eventRegistrationEnabled: true,
      },
      emailTemplates: {
        welcomeEmail: 'Welcome to Brainqy University Alumni Network!',
      }
    }
  },
  {
    id: 'tenant-2',
    name: 'Corporate Partner Inc.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    domain: 'cpp.resumematch.ai',
    settings: {
      allowPublicSignup: false,
      primaryColor: 'hsl(221 83% 53%)', 
      accentColor: 'hsl(221 83% 63%)',  
      customLogoUrl: 'https://placehold.co/200x50/2C5282/FFFFFF&text=CorpPartner', 
      features: {
        communityFeedEnabled: false,
        jobBoardEnabled: true,
        gamificationEnabled: false,
        walletEnabled: false,
        eventRegistrationEnabled: true,
      }
    }
  },
  {
    id: 'tenant-3',
    name: 'Community College Connect',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    domain: 'ccc.resumematch.ai',
    settings: {
      allowPublicSignup: true,
      primaryColor: 'hsl(39 100% 50%)', 
      accentColor: 'hsl(39 100% 55%)',  
      customLogoUrl: 'https://placehold.co/200x50/FFBF00/000000&text=CCC', 
      features: {
        communityFeedEnabled: true,
        jobBoardEnabled: true,
        gamificationEnabled: true,
        walletEnabled: true,
        eventRegistrationEnabled: false,
      }
    }
  },
];

export const sampleBadges: Badge[] = [
    { id: 'profile-pro', name: 'Profile Pro', description: 'Completed 100% of your profile.', icon: 'UserCheck', xpReward: 100, triggerCondition: 'Profile completion reaches 100%' },
    { id: 'early-adopter', name: 'Early Adopter', description: 'Joined within the first month of launch.', icon: 'Award', xpReward: 50, triggerCondition: 'User signup date within launch window' },
    { id: 'networker', name: 'Networker', description: 'Made 10+ alumni connections.', icon: 'Users', xpReward: 75, triggerCondition: 'Number of connections > 10' },
    { id: 'analyzer-ace', name: 'Analyzer Ace', description: 'Analyzed 5+ resumes.', icon: 'Zap', xpReward: 50, triggerCondition: 'Resume scan count > 5' },
    { id: 'contributor', name: 'Contributor', description: 'Posted 5+ times in the community feed.', icon: 'MessageSquare', xpReward: 30, triggerCondition: 'Community post count > 5' },
    { id: 'admin-master', name: 'Admin Master', description: 'Successfully managed platform settings.', icon: 'ShieldCheck', xpReward: 0, triggerCondition: 'User role is Admin' }, 
    { id: 'platform-architect', name: 'Platform Architect', description: 'Made significant contributions to platform architecture.', icon: 'GitFork', xpReward: 200, triggerCondition: 'Admin assigned for specific contributions' }
];

export let sampleBlogPosts: BlogPost[] = [ 
  {
    id: 'blog1',
    tenantId: 'platform', 
    userId: 'system',
    userName: 'ResumeMatch AI Team',
    userAvatar: 'https://picsum.photos/seed/systemlogo/50/50',
    title: 'Mastering the AI Resume Analysis',
    slug: 'mastering-ai-resume-analysis',
    author: 'ResumeMatch AI Team',
    date: '2024-07-20T10:00:00Z',
    imageUrl: 'https://placehold.co/800x400.png?text=AI+Resume+Analysis', 
    content: 'Learn how to leverage our AI analysis tool to its full potential. Understand match scores, keyword analysis, and how to use suggestions effectively...\n\nOur AI engine scans your resume against the provided job description, identifying key skills, experiences, and keywords. It then calculates a match score based on alignment.\n\n**Understanding the Score:**\n- **80%+:** Excellent match, likely a strong candidate.\n- **60-79%:** Good match, minor adjustments might be needed.\n- **Below 60%:** Significant gaps, consider tailoring your resume.\n\n**Using Suggestions:**\nThe AI provides suggestions for improvement. Focus on incorporating missing keywords naturally and highlighting relevant experiences mentioned in the job description. Remember, authenticity is key!\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Learn how to leverage our AI analysis tool to its full potential. Understand match scores, keyword analysis...',
    tags: ['resume', 'ai', 'jobsearch'],
    comments: [],
  },
  {
    id: 'blog2',
    tenantId: 'Brainqy', 
    userId: 'alumni1', 
    userName: 'Alice Wonderland',
    userAvatar: 'https://picsum.photos/seed/alice/50/50',
    title: 'Networking Success Stories from Brainqy University Alumni',
    slug: 'brainqy-uni-networking-success', 
    author: 'Alumni Relations (Brainqy University)', 
    date: '2024-07-15T14:30:00Z',
    imageUrl: 'https://placehold.co/800x400.png?text=Networking+Success', 
    content: 'Hear inspiring stories from fellow alumni who found opportunities through the ResumeMatch AI network. Discover tips for effective networking...\n\nAlice Wonderland (Class of \'15) shares how a connection made through the platform led to her current role at Google. "The recommendation feature pointed me towards someone I hadn\'t considered, and it turned out to be the perfect connection," she says.\n\nBob The Builder (Class of \'18) used the Alumni Directory filters to find mentors in Product Management. "Being able to filter by skills and industry was invaluable," Bob notes.\n\n**Networking Tips:**\n1. Personalize your connection requests.\n2. Be clear about what you\'re seeking (advice, referral, chat).\n3. Follow up respectfully.\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Hear inspiring stories from fellow alumni who found opportunities through the ResumeMatch AI network...',
    tags: ['networking', 'career', 'success stories', 'brainqy university'], 
    comments: [],
  },
  {
    id: 'blog3',
    tenantId: 'platform',
    userId: 'system',
    userName: 'ResumeMatch AI Team',
    userAvatar: 'https://picsum.photos/seed/systemlogo/50/50',
    title: 'The Power of Mentorship: Connecting Generations',
    slug: 'power-of-mentorship',
    author: 'ResumeMatch AI Team',
    date: '2024-07-10T09:00:00Z',
    imageUrl: 'https://placehold.co/800x400.png?text=Mentorship+Concept', 
    content: 'Explore the benefits of both being a mentor and finding a mentor within our community. How our platform facilitates these connections...\n\nMentorship provides invaluable guidance for career growth. Our platform makes it easy to identify alumni willing to offer support in specific areas.\n\n**Benefits for Mentees:**\n- Gain industry insights.\n- Receive personalized career advice.\n- Expand your professional network.\n\n**Benefits for Mentors:**\n- Develop leadership skills.\n- Give back to the community.\n- Stay connected with emerging talent.\n\nUse the Alumni Directory filters to find potential mentors or mentees based on your interests and needs.\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Explore the benefits of both being a mentor and finding a mentor within our community...',
    tags: ['mentorship', 'community', 'connections'],
    comments: [],
  },
];

export const sampleReferralHistory: ReferralHistoryItem[] = [
  { id: 'ref1', referrerUserId: 'alumni1', referredEmailOrName: 'friend1@example.com', referralDate: new Date(Date.now() - 86400000 * 7).toISOString(), status: 'Signed Up' },
  { id: 'ref2', referrerUserId: 'alumni1', referredEmailOrName: 'colleague@example.com', referralDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Reward Earned', rewardAmount: 25 },
  { id: 'ref3', referrerUserId: 'alumni2', referredEmailOrName: 'contact@example.com', referralDate: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Pending' },
  { id: 'ref4', referrerUserId: 'alumni2', referredEmailOrName: 'another@example.com', referralDate: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'Expired' },
  { id: 'ref5', referrerUserId: 'managerUser1', referredEmailOrName: 'newcorpcontact@example.com', referralDate: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'Signed Up' },
];

export const sampleXpRules: GamificationRule[] = [
    { actionId: 'profile_complete_50', description: 'Reach 50% Profile Completion', xpPoints: 25 },
    { actionId: 'profile_complete_100', description: 'Reach 100% Profile Completion', xpPoints: 100 },
    { actionId: 'resume_scan', description: 'Analyze a Resume', xpPoints: 20 },
    { actionId: 'book_appointment', description: 'Book an Appointment', xpPoints: 30 },
    { actionId: 'community_post', description: 'Create a Community Post', xpPoints: 15 },
    { actionId: 'community_comment', description: 'Comment on a Post', xpPoints: 5 },
    { actionId: 'successful_referral', description: 'Successful Referral Signup', xpPoints: 50 },
    { actionId: 'daily_login', description: 'Daily Login', xpPoints: 10 },
];

export const sampleSurveyResponses: SurveyResponse[] = [
    {
        id: 'resp1',
        userId: 'alumni1', 
        userName: 'Alice Wonderland',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 1).toISOString(),
        data: {
            experience: 'amazing',
            loved_feature: 'Resume Analyzer accuracy',
            referral_likelihood: 'very_likely'
        }
    },
    {
        id: 'resp2',
        userId: 'alumni2', 
        userName: 'Bob The Builder',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        data: {
            experience: 'okay',
            improvement_suggestion: 'More filter options in Alumni Connect',
            referral_likelihood: 'likely'
        }
    },
    {
        id: 'resp3',
        userId: 'alumni3', 
        userName: 'Charlie Brown',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback', 
        responseDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        data: {
            experience: 'needs_improvement',
            frustration_details: 'The job board sometimes loads slowly.',
            referral_likelihood: 'neutral'
        }
    },
    {
        id: 'resp_pc_alice',
        userId: 'alumni1',
        userName: 'Alice Wonderland',
        surveyId: 'profileCompletionSurvey',
        surveyName: 'Profile Completion Survey',
        responseDate: new Date(Date.now() - 86400000 * 4).toISOString(),
        data: {
            fullName: 'Alice Wonderland',
            dateOfBirth: '1993-03-15',
            gender: 'Female',
            email: 'alice.wonderland@example.com',
            mobileNumber: '+15551112222',
            currentAddress: '123 Main St, Anytown, CA, USA',
            graduationYear: '2015',
            degreeProgram: 'Master of Science (M.Sc)',
            department: 'Computer Science',
            currentJobTitle: 'Senior Software Engineer',
            currentOrganization: 'Google',
            industry: 'IT/Software',
            workLocation: 'Mountain View, CA',
            linkedInProfile: 'https://linkedin.com/in/alicewonder',
            yearsOfExperience: '7',
            skills: 'Java, Python, Machine Learning, Cloud Computing, Algorithms, React, Next.js',
            areasOfSupport: 'Mentoring Students, Sharing Job Referrals, Guest Lecturing',
            timeCommitment: '1-2 hours',
            preferredEngagementMode: 'Online',
            shareProfileConsent: 'true',
            featureInSpotlightConsent: 'true'
        }
    }
];

export const sampleAffiliates: Affiliate[] = [
  {
    id: 'affiliateuser1', 
    userId: 'alumni1', 
    name: 'Alice Wonderland',
    email: 'alice.wonderland@example.com',
    status: 'approved' as AffiliateStatus,
    affiliateCode: 'ALICEAFF1', 
    commissionRate: 0.15, 
    totalEarned: 75.00,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'affiliateuser2', 
    userId: 'alumni2', 
    name: 'Bob The Builder',
    email: 'bob.builder@example.com',
    status: 'pending' as AffiliateStatus,
    affiliateCode: 'BOBAFF2',
    commissionRate: 0.12,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
   {
    id: 'affiliateuser3', 
    userId: 'alumni3', 
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    status: 'rejected' as AffiliateStatus,
    affiliateCode: 'CHARLIEAFF3',
    commissionRate: 0.10,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'affiliateuser4', 
    userId: 'managerUser1', 
    name: 'Manager Mike', 
    email: 'manager.mike@tenant2.com', 
    status: 'approved' as AffiliateStatus,
    affiliateCode: 'MIKEAFF4', 
    commissionRate: 0.20, 
    totalEarned: 125.50,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

export const sampleAffiliateClicks: AffiliateClick[] = [
  { id: 'click1', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), convertedToSignup: true },
  { id: 'click2', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false },
  { id: 'click3', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), convertedToSignup: true }, 
  { id: 'click4', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 0.5 * 86400000).toISOString(), convertedToSignup: false },
  { id: 'click5', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), convertedToSignup: false }, 
  { id: 'click6', affiliateId: 'affiliateuser2', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false }, 
];

export const sampleAffiliateSignups: AffiliateSignup[] = [
  { id: 'signup1', affiliateId: 'affiliateuser4', newUserId: 'newUserFromMike1', signupDate: new Date(Date.now() - 86400000 * 2).toISOString(), commissionEarned: 7.50 },
  { id: 'signup2', affiliateId: 'affiliateuser1', newUserId: 'newUserFromAlice1', signupDate: new Date(Date.now() - 86400000 * 3).toISOString(), commissionEarned: 5.00 }, 
  { id: 'signup3', affiliateId: 'affiliateuser4', newUserId: 'newUserFromMike2', signupDate: new Date(Date.now() - 86400000 * 1).toISOString(), commissionEarned: 10.00 }, 
  { id: 'signup4', affiliateId: 'affiliateuser1', newUserId: 'newUserFromAlice2', signupDate: new Date(Date.now() - 86400000 * 5).toISOString(), commissionEarned: 5.00 }, 
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

export const sampleResumeTemplates: ResumeTemplate[] = [
  {
    id: 'template1',
    name: 'Modern Chronological',
    description: 'A clean, modern take on the classic chronological resume. Great for experienced professionals.',
    previewImageUrl: 'https://placehold.co/300x400.png?text=Modern+Chrono',
    category: 'Modern',
    dataAiHint: 'resume modern',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn Profile URL] | [Your Portfolio URL (Optional)]

Summary
---
[Briefly summarize your career objectives and key qualifications. Tailor this to the job you're applying for.]

Experience
---
[Job Title] | [Company Name] | [City, State] | [Dates of Employment (e.g., Month YYYY – Month YYYY)]
- [Responsibility or accomplishment 1 - Use action verbs]
- [Responsibility or accomplishment 2]
- [Responsibility or accomplishment 3]

[Previous Job Title] | [Previous Company Name] | [City, State] | [Dates of Employment]
- [Responsibility or accomplishment 1]
- [Responsibility or accomplishment 2]

Education
---
[Degree Name] | [Major/Minor] | [University Name] | [City, State] | [Graduation Year]
- [Relevant coursework, honors, or activities (Optional)]

Skills
---
Technical Skills: [List hard skills, e.g., Python, JavaScript, SQL, Microsoft Excel, Adobe Creative Suite]
Soft Skills: [List soft skills, e.g., Communication, Teamwork, Problem-solving, Leadership]
Languages: [List languages and proficiency levels]

Projects (Optional)
---
[Project Name] | [Link to Project (Optional)]
- [Brief description of the project and your role/contributions]
- [Technologies used]

Certifications (Optional)
---
[Certification Name] | [Issuing Organization] | [Date Issued]`
  },
  {
    id: 'template2',
    name: 'Creative Combination',
    description: 'Highlights skills and projects. Ideal for creative fields or career changers.',
    previewImageUrl: 'https://placehold.co/300x400.png?text=Creative+Combo',
    category: 'Creative',
    dataAiHint: 'resume creative',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn Profile URL] | [Your Portfolio URL]

Skills Summary
---
- [Skill 1 with brief example of application]
- [Skill 2 with brief example of application]
- [Skill 3 with brief example of application]
- Technical Proficiencies: [List software, tools, languages]

Projects
---
[Project Name 1] | [Your Role] | [Dates]
- [Description of project and impact. Highlight skills used.]
- [Link to project if available]

[Project Name 2] | [Your Role] | [Dates]
- [Description of project and impact. Highlight skills used.]

Experience
---
[Job Title] | [Company Name] | [City, State] | [Dates of Employment]
- [Key achievement or responsibility 1]
- [Key achievement or responsibility 2]

Education
---
[Degree Name] | [University Name] | [Graduation Year]
- [Relevant coursework or honors]

Awards & Recognition (Optional)
---
- [Award/Recognition 1]
- [Award/Recognition 2]`
  },
  {
    id: 'template3',
    name: 'Functional Skills-Based',
    description: 'Emphasizes skills over work history. Good for those with employment gaps or students.',
    previewImageUrl: 'https://placehold.co/300x400.png?text=Functional+Skills',
    category: 'Functional',
    dataAiHint: 'resume skills',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn Profile URL]

Professional Profile
---
[A concise statement highlighting your key skills and career focus.]

Core Competencies
---
[Skill Category 1 - e.g., Project Management]
- [Demonstrable achievement or experience related to this skill]
- [Another achievement or experience]

[Skill Category 2 - e.g., Communication]
- [Demonstrable achievement or experience]
- [Another achievement or experience]

[Skill Category 3 - e.g., Technical Proficiency]
- [List specific technical skills or software]

Work History
---
[Company Name 1] | [Job Title(s)] | [Dates of Employment (brief)]
[Company Name 2] | [Job Title(s)] | [Dates of Employment (brief)]
(Focus is on skills above, so work history can be more concise)

Education
---
[Degree Name] | [University Name] | [Graduation Year]
- [Relevant academic achievements or projects]

Volunteer Experience (Optional)
---
[Organization Name] | [Role] | [Dates]
- [Brief description of responsibilities and skills utilized]`
  },
  {
    id: 'template4',
    name: 'Academic CV',
    description: 'Designed for academic positions, research roles, and grants. Includes publication sections.',
    previewImageUrl: 'https://placehold.co/300x400.png?text=Academic+CV',
    category: 'Academic',
    dataAiHint: 'cv academic',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn/ResearchGate Profile URL]

Education
---
[Degree (e.g., Ph.D. in Subject)] | [University Name] | [City, State] | [Year of Completion/Expected]
Dissertation: "[Dissertation Title]" (Advisor: [Advisor's Name])

[Master's Degree] | [University Name] | [City, State] | [Year]
Thesis: "[Thesis Title]" (Optional)

[Bachelor's Degree] | [University Name] | [City, State] | [Year]

Research Experience
---
[Position, e.g., Postdoctoral Fellow] | [Lab/Department] | [University Name] | [Dates]
- [Description of research projects, methodologies, and findings.]
- [Key contributions and skills developed.]

[Position, e.g., Research Assistant] | [Lab/Department] | [University Name] | [Dates]
- [Description of research support and activities.]

Teaching Experience
---
[Position, e.g., Teaching Assistant] | [Course Name] | [Department] | [University Name] | [Semesters/Years]
- [Responsibilities, e.g., led discussion sections, graded assignments.]

[Position, e.g., Guest Lecturer] | [Topic] | [Course Name] | [University Name] | [Date]

Publications
---
(Use a consistent citation style, e.g., APA, MLA. List in reverse chronological order.)
Peer-Reviewed Articles:
1. [Author(s)]. ([Year]). [Article Title]. [Journal Name], [Volume](Issue), [Pages].
Book Chapters:
1. [Author(s)]. ([Year]). [Chapter Title]. In [Editor(s) (Eds.)], [Book Title] (pp. [Pages]). [Publisher].

Conference Presentations
---
1. [Author(s)]. ([Year, Month]). [Presentation Title]. Paper presented at the [Conference Name], [Location].

Grants and Awards
---
- [Grant/Award Name] | [Funding Body/Institution] | [Year]
- [Fellowship Name] | [Institution] | [Year]

Skills
---
Research Skills: [e.g., Statistical Analysis (SPSS, R), Qualitative Methods, Experimental Design]
Technical Skills: [e.g., Python, MATLAB, Lab Equipment]
Languages: [Language (Proficiency Level)]

References
---
Available upon request.`
  },
];

export const userDashboardTourSteps: TourStep[] = [
  { title: "Welcome to Your Dashboard!", description: "This is your central hub for managing your career journey with ResumeMatch AI." },
  { title: "Resume Analysis", description: "Use our AI tools to analyze your resume against job descriptions and get improvement suggestions." },
  { title: "Job Tracker", description: "Keep track of all your job applications in one place with our Kanban-style board." },
  { title: "Alumni Network", description: "Connect with fellow alumni, find mentors, and expand your professional network." },
  { title: "Rewards & Progress", description: "Earn XP and badges for your activity on the platform. Check your progress here!" }
];

export const adminDashboardTourSteps: TourStep[] = [
  { title: "Admin Dashboard Overview", description: "Welcome, Admin! Manage users, tenants, and platform-wide settings from here." },
  { title: "User Management", description: "View, edit, and manage all user accounts across different tenants." },
  { title: "Tenant Management", description: "Oversee and configure settings for individual tenants on the platform." },
  { title: "Gamification Rules", description: "Define and manage XP point rules and badges awarded for user actions." },
  { title: "Content Moderation", description: "Review and manage flagged content from the community feed to maintain a positive environment." }
];

export const managerDashboardTourSteps: TourStep[] = [
  { title: "Manager Dashboard Insights", description: "Hello Manager! Monitor your tenant's engagement, manage specific features, and track key metrics." },
  { title: "Tenant User Activity", description: "View statistics on active users and feature usage within your tenant." },
  { title: "Content Management", description: "Access tools to moderate community content and manage event submissions for your tenant." },
  { title: "Engagement Tools", description: "Utilize features to foster engagement within your tenant's alumni network." }
];


export let sampleInterviewQuestions: InterviewQuestion[] = [
  {
    id: 'iq1',
    category: 'Behavioral',
    questionText: "Tell me about a time you failed.",
    // baseScore intentionally removed to test default assignment in live interview mapping
    isMCQ: true,
    mcqOptions: [
      "I've never truly failed; I see everything as a learning opportunity.",
      "I prefer not to discuss failures as they are negative.",
      "I once missed a critical deadline on Project X due to poor planning. I took responsibility, communicated proactively, and implemented a new system to prevent recurrence, successfully meeting subsequent deadlines.",
      "My previous manager was always setting unrealistic goals, so failures were common in that team."
    ],
    correctAnswer: "I once missed a critical deadline on Project X due to poor planning. I took responsibility, communicated proactively, and implemented a new system to prevent recurrence, successfully meeting subsequent deadlines.",
    answerOrTip: "The best approach is to use the STAR method (Situation, Task, Action, Result) and focus on what you learned and how you improved.",
    tags: ['failure', 'learning'],
    difficulty: 'Medium',
    rating: 4.2, 
    ratingsCount: 15,
    userComments: [
        { id: 'uc1-1', userId: 'alumni2', userName: 'Bob The Builder', comment: 'Good standard question. The tip is helpful!', timestamp: new Date(Date.now() - 86400000 * 1).toISOString()},
        { id: 'uc1-2', userId: 'alumni3', userName: 'Charlie Brown', comment: 'Could use a more complex failure example in options.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString()}
    ],
    createdBy: "system",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    bookmarkedBy: ['managerUser1'],
  },
  {
    id: 'iq2',
    category: 'Behavioral',
    questionText: "Describe a situation where you had to work with a difficult team member.",
    baseScore: 15,
    isMCQ: true,
    mcqOptions: [
      "I avoided them as much as possible and did my work independently.",
      "I confronted them publicly about their behavior to resolve it quickly.",
      "I initiated a private conversation to understand their perspective, found common ground, and established clear communication protocols, which improved our collaboration.",
      "I reported them to my manager immediately without trying to resolve it myself."
    ],
    correctAnswer: "I initiated a private conversation to understand their perspective, found common ground, and established clear communication protocols, which improved our collaboration.",
    answerOrTip: "Focus on professional and constructive approaches. Highlight your communication, empathy, and problem-solving skills.",
    tags: ['teamwork', 'conflict'],
    difficulty: 'Medium',
    rating: 4.8,
    ratingsCount: 22,
    userComments: [],
    createdBy: "system",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    bookmarkedBy: [],
  },
  {
    id: 'iq3',
    category: 'Technical',
    questionText: "Explain the difference between an abstract class and an interface.",
    baseScore: 10,
    isMCQ: true,
    mcqOptions: [
      "Abstract classes can have constructors, interfaces cannot.",
      "A class can implement multiple abstract classes but only inherit from one interface.",
      "Interfaces can contain implemented methods, abstract classes cannot.",
      "Both are primarily used for achieving 100% abstraction."
    ],
    correctAnswer: "Abstract classes can have constructors, interfaces cannot.",
    answerOrTip: "Key differences: Abstract classes can have constructors and member variable implementations; interfaces cannot (traditionally). A class can implement multiple interfaces but inherit only one class (or abstract class).",
    tags: ['oop', 'programming', 'java'],
    difficulty: 'Medium',
    rating: 4.0,
    ratingsCount: 10,
    userComments: [{id: 'uc3-1', userId: 'alumni1', userName: 'Alice Wonderland', comment: 'The options are a bit tricky, good test!', timestamp: new Date().toISOString()}],
    createdBy: "managerUser1",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    bookmarkedBy: ['managerUser1'],
  },
  {
    id: 'iq4',
    category: 'Role-Specific',
    questionText: "How would you approach designing a new feature for our product? (For Product Managers)",
    baseScore: 20,
    isMCQ: true,
    mcqOptions: [
      "Start coding immediately based on my gut feeling for what users want.",
      "Conduct user research, define clear requirements, prioritize based on impact/effort, work with design/dev, and define success metrics.",
      "Ask the engineering team to build whatever they think is cool and technically feasible.",
      "Copy a similar feature from a competitor's product directly."
    ],
    correctAnswer: "Conduct user research, define clear requirements, prioritize based on impact/effort, work with design/dev, and define success metrics.",
    answerOrTip: "A good answer outlines a structured product development process: research, definition, prioritization, execution, and measurement.",
    tags: ['product management', 'design'],
    difficulty: 'Hard',
    rating: 4.5,
    ratingsCount: 18,
    userComments: [],
    createdBy: "managerUser1",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    bookmarkedBy: [],
  },
  {
    id: 'iq5',
    category: 'Common',
    questionText: "Why are you interested in this role?",
    baseScore: 5,
    isMCQ: true,
    mcqOptions: [
      "I need a job, and this one was available.",
      "The salary and benefits are attractive.",
      "This role aligns perfectly with my skills in X and Y, and I'm excited about [Company Mission/Product] because [Specific Reason]. I believe I can contribute Z.",
      "My friend works here and said it's a good place to work."
    ],
    correctAnswer: "This role aligns perfectly with my skills in X and Y, and I'm excited about [Company Mission/Product] because [Specific Reason]. I believe I can contribute Z.",
    answerOrTip: "Connect your skills, experience, and career goals to the specific requirements of the role and the company's mission. Show genuine enthusiasm.",
    tags: ['motivation', 'fit'],
    difficulty: 'Easy',
    rating: 3.9,
    ratingsCount: 30,
    userComments: [],
    createdBy: "system",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    bookmarkedBy: ['managerUser1'],
  },
  {
    id: 'iq6',
    category: 'Common',
    questionText: "Where do you see yourself in 5 years?",
    baseScore: 5,
    isMCQ: true,
    mcqOptions: [
      "Running this company.",
      "I haven't thought that far ahead.",
      "I see myself growing within a role like this, taking on more responsibility, developing expertise in [Relevant Area], and contributing to significant projects for the company.",
      "Probably at a different company in a higher position."
    ],
    correctAnswer: "I see myself growing within a role like this, taking on more responsibility, developing expertise in [Relevant Area], and contributing to significant projects for the company.",
    answerOrTip: "Show ambition for growth that aligns with the company's potential opportunities. Express interest in developing skills and taking on more responsibility.",
    tags: ['career goals'],
    difficulty: 'Easy',
    rating: 3.5,
    ratingsCount: 12,
    userComments: [],
    createdBy: "system",
    approved: false, 
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    bookmarkedBy: [],
  },
  {
    id: 'iq7',
    category: 'Technical',
    questionText: "Explain the principles of RESTful API design.",
    baseScore: 15,
    isMCQ: true,
    mcqOptions: [
      "Stateful, Client-Server, Uniform Interface, Cacheable.",
      "Stateless, Client-Server, Uniform Interface, Cacheable, Layered System.",
      "Monolithic architecture, Tight Coupling, RPC-style calls.",
      "Always use XML for data exchange and SOAP protocols."
    ],
    correctAnswer: "Stateless, Client-Server, Uniform Interface, Cacheable, Layered System.",
    answerOrTip: "Key principles: Client-Server, Stateless, Cacheable, Uniform Interface (resource identification, manipulation through representations, self-descriptive messages, HATEOAS), Layered System, Code on Demand (optional).",
    tags: ['api', 'backend'],
    difficulty: 'Hard',
    rating: 4.7,
    ratingsCount: 9,
    userComments: [],
    createdBy: "managerUser1",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    bookmarkedBy: [],
  },
  {
    id: 'iq8',
    category: 'Behavioral',
    questionText: "Give an example of a goal you reached and tell me how you achieved it.",
    baseScore: 10,
    isMCQ: true,
    mcqOptions: [
      "I wanted to get a promotion, so I worked hard.",
      "My goal was to improve team efficiency by 15%. I identified bottlenecks in our workflow, proposed a new process using [Tool/Method], trained the team, and we achieved a 20% efficiency gain in 3 months.",
      "I set a personal goal to read more books, but I didn't really track it.",
      "We had a team goal, but someone else mostly did the work."
    ],
    correctAnswer: "My goal was to improve team efficiency by 15%. I identified bottlenecks in our workflow, proposed a new process using [Tool/Method], trained the team, and we achieved a 20% efficiency gain in 3 months.",
    answerOrTip: "Use the STAR method. Be specific about the goal, your actions, and the quantifiable result or impact.",
    tags: ['achievement', 'goals'],
    difficulty: 'Medium',
    rating: 4.1,
    ratingsCount: 17,
    userComments: [],
    createdBy: "system",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    bookmarkedBy: ['alumni2'],
  },
  {
    id: 'mcq1',
    category: 'Technical',
    questionText: "Which of the following is NOT a valid HTTP method?",
    baseScore: 5,
    isMCQ: true,
    mcqOptions: ["GET", "POST", "PUSH", "DELETE"],
    correctAnswer: "PUSH",
    answerOrTip: "PUSH is not a standard HTTP method. Common methods include GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS.",
    tags: ['http', 'api', 'mcq'],
    difficulty: 'Easy',
    rating: 3.8,
    ratingsCount: 25,
    userComments: [],
    createdBy: "system",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    bookmarkedBy: [],
  },
  {
    id: 'mcq2',
    category: 'Analytical',
    questionText: "A project's critical path is delayed by 2 days. What is the most likely impact on the project completion date?",
    baseScore: 10,
    isMCQ: true,
    mcqOptions: ["No impact", "Completion delayed by 1 day", "Completion delayed by 2 days", "Completion delayed by more than 2 days"],
    correctAnswer: "Completion delayed by 2 days",
    answerOrTip: "A delay on the critical path directly translates to a delay in the project completion date by the same amount, assuming no other changes.",
    tags: ['project management', 'analytical', 'mcq'],
    difficulty: 'Medium',
    rating: 4.3,
    ratingsCount: 13,
    userComments: [],
    createdBy: "managerUser1",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    bookmarkedBy: ['managerUser1'],
  },
  {
    id: 'hr1',
    category: 'HR',
    questionText: "How do you handle stress and pressure?",
    baseScore: 10,
    isMCQ: true,
    mcqOptions: [
        "I avoid stressful situations as much as possible.",
        "I tend to get overwhelmed but eventually get through it.",
        "I prioritize tasks, break them into manageable steps, focus on what I can control, and take short breaks to stay effective. For example, during Project Y's tight deadline...",
        "I don't really experience stress; I thrive under pressure."
    ],
    correctAnswer: "I prioritize tasks, break them into manageable steps, focus on what I can control, and take short breaks to stay effective. For example, during Project Y's tight deadline...",
    answerOrTip: "Describe specific strategies you use (e.g., prioritization, time management, mindfulness, seeking support). Give a brief example if possible.",
    tags: ['stress management', 'soft skills'],
    difficulty: 'Medium',
    rating: 4.0,
    ratingsCount: 19,
    userComments: [],
    createdBy: "system",
    approved: true,
    createdAt: new Date().toISOString(),
    bookmarkedBy: [],
  },
  {
    id: 'coding1',
    category: 'Coding',
    questionText: "Write a function to reverse a string in JavaScript.",
    baseScore: 5,
    isMCQ: true,
    mcqOptions: [
        "str.split('').reverse().join('')",
        "for (let i = 0; i < str.length; i++) newStr += str[str.length - 1 - i];",
        "str.reverse()",
        "Array.from(str).sort().join('')"
    ],
    correctAnswer: "str.split('').reverse().join('')",
    answerOrTip: "Common solutions include `str.split('').reverse().join('')` or a loop. Discuss time/space complexity (O(n) for both in most JS engines).",
    tags: ['javascript', 'string manipulation', 'algorithms'],
    difficulty: 'Easy',
    rating: 3.7,
    ratingsCount: 28,
    userComments: [],
    createdBy: "system",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    bookmarkedBy: [],
  },
  {
    id: 'coding2',
    category: 'Coding',
    questionText: "Explain Big O notation and provide an example of O(n) and O(log n).",
    baseScore: 20,
    isMCQ: true,
    mcqOptions: [
        "It measures exact execution time. O(n) is fast, O(log n) is slow.",
        "It describes the worst-case time or space complexity as input size grows. O(n): linear search. O(log n): binary search.",
        "It's only used for sorting algorithms. O(n) example: bubble sort. O(log n) example: merge sort.",
        "Big O is about optimizing code for specific hardware."
    ],
    correctAnswer: "It describes the worst-case time or space complexity as input size grows. O(n): linear search. O(log n): binary search.",
    answerOrTip: "Big O notation describes the upper bound of an algorithm's time or space complexity in relation to input size. O(n) is linear (e.g., iterating an array), O(log n) is logarithmic (e.g., binary search on a sorted array).",
    tags: ['data structures', 'algorithms', 'complexity'],
    difficulty: 'Medium',
    rating: 4.6,
    ratingsCount: 11,
    userComments: [],
    createdBy: "managerUser1",
    approved: true,
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    bookmarkedBy: [],
  },
];


export let sampleBlogGenerationSettings: BlogGenerationSettings = {
  generationIntervalHours: 24, 
  topics: ['Career Advice', 'Resume Writing Tips', 'Interview Skills', 'Networking Strategies', 'Industry Trends'],
  style: 'informative',
  lastGenerated: undefined,
};

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
  }
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

export let samplePlatformSettings: PlatformSettings = {
  platformName: "ResumeMatch AI",
  maintenanceMode: false,
  communityFeedEnabled: true,
  autoModeratePosts: true, 
  jobBoardEnabled: true,
  maxJobPostingDays: 30,
  gamificationEnabled: true,
  xpForLogin: 10,
  xpForNewPost: 20,
  resumeAnalyzerEnabled: true,
  aiResumeWriterEnabled: true,
  coverLetterGeneratorEnabled: true,
  mockInterviewEnabled: true,
  referralsEnabled: true,
  affiliateProgramEnabled: true,
  alumniConnectEnabled: true,
  defaultAppointmentCost: 10,
  featureRequestsEnabled: true,
  allowTenantCustomBranding: true, 
  allowTenantEmailCustomization: false, 
  defaultProfileVisibility: 'alumni_only',
  maxResumeUploadsPerUser: 5,
  defaultTheme: 'light',
  enablePublicProfilePages: false,
  sessionTimeoutMinutes: 60,
  maxEventRegistrationsPerUser: 3,
  globalAnnouncement: 'Welcome to the new and improved ResumeMatch AI platform! Check out the AI Mock Interview feature.',
  pointsForAffiliateSignup: 50,
  walletEnabled: true,
};

export let sampleAnnouncements: Announcement[] = [
  {
    id: 'announce-1',
    tenantId: 'platform',
    title: 'New Feature: AI Mock Interview!',
    content: 'We are excited to launch our new AI Mock Interview feature. Practice common interview questions and get instant feedback. Find it under "Interview Prep" in the sidebar.',
    startDate: new Date(Date.now() - 86400000 * 2).toISOString(), 
    endDate: new Date(Date.now() + 86400000 * 10).toISOString(), 
    audience: 'All Users',
    status: 'Published',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdBy: 'alumni1', 
  },
  {
    id: 'announce-2',
    tenantId: 'platform',
    title: 'Platform Maintenance Scheduled',
    content: 'We will be performing scheduled maintenance on Sunday from 2 AM to 4 AM PST. The platform may be temporarily unavailable during this time.',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 3 + (2 * 60 * 60 * 1000)).toISOString(), 
    audience: 'All Users',
    status: 'Published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'alumni1', 
  },
  {
    id: 'announce-3',
    tenantId: 'tenant-2',
    title: 'Tenant-2 Welcome Mixer!',
    content: 'Welcome to the Corporate Partner Inc. alumni portal! Join us for a virtual welcome mixer next Friday at 5 PM. Check the community events for details.',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    audience: 'Specific Tenant',
    audienceTarget: 'tenant-2',
    status: 'Published', 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'managerUser1', 
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
    status: "SCHEDULED" as PracticeSessionStatus,
    notes: "Focus on advanced component architecture and state management for the candidate.",
  },
   {
    id: "ps2",
    userId: 'alumni1',
    date: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 86400000 * 5).toISOString(),
    category: "Practice with Experts",
    type: "System Design Interview",
    language: "English",
    status: "SCHEDULED" as PracticeSessionStatus,
    notes: "Candidate wants to practice system design for a large-scale e-commerce platform.",
  },
];

export let sampleLiveInterviewSessions: LiveInterviewSession[] = [
  {
    id: 'ps1', 
    tenantId: 'tenant-2', 
    title: 'Angular Frontend Practice (Expert Mock for Mike)',
    participants: [
      { userId: 'managerUser1', name: 'Manager Mike', role: 'interviewer', profilePictureUrl: samplePlatformUsers.find(u => u.id === 'managerUser1')?.profilePictureUrl },
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
    })) as AIMockQuestionType[],
    recordingReferences: [],
    interviewerScores: [],
    finalScore: undefined,
  },
  {
    id: 'ps2', // Added entry for ps2
    tenantId: 'Brainqy', 
    title: 'System Design Practice (for Alice)',
    participants: [
      { userId: 'system-expert-sd', name: 'System Design Expert', role: 'interviewer', profilePictureUrl: 'https://avatar.vercel.sh/system-expert.png' },
      { userId: 'alumni1', name: 'Alice Wonderland', role: 'candidate', profilePictureUrl: samplePlatformUsers.find(u=>u.id === 'alumni1')?.profilePictureUrl }
    ],
    scheduledTime: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 86400000 * 5).toISOString(),
    status: LiveInterviewSessionStatuses[0], // 'Scheduled'
    meetingLink: 'https://meet.example.com/system-design-ps2',
    interviewTopics: ['System Design', 'Scalability', 'Databases'],
    preSelectedQuestions: [
      sampleInterviewQuestions.find(q=>q.id === 'iq7'), // RESTful API
      sampleInterviewQuestions.find(q=>q.id === 'coding2'), // Big O
      {id: 'sd-generic-1', questionText: "How would you design a URL shortening service like TinyURL?", category: "System Design" as InterviewQuestionCategory, difficulty: "Hard" as InterviewQuestionDifficulty, baseScore: 20},
    ].filter(Boolean).map(q => ({id: q!.id, questionText: q!.questionText, category: q!.category, difficulty: q!.difficulty, baseScore: q!.baseScore || 10})) as AIMockQuestionType[],
    recordingReferences: [],
    interviewerScores: [],
    finalScore: undefined,
  },
  {
    id: 'live-session-1', 
    tenantId: 'Brainqy',
    title: 'Frontend Developer Screening (Live)',
    participants: [
      { userId: 'alumni1', name: 'Alice Wonderland', role: 'interviewer', profilePictureUrl: samplePlatformUsers.find(u=>u.id === 'alumni1')?.profilePictureUrl },
      { userId: 'alumni2', name: 'Bob The Builder', role: 'candidate', profilePictureUrl: samplePlatformUsers.find(u=>u.id === 'alumni2')?.profilePictureUrl } 
    ],
    scheduledTime: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), 
    status: LiveInterviewSessionStatuses[0], // 'Scheduled'
    meetingLink: 'https://meet.example.com/live123',
    interviewTopics: ['React', 'JavaScript', 'CSS', 'Behavioral'],
    preSelectedQuestions: [
      sampleInterviewQuestions.find(q=>q.id === 'iq1'),
      sampleInterviewQuestions.find(q=>q.id === 'iq5'),
      sampleInterviewQuestions.find(q=>q.id === 'mcq1'),
    ].filter(Boolean).map(q => ({id: q!.id, questionText: q!.questionText, category: q!.category, difficulty: q!.difficulty, baseScore: q!.baseScore || 10})) as AIMockQuestionType[],
    recordingReferences: [],
    interviewerScores: [],
    finalScore: undefined,
  },
  {
    id: 'live-session-3', 
    tenantId: 'tenant-2',
    title: 'Data Structures Practice with Mike',
    participants: [
      { userId: 'managerUser1', name: 'Manager Mike', role: 'interviewer', profilePictureUrl: samplePlatformUsers.find(u => u.id === 'managerUser1')?.profilePictureUrl },
      { userId: 'alumni3', name: 'Charlie Brown', role: 'candidate', profilePictureUrl: samplePlatformUsers.find(u => u.id === 'alumni3')?.profilePictureUrl }
    ],
    scheduledTime: new Date(SAMPLE_DATA_BASE_DATE.getTime() + 86400000 * 4).toISOString(),
    status: LiveInterviewSessionStatuses[0], // 'Scheduled'
    meetingLink: 'https://meet.example.com/ds-mike-charlie',
    interviewTopics: ['Data Structures', 'Algorithms', 'Problem Solving'],
    preSelectedQuestions: [
      sampleInterviewQuestions.find(q => q.id === 'coding2'),
      sampleInterviewQuestions.find(q => q.id === 'iq8'),
    ].filter(Boolean).map(q => ({id: q!.id, questionText: q!.questionText, category: q!.category, difficulty: q!.difficulty, baseScore: q!.baseScore || 15})) as AIMockQuestionType[],
    recordingReferences: [],
    interviewerScores: [],
    finalScore: undefined,
  },
];

export let sampleSystemAlerts: SystemAlert[] = [
  {
    id: 'alert1',
    type: 'error',
    title: 'Database Connection Issue',
    message: 'Failed to connect to the primary database. Services might be affected. Attempting to reconnect...',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    linkTo: '/admin/platform-settings#database', // Example link
    linkText: 'Check DB Settings',
  },
  {
    id: 'alert2',
    type: 'warning',
    title: 'High CPU Usage Detected',
    message: 'CPU usage on server EU-WEST-1A has exceeded 85% for the last 10 minutes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: 'alert3',
    type: 'info',
    title: 'New Platform Update Deployed',
    message: 'Version 2.5.1 has been successfully deployed to production. See release notes for details.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    linkTo: '/blog/platform-update-v2-5-1',
    linkText: 'Release Notes',
  },
  {
    id: 'alert4',
    type: 'success',
    title: 'Nightly Backup Completed',
    message: 'Full system backup completed successfully without errors.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
  },
  {
    id: 'alert5',
    type: 'warning',
    title: 'Low Disk Space',
    message: 'The main application server disk space is below 10%. Please investigate.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true, // Example of a read alert
  },
];
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
    shortBio: '', // From AlumniProfile
    university: '', // From AlumniProfile
    // ... any other fields from UserProfile or AlumniProfile that need defaults
  };
  return { ...defaultUser, ...partialProfile };
}
