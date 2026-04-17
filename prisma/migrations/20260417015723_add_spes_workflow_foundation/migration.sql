-- CreateEnum
CREATE TYPE "SpesWorkflowStage" AS ENUM ('APPLICATION_APPROVED', 'INTERVIEW_SCHEDULED', 'PRIORITY_ASSIGNED', 'EXAM_SCHEDULED', 'EXAM_EVALUATED', 'QUALIFIED', 'WAITLISTED', 'GRANTEE_SELECTED', 'DOCUMENTS_RELEASED', 'ORIENTATION_SCHEDULED', 'BATCH_ASSIGNED', 'OFFICE_ASSIGNED');

-- CreateEnum
CREATE TYPE "SpesPriorityLevel" AS ENUM ('HIGH', 'MODERATE', 'LOW');

-- CreateEnum
CREATE TYPE "SpesExamResult" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "spes_exam_settings" (
    "settings_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'spes',
    "total_score" INTEGER NOT NULL DEFAULT 100,
    "passing_threshold_percent" INTEGER NOT NULL DEFAULT 75,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spes_exam_settings_pkey" PRIMARY KEY ("settings_id")
);

-- CreateTable
CREATE TABLE "spes_batch" (
    "batch_id" TEXT NOT NULL,
    "batch_name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "office_name" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spes_batch_pkey" PRIMARY KEY ("batch_id")
);

-- CreateTable
CREATE TABLE "spes_workflow" (
    "workflow_id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "stage" "SpesWorkflowStage" NOT NULL DEFAULT 'APPLICATION_APPROVED',
    "priority" "SpesPriorityLevel",
    "interview_schedule_event_id" TEXT,
    "exam_schedule_event_id" TEXT,
    "orientation_schedule_event_id" TEXT,
    "exam_score" DOUBLE PRECISION,
    "exam_result" "SpesExamResult" NOT NULL DEFAULT 'PENDING',
    "rank_position" INTEGER,
    "is_waitlisted" BOOLEAN NOT NULL DEFAULT false,
    "is_grantee" BOOLEAN NOT NULL DEFAULT false,
    "selected_by_id" TEXT,
    "selected_at" TIMESTAMP(3),
    "batch_id" TEXT,
    "assigned_office" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spes_workflow_pkey" PRIMARY KEY ("workflow_id")
);

-- CreateTable
CREATE TABLE "spes_stage_history" (
    "history_id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "stage" "SpesWorkflowStage" NOT NULL,
    "note" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spes_stage_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "spes_exam_settings_scope_key" ON "spes_exam_settings"("scope");

-- CreateIndex
CREATE INDEX "spes_batch_start_date_idx" ON "spes_batch"("start_date");

-- CreateIndex
CREATE UNIQUE INDEX "spes_workflow_submission_id_key" ON "spes_workflow"("submission_id");

-- CreateIndex
CREATE INDEX "spes_workflow_stage_idx" ON "spes_workflow"("stage");

-- CreateIndex
CREATE INDEX "spes_workflow_priority_idx" ON "spes_workflow"("priority");

-- CreateIndex
CREATE INDEX "spes_workflow_exam_result_idx" ON "spes_workflow"("exam_result");

-- CreateIndex
CREATE INDEX "spes_workflow_is_grantee_idx" ON "spes_workflow"("is_grantee");

-- CreateIndex
CREATE INDEX "spes_stage_history_workflow_id_created_at_idx" ON "spes_stage_history"("workflow_id", "created_at");

-- AddForeignKey
ALTER TABLE "spes_exam_settings" ADD CONSTRAINT "spes_exam_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spes_batch" ADD CONSTRAINT "spes_batch_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spes_workflow" ADD CONSTRAINT "spes_workflow_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "application_submission"("submission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spes_workflow" ADD CONSTRAINT "spes_workflow_interview_schedule_event_id_fkey" FOREIGN KEY ("interview_schedule_event_id") REFERENCES "schedule_event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spes_workflow" ADD CONSTRAINT "spes_workflow_exam_schedule_event_id_fkey" FOREIGN KEY ("exam_schedule_event_id") REFERENCES "schedule_event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spes_workflow" ADD CONSTRAINT "spes_workflow_orientation_schedule_event_id_fkey" FOREIGN KEY ("orientation_schedule_event_id") REFERENCES "schedule_event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spes_workflow" ADD CONSTRAINT "spes_workflow_selected_by_id_fkey" FOREIGN KEY ("selected_by_id") REFERENCES "auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spes_workflow" ADD CONSTRAINT "spes_workflow_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "spes_batch"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spes_stage_history" ADD CONSTRAINT "spes_stage_history_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "spes_workflow"("workflow_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spes_stage_history" ADD CONSTRAINT "spes_stage_history_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
