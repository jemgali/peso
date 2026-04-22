-- CreateTable
CREATE TABLE "profile_spes_availment" (
    "profile_id" TEXT NOT NULL,
    "availment_id" TEXT NOT NULL,
    "year_of_availment" INTEGER NOT NULL,
    "assigned_office" TEXT NOT NULL,
    "availment_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profile_spes_availment_pkey" PRIMARY KEY ("availment_id")
);

-- CreateTable
CREATE TABLE "schedule_event_recipient" (
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_event_recipient_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateIndex
CREATE INDEX "profile_spes_availment_profile_id_idx" ON "profile_spes_availment"("profile_id");

-- CreateIndex
CREATE INDEX "schedule_event_recipient_user_id_idx" ON "schedule_event_recipient"("user_id");

-- AddForeignKey
ALTER TABLE "profile_spes_availment" ADD CONSTRAINT "profile_spes_availment_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_event_recipient" ADD CONSTRAINT "schedule_event_recipient_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "schedule_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_event_recipient" ADD CONSTRAINT "schedule_event_recipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
