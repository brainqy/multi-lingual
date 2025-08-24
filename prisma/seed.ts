

import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Create default languages
  const english = await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: { code: 'en', name: 'English' },
  })

  const marathi = await prisma.language.upsert({
    where: { code: 'mr' },
    update: {},
    create: { code: 'mr', name: 'Marathi' },
  })
  
  const hindi = await prisma.language.upsert({
    where: { code: 'hi' },
    update: {},
    create: { code: 'hi', name: 'Hindi' },
  })

  console.log('Seeded languages:', { english, marathi, hindi })

  // Create a default Platform tenant for the admin user
  const platformTenant = await prisma.tenant.upsert({
    where: { id: 'platform' },
    update: {},
    create: {
      id: 'platform',
      name: 'Bhasha Setu Platform',
    },
  })

  console.log('Seeded platform tenant:', platformTenant)

    const platformTenant1 = await prisma.tenant.upsert({
    where: { id: 'brainqy' },
    update: {},
    create: {
      id: 'brainqy',
      name: 'Bhasha Setu Platform',
    },
  })

  console.log('Seeded platform tenant:', platformTenant1)

    const platformTenant2 = await prisma.tenant.upsert({
    where: { id: 'guruji' },
    update: {},
    create: {
      id: 'guruji',
      name: 'Guruji  Platform',
    },
  })

  console.log('Seeded platform tenant:', platformTenant2)


  // Create a default admin user and connect to the platform tenant
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bhashasetu.com' },
    update: {},
    create: {
      email: 'admin@bhashasetu.com',
      name: 'Admin User',
      password: 'password123',
      role: 'admin',
      tenantId: platformTenant.id,
    },
  })

  console.log('Seeded admin user:', adminUser)

    const adminUser2 = await prisma.user.upsert({
    where: { email: 'admin@bhashasetu.com' },
    update: {},
    create: {
      email: 'admin2@bhashasetu.com',
      name: 'Admin User',
      password: 'password123',
      role: 'admin',
      tenantId: platformTenant.id,
    },
  })

  console.log('Seeded admin user:', adminUser2)

  // Seed Promotional Content
  await prisma.promotionalContent.createMany({
    data: [
      {
        isActive: true,
        title: 'Unlock Premium Features!',
        description: 'Upgrade your JobMatch AI experience with advanced analytics, unlimited resume scans, priority support, and exclusive templates.',
        imageUrl: 'https://placehold.co/300x200.png',
        imageAlt: 'Retro motel sign against a blue sky',
        imageHint: 'motel sign',
        buttonText: 'Learn More',
        buttonLink: '#',
        gradientFrom: 'from-primary/80',
        gradientVia: 'via-primary',
        gradientTo: 'to-accent/80',
      },
      {
        isActive: true,
        title: 'New Feature: AI Mock Interview!',
        description: 'Practice for your next big interview with our new AI-powered mock interview tool. Get instant feedback and improve your skills.',
        imageUrl: 'https://placehold.co/300x200.png',
        imageAlt: 'Person in a video call interview',
        imageHint: 'interview video call',
        buttonText: 'Try it Now',
        buttonLink: '/ai-mock-interview',
        gradientFrom: 'from-blue-500',
        gradientVia: 'via-cyan-500',
        gradientTo: 'to-teal-500',
      }
    ],
    skipDuplicates: true,
  });
  console.log('Seeded promotional content.')
  
    // Seed Community Posts
  const post1 = await prisma.communityPost.create({
    data: {
      tenantId: 'platform',
      userId: adminUser.id,
      userName: adminUser.name,
      userAvatar: 'https://avatar.vercel.sh/admin.png',
      content: 'Welcome to the new community feed! Share your thoughts, ask questions, and connect with fellow alumni.',
      type: 'text',
      tags: ['welcome', 'community'],
      moderationStatus: 'visible',
      flagCount: 0,
      timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
    }
  });

  const post2 = await prisma.communityPost.create({
    data: {
      tenantId: 'platform',
      userId: adminUser.id,
      userName: adminUser.name,
      userAvatar: 'https://avatar.vercel.sh/admin.png',
      content: 'What type of content would you like to see more of?',
      type: 'poll',
      pollOptions: [
        { option: 'Career Advice Articles', votes: 15 },
        { option: 'Alumni Success Stories', votes: 25 },
        { option: 'Industry Trend Reports', votes: 8 },
        { option: 'Live Q&A Sessions', votes: 12 },
      ],
      tags: ['feedback', 'content'],
      moderationStatus: 'visible',
      flagCount: 0,
      timestamp: new Date(Date.now() - 86400000 * 1), // 1 day ago
    }
  });
  
  const post3 = await prisma.communityPost.create({
    data: {
      tenantId: 'platform',
      userId: adminUser.id,
      userName: adminUser.name,
      userAvatar: 'https://avatar.vercel.sh/admin.png',
      type: 'event',
      eventTitle: 'Alumni Virtual Networking Night',
      eventDate: new Date(Date.now() + 86400000 * 7).toISOString(), // A week from now
      eventLocation: 'Zoom (Link will be shared with attendees)',
      content: 'Join us for a fun and informal virtual networking event. A great chance to reconnect with old friends and make new connections in your field. All alumni are welcome!',
      capacity: 100,
      attendees: 23,
      tags: ['event', 'networking'],
      moderationStatus: 'visible',
      flagCount: 0,
      timestamp: new Date(),
    },
  });

  console.log('Seeded community posts.')

  // Seed Comments
  const comment1 = await prisma.communityComment.create({
    data: {
      postId: post1.id,
      userId: adminUser.id,
      userName: 'Alice Wonderland',
      userAvatar: 'https://avatar.vercel.sh/alice.png',
      comment: 'This is great! Looking forward to connecting with everyone.',
      timestamp: new Date(Date.now() - 86400000 * 1.9),
    }
  });

  await prisma.communityComment.create({
    data: {
      postId: post1.id,
      userId: adminUser.id,
      userName: 'Bob The Builder',
      userAvatar: 'https://avatar.vercel.sh/bob.png',
      comment: 'Replying to Alice: Me too! Great initiative.',
      parentId: comment1.id,
      timestamp: new Date(Date.now() - 86400000 * 1.8),
    }
  });
  
  await prisma.communityComment.create({
    data: {
      postId: post2.id,
      userId: adminUser.id,
      userName: 'Charlie Brown',
      userAvatar: 'https://avatar.vercel.sh/charlie.png',
      comment: 'Voted for success stories! So inspiring.',
      timestamp: new Date(Date.now() - 86400000 * 0.9),
    }
  });

  console.log('Seeded community comments.')

  // Seed System Alerts
  await prisma.systemAlert.createMany({
    data: [
      { type: 'error', title: 'Database Connection Issue', message: 'Failed to connect to the primary database. Services might be affected.', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
      { type: 'warning', title: 'High CPU Usage Detected', message: 'CPU usage on server EU-WEST-1A has exceeded 85%.', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { type: 'info', title: 'New Platform Update Deployed', message: 'Version 2.5.1 has been successfully deployed.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), linkTo: '/blog/platform-update-v2-5-1' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded system alerts.');

  // Seed Daily Challenges
  await prisma.dailyChallenge.createMany({
    data: [
      {
        id: "flip-challenge-1",
        type: 'flip',
        title: "Platform Power User",
        description: "Complete the following tasks to prove your mastery of the platform and earn a massive XP boost!",
        xpReward: 1000,
        tasks: [
          { description: "Refer 5 colleagues to the platform.", action: "refer", target: 5 },
          { description: "Analyze your resume against 3 different job descriptions.", action: "analyze_resume", target: 3 },
        ]
      },
      {
        id: "challenge-1",
        type: 'standard',
        date: new Date("2023-10-27"),
        title: "Reverse a String",
        description: "Write a function that reverses a given string.",
        difficulty: "Easy",
        category: "Coding",
        solution: "A common approach is to use `str.split('').reverse().join('')` in JavaScript, or to use a two-pointer technique swapping characters from the start and end of the string.",
      },
      {
        id: "challenge-2",
        type: 'standard',
        date: new Date("2023-10-28"),
        title: "Find the Missing Number",
        description: "Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing from the array.",
        difficulty: "Medium",
        category: "Coding",
        solution: "Calculate the expected sum of the sequence using the formula n*(n+1)/2. The missing number is the difference between the expected sum and the actual sum of the array elements.",
      }
    ],
    skipDuplicates: true,
  });
  console.log('Seeded daily challenges.');

  // Seed Badges
  await prisma.badge.createMany({
    data: [
      { id: 'profile-pro', name: 'Profile Pro', description: 'Completed 100% of your profile.', icon: 'UserCheck', xpReward: 100, triggerCondition: 'profile_completion_100' },
      { id: 'streak-starter', name: 'Streak Starter', description: 'Maintained a 3-day login streak.', icon: 'Flame', xpReward: 30, triggerCondition: 'daily_streak_3' },
      { id: 'networker', name: 'Networker', description: 'Made 10+ alumni connections.', icon: 'Users', xpReward: 75, triggerCondition: 'connections_10' },
      { id: 'analyzer-ace', name: 'Analyzer Ace', description: 'Analyzed 5+ resumes.', icon: 'Zap', xpReward: 50, triggerCondition: 'resume_scans_5' },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded badges.');

  // Seed Gamification Rules
  await prisma.gamificationRule.createMany({
    data: [
      { actionId: 'daily_login', description: 'Log in to the platform', xpPoints: 10 },
      { actionId: 'community_post', description: 'Create a new post in the community', xpPoints: 15 },
      { actionId: 'community_comment', description: 'Comment on a community post', xpPoints: 5 },
      { actionId: 'analyze_resume', description: 'Analyze a resume with the AI tool', xpPoints: 20 },
      { actionId: 'add_job_application', description: 'Add a new application to the job tracker', xpPoints: 10 },
      { actionId: 'successful_referral', description: 'Successfully refer a new user', xpPoints: 50 },
      { actionId: 'daily_challenge_complete', description: 'Complete the daily interview challenge', xpPoints: 25 },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded gamification rules.');

  // Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        type: 'mention',
        content: 'You were mentioned in a post!',
        link: `/community-feed#comment-1`,
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: 'event',
        content: 'You have an upcoming event: Alumni Virtual Networking Night.',
        link: `/events/alumni-networking`,
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: 'system',
        content: 'Welcome to the platform! Your account has been created.',
        link: `/profile`,
        isRead: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded notifications.');

  console.log(`Seeding finished.`)
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
