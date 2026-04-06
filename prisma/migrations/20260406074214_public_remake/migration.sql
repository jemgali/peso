/*
  Warnings:

  - You are about to drop the column `profile_present_address` on the `profile_address` table. All the data in the column will be lost.
  - You are about to drop the column `profile_end_year` on the `profile_education` table. All the data in the column will be lost.
  - You are about to drop the column `profile_is_currently_enrolled` on the `profile_education` table. All the data in the column will be lost.
  - You are about to drop the column `profile_is_graduated` on the `profile_education` table. All the data in the column will be lost.
  - You are about to drop the column `profile_level` on the `profile_education` table. All the data in the column will be lost.
  - You are about to drop the column `profile_school_name` on the `profile_education` table. All the data in the column will be lost.
  - You are about to drop the column `profile_start_year` on the `profile_education` table. All the data in the column will be lost.
  - You are about to drop the column `profile_track_course` on the `profile_education` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profile_id]` on the table `profile_education` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "profile_education_profile_id_idx";

-- AlterTable
ALTER TABLE "profile_address" DROP COLUMN "profile_present_address",
ADD COLUMN     "profile_house_street" TEXT;

-- AlterTable
ALTER TABLE "profile_education" DROP COLUMN "profile_end_year",
DROP COLUMN "profile_is_currently_enrolled",
DROP COLUMN "profile_is_graduated",
DROP COLUMN "profile_level",
DROP COLUMN "profile_school_name",
DROP COLUMN "profile_start_year",
DROP COLUMN "profile_track_course",
ADD COLUMN     "grade_year" TEXT,
ADD COLUMN     "school_name" TEXT,
ADD COLUMN     "school_year" TEXT,
ADD COLUMN     "track_course" TEXT;

-- AlterTable
ALTER TABLE "profile_personal" ADD COLUMN     "profile_disability" TEXT,
ADD COLUMN     "profile_email" TEXT,
ADD COLUMN     "profile_pwd_id" TEXT,
ADD COLUMN     "profile_religion" TEXT;

-- CreateTable
CREATE TABLE "profile_family" (
    "profile_id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "father_name" TEXT,
    "father_occupation" TEXT,
    "father_contact" TEXT,
    "mother_maiden_name" TEXT,
    "mother_occupation" TEXT,
    "mother_contact" TEXT,
    "number_of_siblings" INTEGER,
    "siblings" JSONB,

    CONSTRAINT "profile_family_pkey" PRIMARY KEY ("family_id")
);

-- CreateTable
CREATE TABLE "profile_guardian" (
    "profile_id" TEXT NOT NULL,
    "guardian_id" TEXT NOT NULL,
    "guardian_name" TEXT,
    "guardian_contact" TEXT,
    "guardian_address" TEXT,
    "guardian_age" INTEGER,
    "guardian_occupation" TEXT,
    "guardian_relationship" TEXT,

    CONSTRAINT "profile_guardian_pkey" PRIMARY KEY ("guardian_id")
);

-- CreateTable
CREATE TABLE "profile_benefactor" (
    "profile_id" TEXT NOT NULL,
    "benefactor_id" TEXT NOT NULL,
    "benefactor_name" TEXT,
    "benefactor_relationship" TEXT,

    CONSTRAINT "profile_benefactor_pkey" PRIMARY KEY ("benefactor_id")
);

-- CreateTable
CREATE TABLE "profile_skills" (
    "profile_id" TEXT NOT NULL,
    "skills_id" TEXT NOT NULL,
    "skills" JSONB,

    CONSTRAINT "profile_skills_pkey" PRIMARY KEY ("skills_id")
);

-- CreateTable
CREATE TABLE "profile_documents" (
    "profile_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "documents" JSONB,

    CONSTRAINT "profile_documents_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "profile_spes" (
    "profile_id" TEXT NOT NULL,
    "spes_id" TEXT NOT NULL,
    "is_four_ps_beneficiary" BOOLEAN,
    "application_year" INTEGER,
    "motivation" TEXT,
    "remarks" TEXT,

    CONSTRAINT "profile_spes_pkey" PRIMARY KEY ("spes_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_family_profile_id_key" ON "profile_family"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_guardian_profile_id_key" ON "profile_guardian"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_benefactor_profile_id_key" ON "profile_benefactor"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_skills_profile_id_key" ON "profile_skills"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_documents_profile_id_key" ON "profile_documents"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_spes_profile_id_key" ON "profile_spes"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_education_profile_id_key" ON "profile_education"("profile_id");

-- AddForeignKey
ALTER TABLE "profile_family" ADD CONSTRAINT "profile_family_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_guardian" ADD CONSTRAINT "profile_guardian_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_benefactor" ADD CONSTRAINT "profile_benefactor_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_documents" ADD CONSTRAINT "profile_documents_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_spes" ADD CONSTRAINT "profile_spes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;
