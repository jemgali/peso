-- AlterTable: Add batch_year with a default first, backfill, then enforce NOT NULL
ALTER TABLE "spes_batch" ADD COLUMN "batch_year" INTEGER;

-- Backfill batch_year from start_date for existing rows
UPDATE "spes_batch" SET "batch_year" = EXTRACT(YEAR FROM "start_date")::INTEGER WHERE "batch_year" IS NULL;

-- Now set NOT NULL constraint
ALTER TABLE "spes_batch" ALTER COLUMN "batch_year" SET NOT NULL;

-- CreateTable
CREATE TABLE "spes_application_period" (
    "period_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT false,
    "open_date" TIMESTAMP(3),
    "close_date" TIMESTAMP(3),
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spes_application_period_pkey" PRIMARY KEY ("period_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "spes_application_period_year_key" ON "spes_application_period"("year");

-- CreateIndex
CREATE INDEX "spes_application_period_year_idx" ON "spes_application_period"("year");

-- CreateIndex
CREATE INDEX "spes_batch_batch_year_idx" ON "spes_batch"("batch_year");

-- CreateIndex
CREATE UNIQUE INDEX "spes_batch_batch_name_batch_year_key" ON "spes_batch"("batch_name", "batch_year");

-- AddForeignKey
ALTER TABLE "spes_application_period" ADD CONSTRAINT "spes_application_period_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "auth"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
