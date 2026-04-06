-- CreateTable
CREATE TABLE "application_submission" (
    "profile_id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submission_number" INTEGER NOT NULL DEFAULT 1,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_submission_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "application_review" (
    "submission_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "overall_comments" TEXT,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "review_field_feedback" (
    "review_id" TEXT NOT NULL,
    "feedback_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,

    CONSTRAINT "review_field_feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "review_document_feedback" (
    "review_id" TEXT NOT NULL,
    "feedback_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,

    CONSTRAINT "review_document_feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "notification" (
    "user_id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE INDEX "application_submission_profile_id_idx" ON "application_submission"("profile_id");

-- CreateIndex
CREATE INDEX "application_submission_status_idx" ON "application_submission"("status");

-- CreateIndex
CREATE INDEX "application_review_submission_id_idx" ON "application_review"("submission_id");

-- CreateIndex
CREATE INDEX "application_review_reviewer_id_idx" ON "application_review"("reviewer_id");

-- CreateIndex
CREATE INDEX "review_field_feedback_review_id_idx" ON "review_field_feedback"("review_id");

-- CreateIndex
CREATE INDEX "review_document_feedback_review_id_idx" ON "review_document_feedback"("review_id");

-- CreateIndex
CREATE INDEX "notification_user_id_idx" ON "notification"("user_id");

-- CreateIndex
CREATE INDEX "notification_is_read_idx" ON "notification"("is_read");

-- AddForeignKey
ALTER TABLE "application_submission" ADD CONSTRAINT "application_submission_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_review" ADD CONSTRAINT "application_review_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "application_submission"("submission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_review" ADD CONSTRAINT "application_review_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_field_feedback" ADD CONSTRAINT "review_field_feedback_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "application_review"("review_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_document_feedback" ADD CONSTRAINT "review_document_feedback_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "application_review"("review_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
