
import { Prisma, PrismaClient } from '@prisma/client';
import { samplePlatformUsers, sampleTenants, sampleBadges, sampleXpRules, sampleInterviewQuestions, sampleAffiliates, samplePromotionalContent, sampleActivities, sampleBlogPosts, sampleFeatureRequests, initialFeedbackSurvey, profileCompletionSurveyDefinition, samplePromoCodes } from '../src/lib/sample-data';

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
      skills: userData.skills || Prisma.JsonNull,
      areasOfSupport: userData.areasOfSupport || Prisma.JsonNull,
      interests: userData.interests || Prisma.JsonNull,
      offersHelpWith: userData.offersHelpWith || Prisma.JsonNull,
      earnedBadges: userData.earnedBadges || Prisma.JsonNull,
      challengeTopics: userData.challengeTopics || Prisma.JsonNull,
    };
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: createData,
    });
    console.log(`Created/updated user with email: ${userData.email}`);
  }
  
  // Seed Badges
  for (const badgeData of sampleBadges) {
    await prisma.badge.upsert({
      where: { name: badgeData.name },
      update: {},
      create: badgeData,
    });
    console.log(`Created/updated badge: ${badgeData.name}`);
  }

  // Seed Gamification Rules
  for (const ruleData of sampleXpRules) {
    await prisma.gamificationRule.upsert({
      where: { actionId: ruleData.actionId },
      update: {},
      create: ruleData,
    });
    console.log(`Created/updated gamification rule: ${ruleData.actionId}`);
  }

  // Seed Interview Questions
  for (const questionData of sampleInterviewQuestions) {
    const { id, rating, ratingsCount, userRatings, userComments, bookmarkedBy, ...restOfQuestionData } = questionData;
    const createData = {
        ...restOfQuestionData,
        mcqOptions: questionData.mcqOptions || Prisma.JsonNull,
        userRatings: questionData.userRatings || Prisma.JsonNull,
        userComments: questionData.userComments || Prisma.JsonNull,
        bookmarkedBy: questionData.bookmarkedBy || [],
        tags: questionData.tags || [],
    };
    await prisma.interviewQuestion.upsert({
        where: { id: questionData.id },
        update: {},
        create: {
            id: questionData.id,
            ...createData,
        },
    });
    console.log(`Created/updated interview question: ${questionData.questionText.substring(0, 30)}...`);
  }

  // Seed Affiliates
  for (const affiliateData of sampleAffiliates) {
    const { id, ...restOfData } = affiliateData; // Prisma generates ID
    await prisma.affiliate.upsert({
        where: { userId: affiliateData.userId },
        update: { ...restOfData },
        create: { ...affiliateData },
    });
    console.log(`Created/updated affiliate: ${affiliateData.name}`);
  }

  // Seed Promotional Content
  for (const promoData of samplePromotionalContent) {
    await prisma.promotionalContent.upsert({
      where: { id: promoData.id },
      update: { ...promoData },
      create: { ...promoData },
    });
    console.log(`Created/updated promotional content: ${promoData.title}`);
  }

  // Seed Activities
  for (const activityData of sampleActivities) {
    const { id, ...restOfData } = activityData;
    await prisma.activity.create({
      data: {
        ...restOfData,
        timestamp: new Date(restOfData.timestamp),
      },
    });
  }
  console.log(`Seeded ${sampleActivities.length} activities.`);

  // Seed Blog Posts
  for (const postData of sampleBlogPosts) {
      const { id, comments, ...restOfData } = postData;
      await prisma.blogPost.upsert({
          where: { slug: postData.slug },
          update: {},
          create: {
              ...restOfData,
              date: new Date(restOfData.date),
          },
      });
      console.log(`Created/updated blog post: ${postData.title}`);
  }

  // Seed Feature Requests
  for (const reqData of sampleFeatureRequests) {
      const { id, ...restOfData } = reqData;
      await prisma.featureRequest.upsert({
        where: { id: reqData.id },
        update: { ...restOfData },
        create: {
          ...restOfData,
          timestamp: new Date(restOfData.timestamp),
        }
      });
      console.log(`Created/updated feature request: ${reqData.title}`);
  }

  // Seed Surveys
  await prisma.survey.upsert({
    where: { name: 'Initial User Feedback' },
    update: {},
    create: {
      name: 'Initial User Feedback',
      description: 'Gather first impressions from users.',
      steps: initialFeedbackSurvey as Prisma.JsonArray,
      tenantId: 'platform',
    }
  });
  await prisma.survey.upsert({
    where: { name: 'Profile Completion Survey' },
    update: {},
    create: {
      name: 'Profile Completion Survey',
      description: 'Guide users to complete their profile.',
      steps: profileCompletionSurveyDefinition as Prisma.JsonArray,
      tenantId: 'platform',
    }
  });
  console.log('Seeded survey definitions.');

  // Seed Promo Codes
  for (const codeData of samplePromoCodes) {
      const { id, ...restOfData } = codeData;
      await prisma.promoCode.upsert({
          where: { code: codeData.code },
          update: {},
          create: {
              ...restOfData,
              expiresAt: codeData.expiresAt ? new Date(codeData.expiresAt) : null,
          }
      });
      console.log(`Created/updated promo code: ${codeData.code}`);
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
