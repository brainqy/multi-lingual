
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // --- CLEANUP ---
  // In a real dev environment, you might want to clean up old data first.
  // For this demo, upsert and createMany handle most cases.
  // We'll clean relations manually where needed.
  await prisma.vote.deleteMany({});
  await prisma.nomination.deleteMany({});
  await prisma.award.deleteMany({});
  await prisma.awardCategory.deleteMany({});
  
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
    { id: 'sample-user-1', name: 'Alice Wonderland', email: 'alice@example.com', tenantId: 'brainqy', xpPoints: 850, isDistinguished: true, currentJobTitle: 'AI Researcher', currentOrganization: 'OpenAI' },
    { id: 'sample-user-2', name: 'Bob Builder', email: 'bob@example.com', tenantId: 'brainqy', xpPoints: 620, currentJobTitle: 'Lead Engineer', currentOrganization: 'Google' },
    { id: 'sample-user-3', name: 'Charlie Chocolate', email: 'charlie@example.com', tenantId: 'brainqy', xpPoints: 710, currentJobTitle: 'Product Manager', currentOrganization: 'Microsoft' },
    { id: 'sample-user-4', name: 'Diana Prince', email: 'diana@example.com', tenantId: 'guruji', xpPoints: 950, isDistinguished: true, currentJobTitle: 'UX Lead', currentOrganization: 'Apple' },
    { id: 'sample-user-5', name: 'Ethan Hunt', email: 'ethan@example.com', tenantId: 'guruji', xpPoints: 450, currentJobTitle: 'DevOps Specialist', currentOrganization: 'Amazon' },
  ];
  
  const userPromises = sampleUsersData.map(userData => 
    prisma.user.upsert({
      where: { id: userData.id },
      update: { xpPoints: userData.xpPoints, isDistinguished: userData.isDistinguished, currentJobTitle: userData.currentJobTitle, currentOrganization: userData.currentOrganization },
      create: {
        ...userData, password: 'password123', role: 'user', status: 'active',
        bio: `${userData.name} is a skilled professional at ${userData.currentOrganization}.`,
        skills: ['Teamwork', 'Communication'], referralCode: `${userData.name.split(' ')[0].toUpperCase()}123`
      },
    })
  );
  const createdUsers = await Promise.all(userPromises);
  console.log('Seeded sample users.');

  const [alice, bob, charlie, diana, ethan] = createdUsers;

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
  await prisma.promoCode.create({
    data: {
      tenantId: 'platform', code: 'WELCOME100', description: '100 bonus coins for new users',
      rewardType: 'coins', rewardValue: 100, usageLimit: 50, isActive: true,
    }
  });
  console.log('Seeded promo codes.');

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
