/*
  Warnings:

  - You are about to drop the column `comments` on the `CommunityPost` table. All the data in the column will be lost.
  - The `tags` column on the `CommunityPost` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `bookmarkedBy` column on the `CommunityPost` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `interviews` on the `JobApplication` table. All the data in the column will be lost.
  - The `notes` column on the `JobApplication` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Tenant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[sessionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `Activity` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- DropIndex
DROP INDEX "Tenant_domain_key";

-- DropIndex
DROP INDEX "User_affiliateCode_key";

-- DropIndex
DROP INDEX "User_referralCode_key";

-- DropIndex
DROP INDEX "User_sessionId_key";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "tenantId" DROP NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "tenantId" DROP NOT NULL,
ALTER COLUMN "dateTime" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "reminderDate" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "CommunityPost" DROP COLUMN "comments",
ALTER COLUMN "tenantId" DROP NOT NULL,
DROP COLUMN "tags",
ADD COLUMN     "tags" TEXT[],
DROP COLUMN "bookmarkedBy",
ADD COLUMN     "bookmarkedBy" TEXT[];

-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "interviews",
ALTER COLUMN "tenantId" DROP NOT NULL,
ALTER COLUMN "dateApplied" SET DATA TYPE DATE,
ALTER COLUMN "reminderDate" SET DATA TYPE TIMESTAMP(6),
DROP COLUMN "notes",
ADD COLUMN     "notes" TEXT[];

-- AlterTable
ALTER TABLE "ResumeScanHistory" ALTER COLUMN "tenantId" DROP NOT NULL,
ALTER COLUMN "bookmarked" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "company" TEXT,
ADD COLUMN     "pastInterviewSessions" JSONB,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "tenantId" DROP NOT NULL,
ALTER COLUMN "tenantId" SET DATA TYPE TEXT,
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "lastLogin" DROP DEFAULT,
ALTER COLUMN "dateOfBirth" SET DATA TYPE DATE,
ALTER COLUMN "shareProfileConsent" DROP DEFAULT,
ALTER COLUMN "featureInSpotlightConsent" DROP DEFAULT,
ALTER COLUMN "xpPoints" DROP DEFAULT,
ALTER COLUMN "dailyStreak" DROP DEFAULT,
ALTER COLUMN "longestStreak" DROP DEFAULT,
ALTER COLUMN "totalActiveDays" DROP DEFAULT,
ALTER COLUMN "interviewCredits" DROP DEFAULT,
ALTER COLUMN "isDistinguished" DROP DEFAULT,
ALTER COLUMN "sessionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "type" TEXT NOT NULL,
    "interviewer" TEXT NOT NULL,
    "interviewerMobile" TEXT,
    "interviewerEmail" TEXT,
    "notes" TEXT[],

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userAvatar" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "CommunityComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_sessionId_key" ON "User"("sessionId" DESC);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeScanHistory" ADD CONSTRAINT "ResumeScanHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_alumniUserId_fkey" FOREIGN KEY ("alumniUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
