
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

const modernTemplateObject = {
  header: {
    fullName: "{{header.fullName}}",
    phone: "{{header.phone}}",
    email: "{{header.email}}",
    linkedin: "{{header.linkedin}}",
    portfolio: "{{header.portfolio}}",
    address: "{{header.address}}",
    jobTitle: "{{header.jobTitle}}"
  },
  summary: "{{summary}}",
  experience: [
    {
      id: "exp1",
      jobTitle: "Senior Research Analyst",
      company: "Invenio Marketing Solutions, Inc.",
      location: "",
      startDate: "2017-07",
      endDate: "Current",
      isCurrent: true,
      responsibilities: "- Managing a team of 2-3 research analysts across industry verticals.\\n- Conducting extensive primary and secondary research."
    }
  ],
  education: [
    {
      id: "edu1",
      degree: "Master of Science",
      major: "Marketing Research",
      university: "University of Texas",
      location: "",
      graduationYear: "2007",
      details: ""
    }
  ],
  skills: ["Market Research", "Data Analysis", "Project Management", "Statistical Analysis"],
  additionalDetails: { "main": {}, "sidebar": {} },
  templateId: "template1",
  layout: "single-column",
  sectionOrder: ["summary", "experience", "education", "skills"],
  styles: {
    "textAlign": "left",
    "headerFontSize": "24px",
    "fontFamily": "sans"
  }
};

const creativeTemplateObject = {
  header: {
    fullName: "{{header.fullName}}",
    phone: "{{header.phone}}",
    email: "{{header.email}}",
    linkedin: "{{header.linkedin}}",
    portfolio: "{{header.portfolio}}",
    address: "{{header.address}}",
    jobTitle: "{{header.jobTitle}}"
  },
  summary: "{{summary}}",
  experience: [
    {
      id: "exp1",
      jobTitle: "Senior Research Analyst",
      company: "Invenio Marketing Solutions, Inc.",
      location: "",
      startDate: "2017-07",
      endDate: "Current",
      isCurrent: true,
      responsibilities: "- Managing a team of 2-3 research analysts across industry verticals.\\n- Conducting extensive primary and secondary research."
    }
  ],
  education: [
    {
      id: "edu1",
      degree: "Master of Science",
      major: "Marketing Research",
      university: "University of Texas",
      location: "",
      graduationYear: "2007",
      details: ""
    }
  ],
  skills: ["Market Research", "Data Analysis", "Project Management", "Statistical Analysis"],
  additionalDetails: { "main": {}, "sidebar": {} },
  templateId: "template2",
  layout: "two-column-left",
  sectionOrder: ["summary", "experience", "education", "skills"],
  styles: {
    "textAlign": "left",
    "headerFontSize": "24px",
    "fontFamily": "sans"
  }
};

const modernTemplateContent = JSON.stringify(modernTemplateObject, null, 2);
const creativeTemplateContent = JSON.stringify(creativeTemplateObject, null, 2);


async function main() {
  console.log(`Start seeding ...`)

  // --- CLEANUP ---
  await prisma.vote.deleteMany({});
  await prisma.nomination.deleteMany({});
  await prisma.award.deleteMany({});
  await prisma.awardCategory.deleteMany({});
  await prisma.affiliateClick.deleteMany({});
  await prisma.affiliateSignup.deleteMany({});
  await prisma.affiliate.deleteMany({});
  await prisma.commissionTier.deleteMany({});
  await prisma.communityComment.deleteMany({});
  await prisma.communityPost.deleteMany({});
  await prisma.jobApplication.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.surveyResponse.deleteMany({});
  await prisma.survey.deleteMany({});
  await prisma.productCompany.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.resumeTemplate.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});
  
  // --- CORE DATA ---

  // Languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'mr', name: 'Marathi' },
    { code: 'hi', name: 'Hindi' },
  ];
  for (const lang of languages) {
    await prisma.language.upsert({ where: { code: lang.code }, update: {}, create: lang });
  }
  console.log('Seeded languages.');

  // Tenants
  const tenantsData = [
    { id: 'platform', name: 'Bhasha Setu Platform' },
    { id: 'brainqy', name: 'Brainqy University' },
    { id: 'guruji', name: 'Guruji Foundation' },
  ];
  for (const tenant of tenantsData) {
     await prisma.tenant.upsert({ where: { id: tenant.id }, update: {}, create: tenant });
  }
  console.log('Seeded tenants.');
  
  // Seed Product Companies
  await prisma.productCompany.createMany({
    data: [
      { name: 'Google', location: 'Pune', websiteUrl: 'https://careers.google.com/', domain: 'SaaS', hrName: 'John Doe', hrEmail: 'john.doe@google.com', contactNumber: '123-456-7890' },
      { name: 'Microsoft', location: 'Hyderabad', websiteUrl: 'https://careers.microsoft.com/', domain: 'SaaS', hrName: 'Jane Smith', hrEmail: 'jane.smith@microsoft.com', contactNumber: '234-567-8901' },
      { name: 'Apple', location: 'Bengaluru', websiteUrl: 'https://www.apple.com/careers/', domain: 'Hardware', hrName: 'Peter Jones', hrEmail: 'peter.jones@apple.com', contactNumber: '345-678-9012' },
      { name: 'Amazon', location: 'Gurgaon', websiteUrl: 'https://www.amazon.jobs/', domain: 'E-commerce', hrName: 'Mary Johnson', hrEmail: 'mary.johnson@amazon.com', contactNumber: '456-789-0123' },
      { name: 'Infosys', location: 'Pune', websiteUrl: 'https://www.infosys.com/careers/', domain: 'IT Services', hrName: 'David Williams', hrEmail: 'david.williams@infosys.com', contactNumber: '567-890-1234' },
      { name: 'Wipro', location: 'Bengaluru', websiteUrl: 'https://careers.wipro.com/', domain: 'IT Services', hrName: 'Linda Brown', hrEmail: 'linda.brown@wipro.com', contactNumber: '678-901-2345' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded product companies.');

  // --- USERS ---

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@bhashasetu.com', name: 'Admin User', password: 'password123', role: 'admin',
      tenantId: 'platform', dailyStreak: 5, longestStreak: 5, lastLogin: new Date(Date.now() - 86400000 * 2),
      streakFreezes: 2, weeklyActivity: [1, 1, 1, 1, 1, 0, 0], xpPoints: 1250, isDistinguished: true,
      bio: 'Platform administrator overseeing operations and community management.',
      skills: ['Platform Management', 'User Support', 'Content Moderation'],
      referralCode: 'ADMINPRO',
    },
  });
  console.log('Seeded admin user.');

  // Sample Users
  const sampleUsersData = [
    { id: 'user-alice', name: 'Alice Wonderland', email: 'alice@example.com', tenantId: 'platform', xpPoints: 850, isDistinguished: true, currentJobTitle: 'AI Researcher', currentOrganization: 'OpenAI' },
    { id: 'user-bob', name: 'Bob Builder', email: 'bob@example.com', tenantId: 'platform', xpPoints: 620, currentJobTitle: 'Lead Engineer', currentOrganization: 'Google', role: 'manager' },
    { id: 'user-charlie', name: 'Charlie Chocolate', email: 'charlie@example.com', tenantId: 'brainqy', xpPoints: 710, currentJobTitle: 'Product Manager', currentOrganization: 'Microsoft' },
    { id: 'user-diana', name: 'Diana Prince', email: 'diana@example.com', tenantId: 'guruji', xpPoints: 950, isDistinguished: true, currentJobTitle: 'UX Lead', currentOrganization: 'Apple' },
    { id: 'user-ethan', name: 'Ethan Hunt', email: 'ethan@example.com', tenantId: 'guruji', xpPoints: 450, currentJobTitle: 'DevOps Specialist', currentOrganization: 'Amazon' },
    { id: 'user-eve', name: 'Eve Engineer', email: 'eve@example.com', tenantId: 'platform', xpPoints: 550, currentJobTitle: 'Software Engineer', currentOrganization: 'Google' },
    { id: 'user-manager1', name: 'Manager Mike', email: 'managerUser1@example.com', tenantId: 'brainqy', role: 'manager', xpPoints: 400, isDistinguished: false, currentJobTitle: 'Alumni Engagement Lead', currentOrganization: 'Brainqy University' },
    { id: 'user-colleague', name: 'Colleague Carla', email: 'colleague@example.com', tenantId: 'brainqy', role: 'user', xpPoints: 150, isDistinguished: false, currentJobTitle: 'Junior Developer', currentOrganization: 'Brainqy University' },
];
  
  const userPromises = sampleUsersData.map(userData => 
    prisma.user.create({
      data: {
        ...userData, password: 'password123', role: userData.role || 'user', status: 'active',
        bio: `${userData.name} is a skilled professional at ${userData.currentOrganization}.`,
        skills: ['Teamwork', 'Communication'], referralCode: `${userData.name.split(' ')[0].toUpperCase()}123`
      },
    })
  );
  const createdUsers = await Promise.all(userPromises);
  console.log('Seeded sample users.');

  const [alice, bob, charlie, diana, ethan, eve, managerUser1, colleague] = createdUsers;

  // Create Wallets for all users
  for (const user of [adminUser, ...createdUsers]) {
      await prisma.wallet.create({
          data: {
              userId: user.id,
              coins: 100, // Initial bonus
              transactions: {
                  create: [{
                      description: "Initial account bonus",
                      amount: 100,
                      type: 'credit',
                      currency: 'coins'
                  }]
              }
          }
      });
  }
  console.log('Seeded wallets for all users.');

  // --- AFFILIATE MANAGEMENT ---
  const tier1 = await prisma.commissionTier.create({ data: { name: 'Bronze', milestoneRequirement: 0, commissionRate: 0.10 } });
  const tier2 = await prisma.commissionTier.create({ data: { name: 'Silver', milestoneRequirement: 10, commissionRate: 0.15 } });
  const tier3 = await prisma.commissionTier.create({ data: { name: 'Gold', milestoneRequirement: 50, commissionRate: 0.20 } });
  console.log('Seeded commission tiers.');
  
  const aff1 = await prisma.affiliate.create({ data: { userId: alice.id, name: alice.name, email: alice.email, status: 'approved', affiliateCode: 'ALICEPRO', commissionRate: 0.15, commissionTierId: tier2.id } });
  const aff2 = await prisma.affiliate.create({ data: { userId: bob.id, name: bob.name, email: bob.email, status: 'pending', affiliateCode: 'BUILDWITHBOB', commissionRate: 0.10, commissionTierId: tier1.id } });
  const aff3 = await prisma.affiliate.create({ data: { userId: diana.id, name: diana.name, email: diana.email, status: 'approved', affiliateCode: 'WONDERWOMAN', commissionRate: 0.20, commissionTierId: tier3.id } });
  console.log('Seeded affiliates.');

  await prisma.affiliateClick.createMany({
    data: [ { affiliateId: aff1.id, convertedToSignup: true }, { affiliateId: aff1.id, convertedToSignup: false }, { affiliateId: aff3.id, convertedToSignup: true }, { affiliateId: aff3.id, convertedToSignup: true }, { affiliateId: aff3.id, convertedToSignup: false } ]
  });
  await prisma.affiliateSignup.createMany({
    data: [ { affiliateId: aff1.id, newUserId: charlie.id, commissionEarned: 10.00 }, { affiliateId: aff3.id, newUserId: ethan.id, commissionEarned: 15.00 } ]
  });
  console.log('Seeded affiliate clicks and signups.');

  // --- AWARDS AND RECOGNITION ---
  const techCategory = await prisma.awardCategory.create({ data: { name: 'Technical Excellence', description: 'Recognizing outstanding technical achievements.' } });
  const communityCategory = await prisma.awardCategory.create({ data: { name: 'Community Impact', description: 'Celebrating contributions to our community.' } });

  const mentorAward = await prisma.award.create({
    data: {
      title: 'Mentor of the Year', description: 'For an alumnus who has shown exceptional dedication to mentoring.', categoryId: communityCategory.id,
      status: 'Voting',
      nominationStartDate: new Date(Date.now() - 86400000 * 20), nominationEndDate: new Date(Date.now() - 86400000 * 5),
      votingStartDate: new Date(Date.now() - 86400000 * 4), votingEndDate: new Date(Date.now() + 86400000 * 10),
    }
  });
  const risingStarAward = await prisma.award.create({
    data: {
      title: 'Rising Star Award', description: 'For a recent graduate making significant strides in their field.', categoryId: techCategory.id,
      status: 'Nominating',
      nominationStartDate: new Date(), nominationEndDate: new Date(Date.now() + 86400000 * 15),
      votingStartDate: new Date(Date.now() + 86400000 * 16), votingEndDate: new Date(Date.now() + 86400000 * 30),
    }
  });
  console.log('Seeded Awards.');

  const nomination1 = await prisma.nomination.create({ data: { awardId: mentorAward.id, nomineeId: diana.id, nominatorId: adminUser.id, justification: 'Diana has mentored 5 students this year, leading to 3 internships.' } });
  const nomination2 = await prisma.nomination.create({ data: { awardId: mentorAward.id, nomineeId: bob.id, nominatorId: alice.id, justification: 'Bob is always available to help and has provided invaluable guidance on system design.' } });
  await prisma.vote.createMany({
    data: [ { nominationId: nomination1.id, voterId: alice.id }, { nominationId: nomination1.id, voterId: charlie.id }, { nominationId: nomination2.id, voterId: ethan.id } ]
  });
  console.log('Seeded Nominations and Votes.');

  // --- Surveys ---
  await prisma.survey.create({
    data: {
      name: 'initialFeedbackSurvey',
      description: 'Gathers initial feedback from new users.',
      tenantId: 'platform',
      steps: {
        "set": [
          {"id":"welcome","type":"botMessage","text":"Welcome to the platform! We'd love to get your feedback. How would you rate your onboarding experience?","nextStepId":"rating"},
          {"id":"rating","type":"userOptions","variableName":"onboardingRating","options":[{"text":"⭐","value":"1","nextStepId":"thanks"},{"text":"⭐⭐","value":"2","nextStepId":"thanks"},{"text":"⭐⭐⭐","value":"3","nextStepId":"thanks"},{"text":"⭐⭐⭐⭐","value":"4","nextStepId":"thanks"},{"text":"⭐⭐⭐⭐⭐","value":"5","nextStepId":"thanks"}]},
          {"id":"thanks","type":"botMessage","text":"Thanks for your feedback! We appreciate you helping us improve.","isLastStep":true}
        ]
      }
    }
  });
   await prisma.survey.create({
    data: {
      name: 'profileCompletionSurvey',
      description: 'Helps users complete their profile step-by-step.',
      tenantId: 'platform',
      steps: {
        "set": [
          {"id":"start","type":"botMessage","text":"Let's complete your profile to get the most out of the platform! First, what's a short, professional bio about yourself?","nextStepId":"getBio"},
          {"id":"getBio","type":"userInput","variableName":"bio","inputType":"textarea","placeholder":"e.g., Experienced software engineer passionate about building scalable web applications...","nextStepId":"getJobTitle"},
          {"id":"getJobTitle","type":"botMessage","text":"Great bio! Now, what is your current job title?","nextStepId":"getJobTitleInput"},
          {"id":"getJobTitleInput","type":"userInput","variableName":"jobTitle","placeholder":"e.g., Software Engineer","nextStepId":"getCompany"},
          {"id":"getCompany","type":"botMessage","text":"And where do you currently work?","nextStepId":"getCompanyInput"},
          {"id":"getCompanyInput","type":"userInput","variableName":"company","placeholder":"e.g., Google","nextStepId":"getExperience"},
          {"id":"getExperience","type":"botMessage","text":"How many years of professional experience do you have?","nextStepId":"getExperienceInput"},
          {"id":"getExperienceInput","type":"userInput","variableName":"yearsOfExperience","placeholder":"e.g., 5+","nextStepId":"getWorkLocation"},
          {"id":"getWorkLocation","type":"botMessage","text":"What is your work location?","nextStepId":"getWorkLocationInput"},
          {"id":"getWorkLocationInput","type":"userInput","variableName":"workLocation","placeholder":"e.g., Pune, India or Remote","nextStepId":"getIndustry"},
          {"id":"getIndustry","type":"botMessage","text":"Which industry do you work in?","nextStepId":"getIndustryInput"},
          {"id":"getIndustryInput","type":"userInput","variableName":"industry","placeholder":"e.g., IT, Healthcare, Finance","nextStepId":"getGraduationYear"},
          {"id":"getGraduationYear","type":"botMessage","text":"What was your graduation year?","nextStepId":"getGraduationYearInput"},
          {"id":"getGraduationYearInput","type":"userInput","variableName":"graduationYear","placeholder":"e.g., 2020","nextStepId":"getDegreeProgram"},
          {"id":"getDegreeProgram","type":"botMessage","text":"What was your degree or program?","nextStepId":"getDegreeProgramInput"},
          {"id":"getDegreeProgramInput","type":"userInput","variableName":"degreeProgram","placeholder":"e.g., B.Tech, M.Sc","nextStepId":"getDepartment"},
          {"id":"getDepartment","type":"botMessage","text":"And your department or major?","nextStepId":"getDepartmentInput"},
          {"id":"getDepartmentInput","type":"userInput","variableName":"department","placeholder":"e.g., Computer Science","nextStepId":"getLinkedin"},
          {"id":"getLinkedin","type":"botMessage","text":"What's your LinkedIn profile URL?","nextStepId":"getLinkedinInput"},
          {"id":"getLinkedinInput","type":"userInput","variableName":"linkedInProfile","placeholder":"https://linkedin.com/in/your-profile","nextStepId":"getSkills"},
          {"id":"getSkills","type":"botMessage","text":"What are some of your top skills? (comma-separated)","nextStepId":"getSkillsInput"},
          {"id":"getSkillsInput","type":"userInput","variableName":"skills","placeholder":"e.g., React, Node.js, Project Management","nextStepId":"getInterests"},
          {"id":"getInterests","type":"botMessage","text":"Finally, what are your main career interests?","nextStepId":"getInterestsInput"},
          {"id":"getInterestsInput","type":"userInput","variableName":"careerInterests","placeholder":"e.g., AI, Product Management, Fintech","nextStepId":"end"},
          {"id":"end","type":"botMessage","text":"Awesome! Your profile is much more complete. You can add even more details on your profile page anytime.","isLastStep":true}
        ]
      }
    }
  });
  console.log('Seeded sample surveys.');

  // --- Resume Templates ---
  await prisma.resumeTemplate.createMany({
    data: [
      {
        id: 'template1',
        name: 'Modern Professional',
        description: 'A clean and modern template suitable for corporate and tech roles.',
        previewImageUrl: 'https://placehold.co/300x400/008080/FFFFFF?text=Modern',
        category: 'Modern',
        content: modernTemplateContent,
      },
      {
        id: 'template2',
        name: 'Creative Minimalist',
        description: 'A stylish template for creative fields like design and marketing.',
        previewImageUrl: 'https://placehold.co/300x400/3498db/FFFFFF?text=Creative',
        category: 'Creative',
        content: creativeTemplateContent,
      },
      {
        id: 'template3',
        name: 'Classic Professional',
        description: 'A timeless and traditional format, perfect for formal industries.',
        previewImageUrl: 'https://placehold.co/300x400/2c3e50/FFFFFF?text=Classic',
        category: 'Professional',
        content: modernTemplateContent, // Reusing modern for simplicity
      },
      {
        id: 'template4',
        name: 'Academic CV',
        description: 'A comprehensive template designed for academic and research positions.',
        previewImageUrl: 'https://placehold.co/300x400/9b59b6/FFFFFF?text=Academic',
        category: 'Academic',
        content: creativeTemplateContent, // Reusing creative for simplicity
      },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded resume templates.');


  // --- OTHER FEATURES ---
  await prisma.appointment.create({
    data: {
      tenantId: 'brainqy', requesterUserId: alice.id, alumniUserId: bob.id, title: 'Career Advice Session',
      dateTime: new Date(Date.now() + 86400000 * 7), status: 'Confirmed', withUser: bob.name,
      notes: 'Looking forward to discussing career paths in AI.', costInCoins: 10,
    }
  });
  console.log('Seeded a sample appointment.');

 
  await prisma.promotionalContent.createMany({
    data: [
      { isActive: true, title: 'Unlock Premium Features!', description: 'Upgrade your experience with advanced analytics, unlimited resume scans, and priority support.', imageUrl: 'https://placehold.co/300x200/008080/FFFFFF?text=Premium', imageAlt: 'Premium features', imageHint: 'premium upgrade', buttonText: 'Learn More', buttonLink: '#', gradientFrom: 'from-primary/80', gradientVia: 'via-primary', gradientTo: 'to-accent/80' },
      { isActive: true, title: 'New: AI Mock Interview!', description: 'Practice for your next big interview with our new AI-powered mock interview tool.', imageUrl: 'https://placehold.co/300x200/3498db/FFFFFF?text=AI+Interview', imageAlt: 'AI Interview', imageHint: 'interview video', buttonText: 'Try it Now', buttonLink: '/ai-mock-interview', gradientFrom: 'from-blue-500', gradientVia: 'via-cyan-500', gradientTo: 'to-teal-500' },
    ], skipDuplicates: true
  });
  console.log('Seeded promotional content.');

  const post1 = await prisma.communityPost.create({
    data: {
      tenantId: 'platform', userId: adminUser.id, userName: adminUser.name, userAvatar: 'https://avatar.vercel.sh/admin.png',
      content: 'Welcome to the community feed! Share your thoughts and connect with fellow alumni.', type: 'text',
      tags: ['welcome', 'community'], moderationStatus: 'visible', flagCount: 0, likes: 6,
      timestamp: new Date(Date.now() - 86400000 * 2), isPinned: true, likedBy: [alice.id, bob.id, charlie.id, diana.id, ethan.id, eve.id]
    }
  });
  await prisma.communityComment.create({ data: { postId: post1.id, userId: alice.id, userName: alice.name, comment: 'Excited to be here!', timestamp: new Date() } });
  console.log('Seeded community posts.');

  await prisma.badge.createMany({ data: [{ id: 'profile-pro', name: 'Profile Pro', description: 'Completed 100% of your profile.', icon: 'UserCheck', xpReward: 100, triggerCondition: 'profile_completion_100' }, { id: 'streak-starter', name: 'Streak Starter', description: 'Maintained a 3-day login streak.', icon: 'Flame', xpReward: 30, triggerCondition: 'daily_streak_3', streakFreezeReward: 1 }], skipDuplicates: true });
  await prisma.gamificationRule.createMany({ data: [{ actionId: 'daily_login', description: 'Log in to the platform', xpPoints: 10 }, { actionId: 'community_post', description: 'Create a post', xpPoints: 15 }], skipDuplicates: true });
  await prisma.notification.createMany({ data: [{ userId: adminUser.id, type: 'system', content: 'Welcome to the platform!', link: `/profile`, isRead: true }], skipDuplicates: true });
  console.log('Seeded system definitions (Badges, Rules, etc.).');
  
  await prisma.jobApplication.create({
    data: {
      userId: alice.id, tenantId: 'brainqy', companyName: 'Google', jobTitle: 'AI Researcher',
      status: 'Interviewing', dateApplied: new Date(Date.now() - 86400000 * 10),
      interviews: { create: [{ date: new Date(Date.now() + 86400000 * 5), type: 'Technical', interviewer: 'Dr. Smith' }] }
    }
  });
  await prisma.jobApplication.create({ data: { userId: alice.id, tenantId: 'brainqy', companyName: 'Microsoft', jobTitle: 'Software Engineer', status: 'Applied', dateApplied: new Date(Date.now() - 86400000 * 5) }});
  console.log('Seeded job applications.');

  await prisma.galleryEvent.create({
    data: {
      tenantId: 'brainqy', title: 'Alumni Meetup 2024', date: new Date('2024-03-15'),
      imageUrls: ['https://placehold.co/600x400/008080/FFFFFF?text=Meetup+1'],
      description: 'A great day of networking and reconnecting.', approved: true, createdByUserId: adminUser.id,
      attendeeUserIds: [alice.id, bob.id, charlie.id]
    }
  });
  console.log('Seeded gallery events.');

  await prisma.promoCode.upsert({
    where: { code: 'WELCOME100' }, update: {},
    create: {
      tenantId: 'platform', code: 'WELCOME100', description: '100 bonus coins for new users',
      rewardType: 'coins', rewardValue: 100, usageLimit: 50, isActive: true,
    }
  });
  console.log('Seeded promo codes.');

  await prisma.referralHistory.create({
    data: {
      referrerUserId: managerUser1.id,
      referredEmailOrName: colleague.email,
      status: 'Reward Earned',
      rewardAmount: 25,
      referralDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    }
  });
  console.log('Seeded referral history.');

  // Seed platform settings
  await prisma.platformSettings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      platformName: "JobMatch AI",
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
      aiMockInterviewCost: 25,
      aiResumeAnalysisCost: 10,
      aiAlumniConnectionRecCost: 5,
      referralsEnabled: true,
      affiliateProgramEnabled: true,
      alumniConnectEnabled: true,
      defaultAppointmentCost: 10,
      featureRequestsEnabled: true,
      allowTenantCustomBranding: true,
      allowTenantEmailCustomization: false,
      allowUserApiKey: true,
      defaultProfileVisibility: 'alumni_only',
      maxResumeUploadsPerUser: 5,
      defaultTheme: 'light',
      enablePublicProfilePages: false,
      sessionTimeoutMinutes: 60,
      walletEnabled: true,
    }
  });
  console.log('Seeded platform settings.');

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
