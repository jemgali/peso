/*
  Warnings:

  - You are about to drop the column `submission_number` on the `application_submission` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ApplicationApplicantType" AS ENUM ('NEW', 'SPES_BABY');

-- AlterTable
ALTER TABLE "application_submission" DROP COLUMN "submission_number",
ADD COLUMN     "applicant_type" "ApplicationApplicantType" NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "application_submission_applicant_type_idx" ON "application_submission"("applicant_type");
