
import { PrismaClient } from '@prisma/client';
import { samplePlatformUsers, sampleTenants } from '../src/lib/sample-data';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Seed Tenants first to satisfy foreign key constraints
  for (const tenantData of sampleTenants) {
    // Prisma doesn't like a nested 'settings' object on create, handle it separately
    const { settings, ...restOfTenantData } = tenantData;
    
    await prisma.tenant.upsert({
      where: { id: restOfTenantData.id },
      update: {},
      create: {
        ...restOfTenantData,
        // Create TenantSettings if they exist in the sample data
        settings: settings ? {
          create: {
            ...settings,
            // features and emailTemplates are JSON fields, so they should be created as such
            features: settings.features || Prisma.JsonNull,
            emailTemplates: settings.emailTemplates || Prisma.JsonNull,
          },
        } : undefined,
      },
    });
    console.log(`Created/updated tenant with id: ${tenantData.id}`);
  }

  // Seed Users
  for (const userData of samplePlatformUsers) {
    const {
      // Exclude relational or complex fields that Prisma handles differently
      company,
      pastInterviewSessions,
      challengeProgress,
      weeklyActivity,
      ...restOfUserData
    } = userData;

    // Convert date strings to Date objects where necessary
    const createData = {
      ...restOfUserData,
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
      createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
      // Ensure arrays are handled correctly for Prisma's JSON type
      skills: userData.skills || [],
      areasOfSupport: userData.areasOfSupport || [],
      interests: userData.interests || [],
      offersHelpWith: userData.offersHelpWith || [],
      earnedBadges: userData.earnedBadges || [],
      challengeTopics: userData.challengeTopics || [],
    };
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: createData,
    });
    console.log(`Created/updated user with email: ${userData.email}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
