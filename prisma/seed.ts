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

  // Create a default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bhashasetu.com' },
    update: {},
    create: {
      email: 'admin@bhashasetu.com',
      name: 'Admin User',
      // In a real app, this should be a securely hashed password
      password: 'password123',
      role: 'ADMIN',
    },
  })

  console.log('Seeded admin user:', adminUser)

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
