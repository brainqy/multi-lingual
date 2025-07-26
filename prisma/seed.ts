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
