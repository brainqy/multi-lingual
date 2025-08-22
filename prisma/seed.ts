import { PrismaClient } from '@prisma/client'

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


  // Create a default admin user and connect to the platform tenant
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bhashasetu.com' },
    update: {},
    create: {
      email: 'admin@bhashasetu.com',
      name: 'Admin User',
      password: 'password123',
      role: 'ADMIN',
      tenantId: platformTenant.id,
    },
  })

  console.log('Seeded admin user:', adminUser)

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

  console.log('Seeded community posts.');

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

  console.log('Seeded community comments.');


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
