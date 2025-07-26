-- CreateTable
CREATE TABLE "MockInterviewSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "jobDescription" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timerPerQuestion" INTEGER,
    "difficulty" TEXT,
    "questionCategories" TEXT[],
    "overallScore" DOUBLE PRECISION,
    "overallFeedback" JSONB,
    "questions" JSONB NOT NULL,

    CONSTRAINT "MockInterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInterviewAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "aiFeedback" TEXT,
    "aiScore" DOUBLE PRECISION,
    "strengths" TEXT[],
    "areasForImprovement" TEXT[],
    "suggestedImprovements" TEXT[],
    "isRecording" BOOLEAN,

    CONSTRAINT "MockInterviewAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemAlert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linkTo" TEXT,
    "linkText" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SystemAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT,
    "category" TEXT,
    "solution" TEXT,
    "xpReward" INTEGER,
    "tasks" JSONB,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DailyChallengeToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DailyChallengeToUser_AB_unique" ON "_DailyChallengeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DailyChallengeToUser_B_index" ON "_DailyChallengeToUser"("B");

-- AddForeignKey
ALTER TABLE "MockInterviewSession" ADD CONSTRAINT "MockInterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockInterviewAnswer" ADD CONSTRAINT "MockInterviewAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MockInterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailyChallengeToUser" ADD CONSTRAINT "_DailyChallengeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "DailyChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailyChallengeToUser" ADD CONSTRAINT "_DailyChallengeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
