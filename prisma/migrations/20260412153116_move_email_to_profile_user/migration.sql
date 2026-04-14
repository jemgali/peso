/*
  Warnings:

  - You are about to drop the column `profile_email` on the `profile_personal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profile_personal" DROP COLUMN "profile_email";

-- AlterTable
ALTER TABLE "profile_user" ADD COLUMN     "profile_email" TEXT,
ALTER COLUMN "profile_last_name" DROP NOT NULL,
ALTER COLUMN "profile_first_name" DROP NOT NULL;
