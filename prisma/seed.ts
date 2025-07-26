import { Prisma, PrismaClient } from '@prisma/client';
import { samplePlatformUsers, sampleTenants, sampleBadges, sampleXpRules, sampleInterviewQuestions, sampleAffiliates, samplePromotionalContent, sampleActivities, sampleBlogPosts, sampleFeatureRequests, initialFeedbackSurvey, profileCompletionSurveyDefinition, samplePromoCodes, sampleMockInterviewSessions, sampleSystemAlerts, sampleChallenges, sampleProductCompanies } from '../src/lib/sample-data';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Seed Tenants first to satisfy foreign key constraints
  for (const tenantData of sampleTenants) {
    const { settings, ...restOfTenantData } = tenantData;
    
    await prisma.tenant.upsert({
      where: { id: restOfTenantData.id },
      update: {},
      create: {
        ...restOfTenantData,
        settings: settings ? {
          create: {
            ...settings,
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
      company,
      pastInterviewSessions,
      challengeProgress,
      weeklyActivity,
      ...restOfUserData
    } = userData;

    const createData = {
      ...restOfUserData,
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
      createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
      skills: userData.skills || Prisma.JsonNull,
      areasOfSupport: userData.areasOfSupport || Prisma.JsonNull,
      interests: userData.interests || Prisma.JsonNull,
      offersHelpWith: userData.offersHelpWith || Prisma.JsonNull,
      earnedBadges: userData.earnedBadges || Prisma.JsonNull,
      challengeTopics: userData.challengeTopics || [],
      weeklyActivity: userData.weeklyActivity || [],
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

  // Seed Mock Interview Sessions
  for (const sessionData of sampleMockInterviewSessions) {
    const { answers, ...restSessionData } = sessionData;
    await prisma.mockInterviewSession.upsert({
      where: { id: sessionData.id },
      update: {},
      create: {
        ...restSessionData,
        overallFeedback: sessionData.overallFeedback || Prisma.JsonNull,
        questions: sessionData.questions || Prisma.JsonNull,
        answers: {
          create: answers.map(answer => ({
            ...answer,
            strengths: answer.strengths || [],
            areasForImprovement: answer.areasForImprovement || [],
            suggestedImprovements: answer.suggestedImprovements || [],
          })),
        },
      },
    });
    console.log(`Seeded mock interview session: ${sessionData.topic}`);
  }

  // Seed System Alerts
  for (const alertData of sampleSystemAlerts) {
    await prisma.systemAlert.upsert({
      where: { id: alertData.id },
      update: {},
      create: {
        ...alertData,
        timestamp: new Date(alertData.timestamp),
      },
    });
  }
  console.log(`Seeded ${sampleSystemAlerts.length} system alerts.`);

  // Seed Daily Challenges
  for (const challengeData of sampleChallenges) {
    await prisma.dailyChallenge.upsert({
      where: { id: challengeData.id },
      update: {},
      create: {
        ...challengeData,
        date: challengeData.date ? new Date(challengeData.date) : null,
        tasks: challengeData.tasks || Prisma.JsonNull,
      },
    });
  }
  console.log(`Seeded ${sampleChallenges.length} daily challenges.`);

  // Seed Product Companies
  for (const companyData of sampleProductCompanies) {
    await prisma.productCompany.upsert({
      where: { id: companyData.id },
      update: {},
      create: companyData,
    });
  }
  console.log(`Seeded ${sampleProductCompanies.length} product companies.`);

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
