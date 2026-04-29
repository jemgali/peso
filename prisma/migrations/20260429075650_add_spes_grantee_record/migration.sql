-- CreateTable
CREATE TABLE "spes_grantee_record" (
    "record_id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "punctuality" INTEGER NOT NULL,
    "respect" INTEGER NOT NULL,
    "honesty" INTEGER NOT NULL,
    "adaptability" INTEGER NOT NULL,
    "expression" INTEGER NOT NULL,
    "initiative" INTEGER NOT NULL,
    "following" INTEGER NOT NULL,
    "efficiency" INTEGER NOT NULL,
    "creativity" INTEGER NOT NULL,
    "remarks" TEXT,
    "rated_by" TEXT NOT NULL,
    "document_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spes_grantee_record_pkey" PRIMARY KEY ("record_id")
);

-- CreateIndex
CREATE INDEX "spes_grantee_record_workflow_id_idx" ON "spes_grantee_record"("workflow_id");

-- AddForeignKey
ALTER TABLE "spes_grantee_record" ADD CONSTRAINT "spes_grantee_record_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "spes_workflow"("workflow_id") ON DELETE CASCADE ON UPDATE CASCADE;
