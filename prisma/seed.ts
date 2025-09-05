
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

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
  const tenants = [
    { id: 'platform', name: 'Bhasha Setu Platform' },
    { id: 'brainqy', name: 'Brainqy University' },
    { id: 'guruji', name: 'Guruji Foundation' },
  ];
  for (const tenant of tenants) {
     await prisma.tenant.upsert({ where: { id: tenant.id }, update: {}, create: tenant });
  }
  console.log('Seeded tenants.');

  // --- USERS ---

  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bhashasetu.com' },
    update: {
      dailyStreak: 5, longestStreak: 5, lastLogin: new Date(Date.now() - 86400000 * 2), streakFreezes: 2,
      weeklyActivity: [1, 1, 1, 1, 1, 0, 0], xpPoints: 1250, isDistinguished: true,
    },
    create: {
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
    { id: 'sample-user-1', name: 'Alice Wonderland', email: 'alice@example.com', tenantId: 'platform', xpPoints: 850, isDistinguished: true, currentJobTitle: 'AI Researcher', currentOrganization: 'OpenAI' },
    { id: 'sample-user-2', name: 'Bob Builder', email: 'bob@example.com', tenantId: 'platform', xpPoints: 620, currentJobTitle: 'Lead Engineer', currentOrganization: 'Google' },
    { id: 'sample-user-3', name: 'Charlie Chocolate', email: 'charlie@example.com', tenantId: 'brainqy', xpPoints: 710, currentJobTitle: 'Product Manager', currentOrganization: 'Microsoft' },
    { id: 'sample-user-4', name: 'Diana Prince', email: 'diana@example.com', tenantId: 'guruji', xpPoints: 950, isDistinguished: true, currentJobTitle: 'UX Lead', currentOrganization: 'Apple' },
    { id: 'sample-user-5', name: 'Ethan Hunt', email: 'ethan@example.com', tenantId: 'guruji', xpPoints: 450, currentJobTitle: 'DevOps Specialist', currentOrganization: 'Amazon' },
  ];
  
  const userPromises = sampleUsersData.map(userData => 
    prisma.user.upsert({
      where: { id: userData.id },
      update: { xpPoints: userData.xpPoints, isDistinguished: userData.isDistinguished, currentJobTitle: userData.currentJobTitle, currentOrganization: userData.currentOrganization, tenantId: userData.tenantId },
      create: {
        ...userData, password: 'password123', role: 'manager', status: 'active',
        bio: `${userData.name} is a skilled professional at ${userData.currentOrganization}.`,
        skills: ['Teamwork', 'Communication'], referralCode: `${userData.name.split(' ')[0].toUpperCase()}123`
      },
    })
  );
  const createdUsers = await Promise.all(userPromises);
  console.log('Seeded sample users.');

  const [alice, bob, charlie, diana, ethan] = createdUsers;

  // --- AFFILIATE MANAGEMENT ---
  const tier1 = await prisma.commissionTier.create({ data: { name: 'Bronze', milestoneRequirement: 0, commissionRate: 0.10 } });
  const tier2 = await prisma.commissionTier.create({ data: { name: 'Silver', milestoneRequirement: 10, commissionRate: 0.15 } });
  const tier3 = await prisma.commissionTier.create({ data: { name: 'Gold', milestoneRequirement: 50, commissionRate: 0.20 } });
  console.log('Seeded commission tiers.');
  
  const aff1 = await prisma.affiliate.create({ data: { userId: alice.id, name: alice.name, email: alice.email, status: 'approved', affiliateCode: 'ALICEPRO', commissionRate: 0.15, commissionTierId: tier2.id } });
  const aff2 = await prisma.affiliate.create({ data: { userId: bob.id, name: bob.name, email: bob.email, status: 'pending', affiliateCode: 'BUILDWITHBOB', commissionRate: 0.10, commissionTierId: tier1.id } });
  const aff3 = await prisma.affiliate.create({ data: { userId: diana.id, name: diana.name, email: diana.email, status: 'approved', affiliateCode: 'WONDERWOMAN', commissionRate: 0.20, commissionTierId: tier3.id } });
  console.log('Seeded affiliates.');

  // Affiliate Clicks and Signups
  await prisma.affiliateClick.createMany({
    data: [
      { affiliateId: aff1.id, convertedToSignup: true },
      { affiliateId: aff1.id, convertedToSignup: false },
      { affiliateId: aff3.id, convertedToSignup: true },
      { affiliateId: aff3.id, convertedToSignup: true },
      { affiliateId: aff3.id, convertedToSignup: false },
    ]
  });
  await prisma.affiliateSignup.createMany({
    data: [
      { affiliateId: aff1.id, newUserId: charlie.id, commissionEarned: 10.00 },
      { affiliateId: aff3.id, newUserId: ethan.id, commissionEarned: 15.00 },
    ]
  });
  console.log('Seeded affiliate clicks and signups.');

  // --- AWARDS AND RECOGNITION ---

  const techCategory = await prisma.awardCategory.create({ data: { name: 'Technical Excellence', description: 'Recognizing outstanding technical achievements.' } });
  const communityCategory = await prisma.awardCategory.create({ data: { name: 'Community Impact', description: 'Celebrating contributions to our community.' } });

  const innovatorAward = await prisma.award.create({
    data: {
      title: 'Innovator of the Year', description: 'For the alumnus who has developed a groundbreaking product or technology.', categoryId: techCategory.id,
      status: 'Completed', winnerId: alice.id,
      nominationStartDate: new Date('2024-01-01'), nominationEndDate: new Date('2024-01-15'),
      votingStartDate: new Date('2024-01-16'), votingEndDate: new Date('2024-01-31'),
    }
  });

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

  // Nominations for the Mentor Award
  const nomination1 = await prisma.nomination.create({ data: { awardId: mentorAward.id, nomineeId: diana.id, nominatorId: adminUser.id, justification: 'Diana has mentored 5 students this year, leading to 3 internships.' } });
  const nomination2 = await prisma.nomination.create({ data: { awardId: mentorAward.id, nomineeId: bob.id, nominatorId: alice.id, justification: 'Bob is always available to help and has provided invaluable guidance on system design.' } });
  
  // Votes for the Mentor Award (mock)
  await prisma.vote.createMany({
    data: [
      { nominationId: nomination1.id, voterId: alice.id }, { nominationId: nomination1.id, voterId: charlie.id },
      { nominationId: nomination2.id, voterId: ethan.id },
    ]
  });
  console.log('Seeded Nominations and Votes.');


  // --- OTHER FEATURES ---

  // Sample Appointment for Email Template testing
  await prisma.appointment.create({
    data: {
      tenantId: 'brainqy',
      requesterUserId: alice.id,
      alumniUserId: bob.id,
      title: 'Career Advice Session',
      dateTime: new Date(Date.now() + 86400000 * 7), // 1 week from now
      status: 'Confirmed',
      withUser: bob.name,
      notes: 'Looking forward to discussing career paths in AI.',
      costInCoins: 10,
    }
  });
  console.log('Seeded a sample appointment for email testing.');


  // Announcements
  await prisma.announcement.create({
    data: {
      title: 'Old Event Announcement (for cron test)',
      content: 'This announcement is from an old event and should be cleaned up by the daily cron job.',
      startDate: new Date(Date.now() - 86400000 * 40),
      endDate: new Date(Date.now() - 86400000 * 35),
      audience: 'All Users',
      status: 'Archived',
      createdBy: adminUser.id,
      tenantId: 'platform',
      deletedAt: new Date(Date.now() - 86400000 * 31) // Set deletion date to 31 days ago
    }
  });
  console.log('Seeded a soft-deleted announcement for cron job testing.');

  // Promotional Content
  await prisma.promotionalContent.createMany({
    data: [
      { isActive: true, title: 'Unlock Premium Features!', description: 'Upgrade your experience with advanced analytics, unlimited resume scans, and priority support.', imageUrl: 'https://placehold.co/300x200/008080/FFFFFF?text=Premium', imageAlt: 'Premium features', imageHint: 'premium upgrade', buttonText: 'Learn More', buttonLink: '#', gradientFrom: 'from-primary/80', gradientVia: 'via-primary', gradientTo: 'to-accent/80' },
      { isActive: true, title: 'New: AI Mock Interview!', description: 'Practice for your next big interview with our new AI-powered mock interview tool.', imageUrl: 'https://placehold.co/300x200/3498db/FFFFFF?text=AI+Interview', imageAlt: 'AI Interview', imageHint: 'interview video', buttonText: 'Try it Now', buttonLink: '/ai-mock-interview', gradientFrom: 'from-blue-500', gradientVia: 'via-cyan-500', gradientTo: 'to-teal-500' },
    ], skipDuplicates: true
  });
  console.log('Seeded promotional content.');

  // Community Posts
  const post1 = await prisma.communityPost.create({
    data: {
      tenantId: 'platform', userId: adminUser.id, userName: adminUser.name, userAvatar: 'https://avatar.vercel.sh/admin.png',
      content: 'Welcome to the community feed! Share your thoughts and connect with fellow alumni.', type: 'text',
      tags: ['welcome', 'community'], moderationStatus: 'visible', flagCount: 0, likes: 6,
      timestamp: new Date(Date.now() - 86400000 * 2), isPinned: true, // Pinned post example
    }
  });

  await prisma.communityComment.create({ data: { postId: post1.id, userId: alice.id, userName: alice.name, comment: 'Excited to be here!', timestamp: new Date() } });
  console.log('Seeded community posts.');

  // System Alerts, Badges, Gamification Rules, etc. (mostly static definitions)
  await prisma.systemAlert.createMany({ data: [{ type: 'info', title: 'New Platform Update Deployed', message: 'Version 2.5.1 has been successfully deployed.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), linkTo: '/blog' }], skipDuplicates: true });
  await prisma.badge.createMany({ data: [{ id: 'profile-pro', name: 'Profile Pro', description: 'Completed 100% of your profile.', icon: 'UserCheck', xpReward: 100, triggerCondition: 'profile_completion_100' }, { id: 'streak-starter', name: 'Streak Starter', description: 'Maintained a 3-day login streak.', icon: 'Flame', xpReward: 30, triggerCondition: 'daily_streak_3', streakFreezeReward: 1 }], skipDuplicates: true });
  await prisma.gamificationRule.createMany({ data: [{ actionId: 'daily_login', description: 'Log in to the platform', xpPoints: 10 }, { actionId: 'community_post', description: 'Create a post', xpPoints: 15 }], skipDuplicates: true });
  await prisma.notification.createMany({ data: [{ userId: adminUser.id, type: 'system', content: 'Welcome to the platform!', link: `/profile`, isRead: true }], skipDuplicates: true });
  console.log('Seeded system definitions (Alerts, Badges, etc.).');
  
  // Job Applications for Alice
  await prisma.jobApplication.create({
    data: {
      userId: alice.id, tenantId: 'brainqy', companyName: 'Google', jobTitle: 'AI Researcher',
      status: 'Interviewing', dateApplied: new Date(Date.now() - 86400000 * 10),
      interviews: {
        create: [{ date: new Date(Date.now() + 86400000 * 5), type: 'Technical', interviewer: 'Dr. Smith' }]
      }
    }
  });
  await prisma.jobApplication.create({ data: { userId: alice.id, tenantId: 'brainqy', companyName: 'Microsoft', jobTitle: 'Software Engineer', status: 'Applied', dateApplied: new Date(Date.now() - 86400000 * 5) }});
  console.log('Seeded job applications.');

  // Gallery Event
  await prisma.galleryEvent.create({
    data: {
      tenantId: 'brainqy', title: 'Alumni Meetup 2024', date: new Date('2024-03-15'),
      imageUrls: ['https://placehold.co/600x400/008080/FFFFFF?text=Meetup+1'],
      description: 'A great day of networking and reconnecting.', approved: true, createdByUserId: adminUser.id,
      attendeeUserIds: [alice.id, bob.id, charlie.id]
    }
  });
  console.log('Seeded gallery events.');

  // Promo Code
  await prisma.promoCode.upsert({
    where: { code: 'WELCOME100' },
    update: {},
    create: {
      tenantId: 'platform',
      code: 'WELCOME100',
      description: '100 bonus coins for new users',
      rewardType: 'coins',
      rewardValue: 100,
      usageLimit: 50,
      isActive: true,
    }
  });
  console.log('Seeded promo codes.');

  // --- DAILY CHALLENGES ---
  await prisma.dailyChallenge.createMany({
    data: [
      // Standard Challenges
      { id: 'dc-std-1', type: 'standard', title: "Reverse a String", description: "Write a function that reverses a given string.", difficulty: "Easy", category: "Coding", solution: "A common approach is `str.split('').reverse().join('')` or a two-pointer technique." },
      { id: 'dc-std-2', type: 'standard', title: "Tell me about a time you failed.", description: "Prepare an answer using the STAR method.", difficulty: "Medium", category: "Behavioral", solution: "Focus on Situation, Task, Action, and Result. Emphasize what you learned from the experience." },
      // Flip Challenge Tasks (structured as individual challenges)
      { id: 'dc-flip-1', type: 'flip', title: "Analyze a Resume", description: "Analyze one resume.", xpReward: 20, tasks: [{ description: "Analyze a resume using the Resume Analyzer tool.", action: "analyze_resume", target: 1 }] },
      { id: 'dc-flip-2', type: 'flip', title: "Analyze 3 Resumes", description: "Analyze three resumes.", xpReward: 50, tasks: [{ description: "Analyze 3 resumes against job descriptions.", action: "analyze_resume", target: 3 }] },
      { id: 'dc-flip-3', type: 'flip', title: "Track a Job", description: "Add one application to the job tracker.", xpReward: 15, tasks: [{ description: "Add a new job application to your Job Tracker board.", action: "add_job_application", target: 1 }] },
      { id: 'dc-flip-4', type: 'flip', title: "Track 5 Jobs", description: "Add five applications to the job tracker.", xpReward: 40, tasks: [{ description: "Add 5 new job applications to your Job Tracker board.", action: "add_job_application", target: 5 }] },
      { id: 'dc-flip-5', type: 'flip', title: "Start a Conversation", description: "Create a post in the community feed.", xpReward: 15, tasks: [{ description: "Create a new post in the community feed.", action: "community_post", target: 1 }] },
      { id: 'dc-flip-6', type: 'flip', title: "Be Heard", description: "Post 3 times in the community.", xpReward: 40, tasks: [{ description: "Create 3 new posts in the community feed.", action: "community_post", target: 3 }] },
      { id: 'dc-flip-7', type: 'flip', title: "Join the Discussion", description: "Comment on a community post.", xpReward: 5, tasks: [{ description: "Leave a comment on any community post.", action: "community_comment", target: 1 }] },
      { id: 'dc-flip-8', type: 'flip', title: "Be Engaging", description: "Leave 5 comments on community posts.", xpReward: 25, tasks: [{ description: "Leave 5 comments on any community posts.", action: "community_comment", target: 5 }] },
      { id: 'dc-flip-9', type: 'flip', title: "Refer a Friend", description: "Refer one new user.", xpReward: 50, tasks: [{ description: "Successfully refer one new user who signs up.", action: "refer", target: 1 }] },
      { id: 'dc-flip-10', type: 'flip', title: "Grow the Network", description: "Refer three new users.", xpReward: 150, tasks: [{ description: "Successfully refer three new users who sign up.", action: "refer", target: 3 }] },
      { id: 'dc-flip-11', type: 'flip', title: "Book a Mentorship Session", description: "Book an appointment with an alumni.", xpReward: 30, tasks: [{ description: "Book an appointment with a mentor in the Alumni Directory.", action: "book_appointment", target: 1 }] },
      { id: 'dc-flip-12', type: 'flip', title: "Generate a Cover Letter", description: "Use the AI to generate a cover letter.", xpReward: 20, tasks: [{ description: "Generate a cover letter for a job application.", action: "generate_cover_letter", target: 1 }] },
      { id: 'dc-flip-13', type: 'flip', title: "Complete Daily Challenge", description: "Complete a standard daily challenge.", xpReward: 25, tasks: [{ description: "Complete one standard daily interview challenge.", action: "daily_challenge_complete", target: 1 }] },
      { id: 'dc-flip-14', type: 'flip', title: "Get Your Profile to 100%", description: "Complete your user profile.", xpReward: 100, tasks: [{ description: "Fill out your user profile until it reaches 100% completion.", action: "profile_completion_percentage", target: 100 }] },
      { id: 'dc-flip-15', type: 'flip', title: "Create an Interview Quiz", description: "Create and save a custom quiz.", xpReward: 40, tasks: [{ description: "Create a new custom quiz from the question bank with at least 5 questions.", action: "create_quiz", target: 1 }] },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded daily challenges.');

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

