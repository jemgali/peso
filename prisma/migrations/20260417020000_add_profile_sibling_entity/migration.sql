-- CreateTable
CREATE TABLE "profile_sibling" (
    "profile_id" TEXT NOT NULL,
    "sibling_id" TEXT NOT NULL,
    "sibling_name" TEXT NOT NULL,
    "sibling_age" INTEGER NOT NULL,
    "sibling_occupation" TEXT,
    "sibling_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profile_sibling_pkey" PRIMARY KEY ("sibling_id")
);

-- CreateIndex
CREATE INDEX "profile_sibling_profile_id_idx" ON "profile_sibling"("profile_id");

-- AddForeignKey
ALTER TABLE "profile_sibling" ADD CONSTRAINT "profile_sibling_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_user"("profile_id") ON DELETE CASCADE ON UPDATE CASCADE;

