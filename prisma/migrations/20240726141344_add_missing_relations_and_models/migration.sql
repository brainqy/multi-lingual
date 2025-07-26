/*
  Warnings:

  - You are about to drop the column `referredByAffiliateSignupId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referringUserId` on the `AffiliateSignup` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[newUserId]` on the table `AffiliateSignup` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `newUserId` to the `AffiliateSignup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_referredByAffiliateSignupId_fkey";

-- DropIndex
DROP INDEX "User_referredByAffiliateSignupId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "referredByAffiliateSignupId";

-- AlterTable
ALTER TABLE "AffiliateSignup" DROP COLUMN "referringUserId",
ADD COLUMN     "newUserId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeScanHistoryItem" (
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

    CONSTRAINT "ResumeScanHistoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateSignup_newUserId_key" ON "AffiliateSignup"("newUserId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeScanHistoryItem" ADD CONSTRAINT "ResumeScanHistoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateSignup" ADD CONSTRAINT "AffiliateSignup_newUserId_fkey" FOREIGN KEY ("newUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
