/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `profile_personal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `profile_user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "auth"."account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "auth"."session" DROP CONSTRAINT "session_userId_fkey";

-- DropForeignKey
ALTER TABLE "profile_personal" DROP CONSTRAINT "profile_personal_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "profile_user" DROP CONSTRAINT "profile_user_user_id_fkey";

-- AlterTable
ALTER TABLE "auth"."account" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "auth"."session" ADD COLUMN     "impersonatedBy" TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "auth"."user" DROP CONSTRAINT "user_pkey",
ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "role" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "profile_personal" DROP CONSTRAINT "profile_personal_pkey",
ALTER COLUMN "profile_id" SET DATA TYPE TEXT,
ALTER COLUMN "personal_id" DROP DEFAULT,
ALTER COLUMN "personal_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "profile_personal_pkey" PRIMARY KEY ("personal_id");

-- AlterTable
ALTER TABLE "profile_user" DROP CONSTRAINT "profile_user_pkey",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "profile_id" DROP DEFAULT,
ALTER COLUMN "profile_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "profile_user_pkey" PRIMARY KEY ("profile_id");

-- CreateTable
CREATE TABLE "profile_address" (
    "profile_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL,
    "profile_present_address" TEXT,
    "profile_barangay" TEXT,
    "profile_municipality" TEXT,
    "profile_province" TEXT,

    CONSTRAINT "profile_address_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "profile_education" (
    "profile_id" TEXT NOT NULL,
    "education_id" TEXT NOT NULL,
    "profile_level" TEXT NOT NULL,
    "profile_school_name" TEXT,
    "profile_track_course" TEXT,
    "profile_start_year" INTEGER,
    "profile_end_year" INTEGER,
    "profile_is_graduated" BOOLEAN,
    "profile_is_currently_enrolled" BOOLEAN,

    CONSTRAINT "profile_education_pkey" PRIMARY KEY ("education_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_address_profile_id_key" ON "profile_address"("profile_id");

-- CreateIndex
CREATE INDEX "profile_education_profile_id_idx" ON "profile_education"("profile_id");

-- AddForeignKey
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_user" ADD CONSTRAINT "profile_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_personal" ADD CONSTRAINT "profile_personal_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_address" ADD CONSTRAINT "profile_address_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_education" ADD CONSTRAINT "profile_education_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;
