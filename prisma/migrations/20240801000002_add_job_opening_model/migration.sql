-- CreateTable
CREATE TABLE "JobOpening" (
    "id" TEXT NOT NULL,
    "tenantId" VARCHAR(255) NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "datePosted" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "postedByAlumniId" VARCHAR(255) NOT NULL,
    "alumniName" TEXT NOT NULL,
    "applicationLink" TEXT,

    CONSTRAINT "JobOpening_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobOpening" ADD CONSTRAINT "JobOpening_postedByAlumniId_fkey" FOREIGN KEY ("postedByAlumniId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOpening" ADD CONSTRAINT "JobOpening_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
