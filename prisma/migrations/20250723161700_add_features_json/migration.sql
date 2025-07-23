-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(255) NOT NULL,
    "tenantId" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT DEFAULT 'active',
    "lastLogin" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "mobileNumber" TEXT,
    "currentAddress" TEXT,
    "graduationYear" TEXT,
    "degreeProgram" TEXT,
    "department" TEXT,
    "currentJobTitle" TEXT,
    "currentOrganization" TEXT,
    "industry" TEXT,
    "workLocation" TEXT,
    "linkedInProfile" TEXT,
    "yearsOfExperience" TEXT,
    "skills" JSONB,
    "areasOfSupport" JSONB,
    "timeCommitment" TEXT,
    "preferredEngagementMode" TEXT,
    "otherComments" TEXT,
    "lookingForSupportType" TEXT,
    "helpNeededDescription" TEXT,
    "shareProfileConsent" BOOLEAN DEFAULT true,
    "featureInSpotlightConsent" BOOLEAN DEFAULT false,
    "profilePictureUrl" TEXT,
    "resumeText" TEXT,
    "careerInterests" TEXT,
    "bio" TEXT,
    "interests" JSONB,
    "offersHelpWith" JSONB,
    "appointmentCoinCost" INTEGER,
    "xpPoints" INTEGER DEFAULT 0,
    "dailyStreak" INTEGER DEFAULT 0,
    "longestStreak" INTEGER DEFAULT 0,
    "totalActiveDays" INTEGER DEFAULT 0,
    "weeklyActivity" JSONB,
    "referralCode" TEXT,
    "earnedBadges" JSONB,
    "affiliateCode" TEXT,
    "interviewCredits" INTEGER DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDistinguished" BOOLEAN DEFAULT false,
    "userApiKey" TEXT,
    "challengeTopics" JSONB,
    "shortBio" TEXT,
    "university" TEXT,
    "sessionId" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "allowPublicSignup" BOOLEAN NOT NULL DEFAULT true,
    "customLogoUrl" TEXT,
    "primaryColor" TEXT,
    "accentColor" TEXT,
    "features" JSONB,
    "emailTemplates" JSONB,

    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dateApplied" TIMESTAMP(3) NOT NULL,
    "jobDescription" TEXT,
    "location" TEXT,
    "salary" TEXT,
    "reminderDate" TIMESTAMP(3),
    "sourceJobOpeningId" TEXT,
    "applicationUrl" TEXT,
    "resumeIdUsed" TEXT,
    "coverLetterText" TEXT,
    "interviews" JSONB,
    "notes" JSONB,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userAvatar" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "type" TEXT NOT NULL,
    "tags" JSONB,
    "imageUrl" TEXT,
    "pollOptions" JSONB,
    "eventTitle" TEXT,
    "eventDate" TIMESTAMP(3),
    "eventLocation" TEXT,
    "attendees" INTEGER,
    "capacity" INTEGER,
    "assignedTo" TEXT,
    "status" TEXT,
    "moderationStatus" TEXT NOT NULL,
    "flagCount" INTEGER NOT NULL,
    "comments" JSONB,
    "bookmarkedBy" JSONB,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "xpReward" INTEGER,
    "triggerCondition" TEXT,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeScanHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "resumeName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "resumeTextSnapshot" TEXT NOT NULL,
    "jobDescriptionText" TEXT NOT NULL,
    "scanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchScore" INTEGER,
    "bookmarked" BOOLEAN DEFAULT false,

    CONSTRAINT "ResumeScanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requesterUserId" TEXT NOT NULL,
    "alumniUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "meetingLink" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "costInCoins" INTEGER,
    "withUser" TEXT NOT NULL,
    "reminderDate" TIMESTAMP(3),

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_affiliateCode_key" ON "User"("affiliateCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_sessionId_key" ON "User"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_domain_key" ON "Tenant"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettings_tenantId_key" ON "TenantSettings"("tenantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
