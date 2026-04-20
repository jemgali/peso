-- CreateEnum
CREATE TYPE "SpesSelectionStatus" AS ENUM ('PENDING', 'WAITLISTED', 'GRANTEE', 'DENIED');

-- AlterTable
ALTER TABLE "spes_workflow"
ADD COLUMN "selection_status" "SpesSelectionStatus" NOT NULL DEFAULT 'PENDING';

-- Preserve existing waitlist/grantee flags and derive denied from failed exam results.
UPDATE "spes_workflow"
SET "selection_status" = CASE
  WHEN "is_grantee" = true THEN 'GRANTEE'::"SpesSelectionStatus"
  WHEN "is_waitlisted" = true THEN 'WAITLISTED'::"SpesSelectionStatus"
  WHEN "exam_result" = 'FAILED' THEN 'DENIED'::"SpesSelectionStatus"
  ELSE 'PENDING'::"SpesSelectionStatus"
END;

-- DropIndex
DROP INDEX "spes_workflow_is_grantee_idx";

-- AlterTable
ALTER TABLE "spes_workflow"
DROP COLUMN "is_grantee",
DROP COLUMN "is_waitlisted";

-- CreateIndex
CREATE INDEX "spes_workflow_selection_status_idx" ON "spes_workflow"("selection_status");
