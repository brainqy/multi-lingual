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
    ],
     bookmarkedBy: ['managerUser1'] 
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
    status: 'request', // <-- changed from 'open' to 'request'
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
    status: 'in progress', // <-- add or update to 'in progress' when assigned
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
    status: 'in progress', // <-- add or update to 'in progress' when assigned
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
    status: 'in progress', // <-- add or update to 'in progress' when assigned
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
     bookmarkedBy: ['managerUser1'] ,
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
    {
    id: 'java-q1',
    category: 'Technical',
    questionText: "What is the difference between JDK, JRE, and JVM?",
    isMCQ: false,
    answerOrTip: "JVM (Java Virtual Machine) is an abstract machine that provides a runtime environment. JRE (Java Runtime Environment) is a software package that provides Java class libraries, JVM, and other components to run applications. JDK (Java Development Kit) is a superset of JRE and also contains development tools like a compiler and debugger.",
    tags: ['java', 'core-concepts'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q2',
    category: 'Technical',
    questionText: "What are the main principles of Object-Oriented Programming (OOP)?",
    isMCQ: false,
    answerOrTip: "The four main principles are Encapsulation (bundling data and methods), Inheritance (one class acquiring properties of another), Polymorphism (one task performed in different ways), and Abstraction (hiding implementation details and showing only functionality).",
    tags: ['java', 'oop'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q3',
    category: 'Technical',
    questionText: "What is the difference between `==` and the `.equals()` method in Java?",
    isMCQ: false,
    answerOrTip: "`==` is an operator that compares object references (memory addresses). `.equals()` is a method that, by default in the Object class, also compares references, but it is often overridden (e.g., in String class) to compare the actual content or state of the objects.",
    tags: ['java', 'core-concepts'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q4',
    category: 'Technical',
    questionText: "Why is the `String` class immutable in Java?",
    isMCQ: false,
    answerOrTip: "Immutability offers several advantages: security (as strings are used for parameters in network connections, file paths etc.), thread safety (no synchronization needed), and performance (the JVM can optimize string handling via the String Constant Pool).",
    tags: ['java', 'strings', 'core-concepts'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q5',
    category: 'Technical',
    questionText: "What is method overloading and method overriding in Java?",
    isMCQ: false,
    answerOrTip: "Overloading is having multiple methods with the same name but different parameters in the same class (compile-time polymorphism). Overriding is when a subclass provides a specific implementation for a method that is already defined in its superclass (run-time polymorphism).",
    tags: ['java', 'oop'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q6',
    category: 'Technical',
    questionText: "What is a `final` keyword in Java? Can it be used with classes, methods, and variables?",
    isMCQ: false,
    answerOrTip: "Yes. A `final` variable's value cannot be changed. A `final` method cannot be overridden by a subclass. A `final` class cannot be extended or inherited.",
    tags: ['java', 'keywords'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q7',
    category: 'Technical',
    questionText: "Explain the `static` keyword in Java.",
    isMCQ: false,
    answerOrTip: "The `static` keyword means a member (variable or method) belongs to the class itself, rather than to an instance of the class. There is only one copy of a static member, shared across all instances.",
    tags: ['java', 'keywords'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q8',
    category: 'Technical',
    questionText: "What is the difference between `ArrayList` and `LinkedList` in Java?",
    isMCQ: false,
    answerOrTip: "`ArrayList` uses a dynamic array for storage, making it faster for accessing elements (O(1)). `LinkedList` uses a doubly-linked list, making it faster for adding/removing elements from the middle (O(1)), but slower for access (O(n)).",
    tags: ['java', 'collections'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q9',
    category: 'Technical',
    questionText: "What is the contract between `hashCode()` and `equals()`?",
    isMCQ: false,
    answerOrTip: "1. If two objects are equal according to the `equals()` method, then their `hashCode()` must be the same. 2. If two objects have the same `hashCode()`, they are NOT necessarily equal. (This is a hash collision).",
    tags: ['java', 'collections', 'core-concepts'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q10',
    category: 'Technical',
    questionText: "What are checked and unchecked exceptions in Java?",
    isMCQ: false,
    answerOrTip: "Checked exceptions are checked at compile-time (e.g., IOException, SQLException). The programmer must handle them using `try-catch` or declare them with `throws`. Unchecked exceptions (RuntimeExceptions) are not checked at compile-time and typically indicate programming errors (e.g., NullPointerException, ArrayIndexOutOfBoundsException).",
    tags: ['java', 'exceptions'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q11',
    category: 'Technical',
    questionText: "What is the purpose of the `super` keyword?",
    isMCQ: false,
    answerOrTip: "The `super` keyword is a reference variable used to refer to the immediate parent class object. It can be used to invoke the parent class constructor, methods, or access its instance variables.",
    tags: ['java', 'oop', 'keywords'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q12',
    category: 'Technical',
    questionText: "Which of these is NOT a pillar of OOP?",
    isMCQ: true,
    mcqOptions: ["Inheritance", "Polymorphism", "Compilation", "Encapsulation"],
    correctAnswer: "Compilation",
    answerOrTip: "Compilation is part of the programming process, not a principle of Object-Oriented Programming. The four main pillars are Inheritance, Polymorphism, Encapsulation, and Abstraction.",
    tags: ['java', 'oop', 'mcq'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q13',
    category: 'Technical',
    questionText: "What is garbage collection in Java?",
    isMCQ: false,
    answerOrTip: "Garbage collection is Java's automatic memory management process. The garbage collector finds objects that are no longer referenced by any part of the program and reclaims the memory they were using.",
    tags: ['java', 'jvm', 'memory'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q14',
    category: 'Technical',
    questionText: "What is the difference between `throw` and `throws`?",
    isMCQ: false,
    answerOrTip: "`throw` is a keyword used to explicitly throw an exception from a method or block of code. `throws` is a keyword used in a method signature to declare the exceptions that might be thrown by that method.",
    tags: ['java', 'exceptions'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q15',
    category: 'Technical',
    questionText: "What is a `try-with-resources` statement?",
    isMCQ: false,
    answerOrTip: "Introduced in Java 7, the `try-with-resources` statement ensures that each resource declared in the `try()` block is closed at the end of the statement, regardless of whether the block completes normally or an exception is thrown. Resources must implement the `AutoCloseable` interface.",
    tags: ['java', 'exceptions'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q16',
    category: 'Technical',
    questionText: "What are Java Streams?",
    isMCQ: false,
    answerOrTip: "Introduced in Java 8, Streams are a sequence of elements supporting sequential and parallel aggregate operations. They allow for a functional-style, declarative way to process collections of data, making code more readable and concise.",
    tags: ['java', 'java8', 'streams'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q17',
    category: 'Technical',
    questionText: "What is a lambda expression in Java?",
    isMCQ: false,
    answerOrTip: "A lambda expression is a short block of code that takes in parameters and returns a value. They are similar to methods, but they do not need a name and they can be implemented right in the body of a method. They are used to implement functional interfaces.",
    tags: ['java', 'java8', 'lambda'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q18',
    category: 'Technical',
    questionText: "What will be the output of `System.out.println(10 + 20 + \"Hello\");`?",
    isMCQ: true,
    mcqOptions: ["30Hello", "1020Hello", "Compilation Error", "Hello30"],
    correctAnswer: "30Hello",
    answerOrTip: "The expression is evaluated from left to right. `10 + 20` is performed first, resulting in `30`. Then, `30 + \"Hello\"` is a string concatenation, resulting in `\"30Hello\"`.",
    tags: ['java', 'core-concepts', 'mcq'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q19',
    category: 'Technical',
    questionText: "What is the primary purpose of a `default` method in an interface?",
    isMCQ: false,
    answerOrTip: "`default` methods were introduced in Java 8 to allow new methods to be added to interfaces without breaking existing implementing classes. They provide a default implementation that can be used or overridden by the implementing classes.",
    tags: ['java', 'java8', 'interface', 'oop'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'java-q20',
    category: 'Technical',
    questionText: "Which collection class is synchronized and thread-safe?",
    isMCQ: true,
    mcqOptions: ["ArrayList", "HashMap", "Vector", "LinkedList"],
    correctAnswer: "Vector",
    answerOrTip: "`Vector` is a legacy class that is synchronized. For new development, it's generally better to use `ArrayList` and manage synchronization externally with `Collections.synchronizedList()` or use concurrent collections like `CopyOnWriteArrayList`.",
    tags: ['java', 'collections', 'multithreading', 'mcq'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
    {
    id: 'gen-q-1',
    category: 'Behavioral',
    questionText: "Describe a time you had to handle a tight deadline.",
    isMCQ: false,
    answerOrTip: "Use the STAR method. Situation: Describe the project and deadline. Task: Explain your role and responsibilities. Action: Detail the specific steps you took (prioritization, extra hours, delegation). Result: Explain the outcome, whether you met the deadline and what you learned.",
    tags: ['time management', 'pressure'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-2',
    category: 'Behavioral',
    questionText: "How do you handle constructive criticism?",
    isMCQ: false,
    answerOrTip: "A good answer shows maturity. Mention that you welcome feedback for growth, listen actively without getting defensive, ask clarifying questions, and thank the person. Provide a brief example of how you've used feedback to improve.",
    tags: ['soft skills', 'feedback'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-3',
    category: 'Behavioral',
    questionText: "Tell me about a time you had to learn something completely new for a project.",
    isMCQ: false,
    answerOrTip: "Show your ability to be a quick and proactive learner. Describe the situation, what you needed to learn, the resources you used (documentation, courses, asking colleagues), and how you successfully applied the new skill to the project.",
    tags: ['learning', 'adaptability'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-4',
    category: 'Behavioral',
    questionText: "Describe a project you are most proud of and what your role was.",
    isMCQ: false,
    answerOrTip: "Choose a project that highlights skills relevant to the job you're applying for. Clearly explain the project's goal, your specific contributions, the challenges faced, and the successful outcome, quantifying results where possible.",
    tags: ['accomplishment', 'pride'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-5',
    category: 'Behavioral',
    questionText: "How do you prioritize your work when you have multiple tasks?",
    isMCQ: false,
    answerOrTip: "Mention prioritization frameworks you use, such as the Eisenhower Matrix (Urgent/Important) or assessing tasks based on business impact and effort. Emphasize communication with stakeholders to clarify priorities.",
    tags: ['prioritization', 'organization'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-6',
    category: 'Behavioral',
    questionText: "Tell me about a time you went above and beyond your job responsibilities.",
    isMCQ: false,
    answerOrTip: "Describe a situation where you took initiative to solve a problem or improve a process that wasn't explicitly part of your job. Focus on the positive impact your actions had on the team or company.",
    tags: ['initiative', 'proactive'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-7',
    category: 'Behavioral',
    questionText: "Describe a complex problem you solved. What was your process?",
    isMCQ: false,
    answerOrTip: "Break down your problem-solving process. For example: 1. Understood and defined the problem. 2. Broke it down into smaller parts. 3. Brainstormed potential solutions. 4. Evaluated and chose a solution. 5. Implemented and verified the solution.",
    tags: ['problem-solving', 'analytical'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-8',
    category: 'Behavioral',
    questionText: "How do you stay updated with the latest industry trends and technologies?",
    isMCQ: false,
    answerOrTip: "Mention specific sources like technical blogs (e.g., Hacker News, Smashing Magazine), online courses (Coursera, Udemy), attending conferences or meetups, following key people on social media, and personal projects.",
    tags: ['learning', 'industry knowledge'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-9',
    category: 'Behavioral',
    questionText: "Tell me about a time you disagreed with a decision made by your manager. How did you handle it?",
    isMCQ: false,
    answerOrTip: "The key is to show professionalism and respect. Explain how you presented your viewpoint with data and reasoning, listened to their perspective, and ultimately committed to their final decision while maintaining a positive team attitude.",
    tags: ['conflict', 'professionalism'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-10',
    category: 'Behavioral',
    questionText: "Describe a situation where you had to influence others without having formal authority.",
    isMCQ: false,
    answerOrTip: "Focus on how you used data, persuasion, building relationships, and finding common ground to get buy-in from your peers or other teams for an idea or project.",
    tags: ['leadership', 'influence'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-11',
    category: 'Technical',
    questionText: "What is the difference between SQL and NoSQL databases?",
    isMCQ: false,
    answerOrTip: "SQL databases are relational, have predefined schemas, and use Structured Query Language (e.g., MySQL, PostgreSQL). NoSQL databases are non-relational, have dynamic schemas for unstructured data, and come in various types like document, key-value, and graph (e.g., MongoDB, Redis).",
    tags: ['database', 'sql', 'nosql'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-12',
    category: 'Technical',
    questionText: "Explain the concept of DNS resolution.",
    isMCQ: false,
    answerOrTip: "DNS (Domain Name System) resolution is the process of translating a human-readable domain name (like www.google.com) into a machine-readable IP address (like 172.217.14.228). It involves a series of queries from a recursive resolver to root servers, TLD servers, and authoritative nameservers.",
    tags: ['networking', 'dns'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-13',
    category: 'Technical',
    questionText: "What is a container (like Docker) and how does it differ from a virtual machine?",
    isMCQ: false,
    answerOrTip: "A container virtualizes the operating system, allowing an application and its dependencies to be bundled and run in an isolated environment. A Virtual Machine (VM) virtualizes the hardware, running a full guest OS. Containers are more lightweight, faster to start, and use fewer resources than VMs.",
    tags: ['docker', 'devops', 'virtualization'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-14',
    category: 'Technical',
    questionText: "What is an API gateway and what is its purpose?",
    isMCQ: false,
    answerOrTip: "An API gateway is a management tool that sits between a client and a collection of backend services. It acts as a single entry point for all API requests, handling tasks like routing, authentication, rate limiting, and logging, simplifying client interactions and protecting backend systems.",
    tags: ['api', 'microservices', 'architecture'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-15',
    category: 'Technical',
    questionText: "Describe the git-flow workflow.",
    isMCQ: false,
    answerOrTip: "Git-flow is a branching model for Git. It defines specific roles for different branches: `main` (production-ready), `develop` (integration branch for features), `feature/*` (for new development), `release/*` (for preparing a new release), and `hotfix/*` (for fixing urgent production bugs).",
    tags: ['git', 'devops', 'version control'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-16',
    category: 'Technical',
    questionText: "What is the purpose of an index in a database?",
    isMCQ: false,
    answerOrTip: "An index is a data structure that improves the speed of data retrieval operations on a database table at the cost of additional writes and storage space. By creating an index on a column, you create a sorted pointer to the data, allowing for faster lookups (like an index in a book).",
    tags: ['database', 'sql', 'performance'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-17',
    category: 'Technical',
    questionText: "What is the difference between TCP and UDP?",
    isMCQ: false,
    answerOrTip: "TCP (Transmission Control Protocol) is connection-oriented, reliable, and ordered. It guarantees delivery of data packets through handshakes and acknowledgements (e.g., web browsing, email). UDP (User Datagram Protocol) is connectionless and does not guarantee delivery, order, or error checking, making it faster and suitable for real-time applications like video streaming or gaming.",
    tags: ['networking'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-18',
    category: 'Technical',
    questionText: "What is HTTPS and how does SSL/TLS work at a high level?",
    isMCQ: false,
    answerOrTip: "HTTPS (HTTP Secure) is the secure version of HTTP. It uses SSL/TLS (Secure Sockets Layer/Transport Layer Security) to encrypt communication between the client and server. The process involves a 'handshake' where the server proves its identity with a certificate, and then client and server agree on a symmetric encryption key to secure all subsequent data transfer.",
    tags: ['networking', 'security'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-19',
    category: 'Technical',
    questionText: "Explain the concept of CI/CD.",
    isMCQ: false,
    answerOrTip: "CI/CD stands for Continuous Integration and Continuous Delivery/Deployment. CI is the practice of frequently merging code changes into a central repository, where automated builds and tests are run. CD is the practice of automatically deploying all code changes that pass the CI stage to a testing and/or production environment.",
    tags: ['devops'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-20',
    category: 'Technical',
    questionText: "What is the CAP theorem?",
    isMCQ: false,
    answerOrTip: "The CAP theorem states that a distributed data store can only provide two of the following three guarantees: Consistency (every read receives the most recent write), Availability (every request receives a response), and Partition Tolerance (the system continues to operate despite network partitions).",
    tags: ['distributed systems', 'architecture', 'database'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-21',
    category: 'Technical',
    questionText: "What is the difference between authentication and authorization?",
    isMCQ: false,
    answerOrTip: "Authentication is the process of verifying who a user is (e.g., logging in with a username and password). Authorization is the process of verifying what a specific user has permission to do (e.g., an admin user can access a settings page, but a regular user cannot).",
    tags: ['security'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-22',
    category: 'Technical',
    questionText: "What happens when you type `google.com` into your browser and press Enter?",
    isMCQ: true,
    mcqOptions: ["The browser sends a request directly to Google's server using its name.", "The browser performs a DNS lookup to get Google's IP address, then establishes a TCP connection to that IP.", "The request goes to an FTP server which then provides the webpage.", "The browser's cache is the only thing checked before displaying the page."],
    correctAnswer: "The browser performs a DNS lookup to get Google's IP address, then establishes a TCP connection to that IP.",
    answerOrTip: "A high-level overview includes: DNS resolution, establishing a TCP/IP connection, making an HTTP(S) request, the server processing the request and sending back an HTTP response, and finally the browser rendering the received HTML, CSS, and JS.",
    tags: ['networking', 'web', 'mcq'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-23',
    category: 'Technical',
    questionText: "What is the primary purpose of a load balancer?",
    isMCQ: true,
    mcqOptions: ["To encrypt traffic between the client and server.", "To store frequently accessed data closer to the user.", "To distribute incoming network traffic across multiple servers.", "To serve as a firewall for the application."],
    correctAnswer: "To distribute incoming network traffic across multiple servers.",
    answerOrTip: "A load balancer acts as a traffic manager, distributing requests across a pool of backend servers to ensure no single server becomes a bottleneck, thereby improving availability and responsiveness.",
    tags: ['networking', 'architecture', 'mcq'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-24',
    category: 'Technical',
    questionText: "What is a main characteristic of a microservices architecture?",
    isMCQ: true,
    mcqOptions: ["A single, large, monolithic codebase for the entire application.", "Each service is independently deployable and runs in its own process.", "All services must share a single, large database.", "Communication between services is always synchronous."],
    correctAnswer: "Each service is independently deployable and runs in its own process.",
    answerOrTip: "Microservices architecture structures an application as a collection of loosely coupled, independently deployable services. This contrasts with a monolithic architecture where the entire application is built as a single unit.",
    tags: ['architecture', 'microservices', 'mcq'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-25',
    category: 'Technical',
    questionText: "What does it mean for a programming language to be 'dynamically typed'?",
    isMCQ: false,
    answerOrTip: "In a dynamically typed language (like Python or JavaScript), variable types are checked at runtime. You do not need to explicitly declare the type of a variable. This offers flexibility but can lead to runtime errors. This is in contrast to statically typed languages (like Java or C++) where types are checked at compile time.",
    tags: ['programming', 'core-concepts'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-26',
    category: 'Coding',
    questionText: "What is a hash map (or dictionary) and what are its common use cases?",
    isMCQ: false,
    answerOrTip: "A hash map is a data structure that stores key-value pairs. It uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found. It offers, on average, O(1) time complexity for insertion, deletion, and retrieval. Use cases include caching, database indexing, and frequency counting.",
    tags: ['data structures', 'algorithms'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-27',
    category: 'Coding',
    questionText: "What is the time complexity of searching for an element in a balanced binary search tree?",
    isMCQ: true,
    mcqOptions: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
    correctAnswer: "O(log n)",
    answerOrTip: "In a balanced BST, the height of the tree is proportional to log(n). Since a search operation traverses from the root to a leaf, the time complexity is O(log n). In an unbalanced tree, it could be O(n) in the worst case.",
    tags: ['data structures', 'algorithms', 'complexity', 'mcq'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-28',
    category: 'Coding',
    questionText: "Explain the difference between a stack and a queue.",
    isMCQ: false,
    answerOrTip: "A stack is a LIFO (Last-In, First-Out) data structure. The last element added is the first one to be removed (like a stack of plates). A queue is a FIFO (First-In, First-Out) data structure. The first element added is the first one to be removed (like a line at a store).",
    tags: ['data structures'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-29',
    category: 'Coding',
    questionText: "Write pseudo-code for a binary search algorithm.",
    isMCQ: false,
    answerOrTip: "FUNCTION binarySearch(array, target):\n  low = 0\n  high = length(array) - 1\n  WHILE low <= high:\n    mid = floor((low + high) / 2)\n    IF array[mid] == target:\n      RETURN mid\n    ELSE IF array[mid] < target:\n      low = mid + 1\n    ELSE:\n      high = mid - 1\n  RETURN -1 // Not found",
    tags: ['algorithms', 'coding'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-30',
    category: 'Coding',
    questionText: "What is recursion?",
    isMCQ: false,
    answerOrTip: "Recursion is a programming technique where a function calls itself to solve a problem. A recursive function must have a base case (a condition to stop the recursion) and a recursive step (the part where the function calls itself with a modified input that moves it closer to the base case).",
    tags: ['algorithms', 'core-concepts'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-31',
    category: 'Coding',
    questionText: "What is a 'pointer' in programming?",
    isMCQ: false,
    answerOrTip: "A pointer is a variable that stores the memory address of another variable. Instead of holding a value itself, it 'points' to the location where a value is stored. Pointers are fundamental in languages like C and C++ for direct memory manipulation, dynamic memory allocation, and building complex data structures.",
    tags: ['core-concepts', 'c++'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-32',
    category: 'Coding',
    questionText: "Describe the difference between an array and a linked list.",
    isMCQ: false,
    answerOrTip: "Arrays store elements in contiguous memory locations, providing fast O(1) access but slow O(n) insertion/deletion. Linked lists store elements as nodes with pointers to the next node, allowing for efficient O(1) insertion/deletion but slower O(n) access.",
    tags: ['data structures'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-33',
    category: 'Coding',
    questionText: "Which data structure is typically used to implement a LIFO (Last-In, First-Out) behavior?",
    isMCQ: true,
    mcqOptions: ["Queue", "Stack", "Heap", "Linked List"],
    correctAnswer: "Stack",
    answerOrTip: "A Stack follows the LIFO principle. Common operations are `push` (add to top) and `pop` (remove from top).",
    tags: ['data structures', 'mcq'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-34',
    category: 'Coding',
    questionText: "What is the time complexity of Bubble Sort in the worst-case scenario?",
    isMCQ: true,
    mcqOptions: ["O(n log n)", "O(log n)", "O(n)", "O(n^2)"],
    correctAnswer: "O(n^2)",
    answerOrTip: "Bubble Sort has a worst-case and average-case time complexity of O(n^2), where n is the number of items being sorted. It's generally inefficient for large datasets.",
    tags: ['algorithms', 'complexity', 'mcq'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-35',
    category: 'Coding',
    questionText: "What is dynamic programming?",
    isMCQ: false,
    answerOrTip: "Dynamic programming is a method for solving complex problems by breaking them down into simpler, overlapping subproblems. It solves each subproblem only once and stores their solutions (memoization or tabulation) to avoid re-computation, leading to optimized performance.",
    tags: ['algorithms'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-36',
    category: 'Role-Specific',
    questionText: "(Data Analyst) How would you handle a dataset with many missing values?",
    isMCQ: false,
    answerOrTip: "Approaches depend on the context. Options include: 1. Deletion (listwise or pairwise) if data loss is acceptable. 2. Imputation (mean, median, mode). 3. Advanced imputation (regression, k-NN). 4. Using algorithms that inherently handle missing values. The choice depends on the percentage of missing data and its potential bias.",
    tags: ['data analysis', 'data science'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-37',
    category: 'Role-Specific',
    questionText: "(UX Designer) Describe your process for creating a user flow diagram.",
    isMCQ: false,
    answerOrTip: "The process usually starts with defining the user's goal. Then, map out the entry point (e.g., landing page, email link). After that, chart each step and decision point the user takes to reach their goal. Use standard shapes for actions, decisions, and start/end points. Finally, get feedback and iterate.",
    tags: ['ux design', 'design process'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-38',
    category: 'Role-Specific',
    questionText: "(DevOps) How would you set up a basic CI/CD pipeline for a new web application?",
    isMCQ: false,
    answerOrTip: "A basic pipeline would involve: 1. Code commit to a Git repo (triggers the pipeline). 2. CI server (like Jenkins, GitLab CI) pulls the code. 3. Build step (e.g., `npm install`, `npm run build`). 4. Test step (run unit/integration tests). 5. (CD) If tests pass, automatically deploy the build artifacts to a staging or production server.",
    tags: ['devops', 'ci/cd'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-39',
    category: 'Role-Specific',
    questionText: "(Marketing) How would you measure the success of a digital marketing campaign?",
    isMCQ: true,
    mcqOptions: ["Only by the number of likes on social media.", "By a combination of metrics like Conversion Rate, Cost Per Acquisition (CPA), Return on Investment (ROI), and Customer Lifetime Value (CLV).", "Purely by the amount of traffic driven to the website.", "By the number of emails sent."],
    correctAnswer: "By a combination of metrics like Conversion Rate, Cost Per Acquisition (CPA), Return on Investment (ROI), and Customer Lifetime Value (CLV).",
    answerOrTip: "Success depends on the campaign goal. Key metrics include Conversion Rate, CPA, ROI, CLV, Click-Through Rate (CTR), and Engagement Rate. It's crucial to tie marketing metrics to business outcomes.",
    tags: ['marketing', 'analytics', 'mcq'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-40',
    category: 'Role-Specific',
    questionText: "(Sales) What are the key stages of a typical sales funnel?",
    isMCQ: true,
    mcqOptions: ["Awareness, Interest, Decision, Action (AIDA)", "Prospecting, Follow-up, Closing", "Inbound, Outbound, Nurturing", "Marketing, Sales, Customer Service"],
    correctAnswer: "Awareness, Interest, Decision, Action (AIDA)",
    answerOrTip: "The AIDA model is a classic sales funnel framework. It describes the stages a consumer goes through: Awareness (becoming aware of the brand/product), Interest (developing an interest), Decision (evaluating the purchase), and Action (making the purchase).",
    tags: ['sales', 'business', 'mcq'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-41',
    category: 'Analytical',
    questionText: "How many golf balls can fit into a school bus?",
    isMCQ: false,
    answerOrTip: "This is a Fermi problem. The interviewer isn't looking for an exact number, but your logical process. Estimate the volume of a golf ball, estimate the volume of a school bus (accounting for seats, etc.), and divide. State all your assumptions clearly.",
    tags: ['estimation', 'analytical'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-42',
    category: 'Analytical',
    questionText: "Estimate the number of windows in New York City.",
    isMCQ: false,
    answerOrTip: "This is another estimation question. Break it down: estimate the number of buildings (residential vs. commercial), estimate the average number of floors and windows per floor for each type, and calculate. The process is more important than the final number.",
    tags: ['estimation', 'analytical'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-43',
    category: 'Analytical',
    questionText: "If you had to choose three metrics to measure the success of YouTube, what would they be?",
    isMCQ: false,
    answerOrTip: "A good answer focuses on core business goals. Examples: 1. Total Watch Time (measures engagement depth). 2. User Retention/Daily Active Users (measures stickiness). 3. Advertiser ROI/Revenue (measures financial health). Justify why each metric is important.",
    tags: ['product sense', 'analytical'],
    difficulty: 'Hard',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-44',
    category: 'Analytical',
    questionText: "You have a 3-liter jug and a 5-liter jug. How can you measure exactly 4 liters of water?",
    isMCQ: false,
    answerOrTip: "1. Fill the 5L jug. 2. Pour from the 5L jug into the 3L jug until it's full. You now have 2L left in the 5L jug. 3. Empty the 3L jug. 4. Pour the 2L from the 5L jug into the 3L jug. 5. Fill the 5L jug again. 6. Pour from the 5L jug into the 3L jug until the 3L jug is full. Since it already had 2L, you'll pour exactly 1L, leaving 4L in the 5L jug.",
    tags: ['logic puzzle', 'analytical'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-45',
    category: 'Analytical',
    questionText: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    isMCQ: true,
    mcqOptions: ["$0.10", "$0.05", "$1.00", "$0.15"],
    correctAnswer: "$0.05",
    answerOrTip: "Let B be the cost of the ball. The bat costs B + $1.00. So, (B + $1.00) + B = $1.10.  2B + $1.00 = $1.10.  2B = $0.10.  B = $0.05. The ball costs 5 cents.",
    tags: ['logic puzzle', 'analytical', 'mcq'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-46',
    category: 'HR',
    questionText: "What are your salary expectations?",
    isMCQ: false,
    answerOrTip: "Instead of a single number, provide a well-researched range based on your experience, skills, and market rates for the role in that location. You can also state that you are flexible and open to discussing compensation as you learn more about the role's responsibilities.",
    tags: ['salary', 'negotiation'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-47',
    category: 'HR',
    questionText: "What are your greatest strengths and weaknesses?",
    isMCQ: false,
    answerOrTip: "For strengths, choose 2-3 that are highly relevant to the job description and give a brief example. For weaknesses, choose a real but manageable weakness, and crucially, explain the steps you are actively taking to improve upon it.",
    tags: ['self-awareness'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-48',
    category: 'HR',
    questionText: "Why do you want to leave your current job?",
    isMCQ: false,
    answerOrTip: "Be positive. Don't speak negatively about your current employer. Focus on what you're moving towards (e.g., seeking new challenges, more growth opportunities, alignment with this company's mission) rather than what you're running from.",
    tags: ['motivation'],
    difficulty: 'Medium',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-49',
    category: 'Common',
    questionText: "Do you have any questions for us?",
    isMCQ: false,
    answerOrTip: "Always have questions prepared. This shows your interest. Ask thoughtful questions about the team, the role's challenges, company culture, or the interviewer's own experience. Avoid questions about salary or benefits until the offer stage.",
    tags: ['engagement'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
  },
  {
    id: 'gen-q-50',
    category: 'Common',
    questionText: "What do you know about our company?",
    isMCQ: false,
    answerOrTip: "Do your research. Go beyond the homepage. Mention their specific products, recent news or achievements, their mission statement, or their key competitors. Show that you've made an effort to understand their business and industry.",
    tags: ['research', 'preparation'],
    difficulty: 'Easy',
    createdBy: 'system',
    approved: true,
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
