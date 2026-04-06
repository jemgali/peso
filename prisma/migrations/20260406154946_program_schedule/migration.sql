-- CreateTable
CREATE TABLE "program" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_event_start_date_idx" ON "schedule_event"("start_date");

-- CreateIndex
CREATE INDEX "schedule_event_type_idx" ON "schedule_event"("type");
