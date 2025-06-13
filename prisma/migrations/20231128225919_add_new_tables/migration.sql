/*
  Warnings:

  - Added the required column `eventId` to the `event_audit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event_audit" ADD COLUMN     "eventId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ticket_audit" (
    "id" TEXT NOT NULL,
    "useruid" TEXT NOT NULL,
    "modificationType" "ModificationType" NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "ticket_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cupom_audit" (
    "id" TEXT NOT NULL,
    "useruid" TEXT NOT NULL,
    "modificationType" "ModificationType" NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "cupom_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_audit_id_idx" ON "ticket_audit"("id");

-- CreateIndex
CREATE INDEX "cupom_audit_id_idx" ON "cupom_audit"("id");

-- AddForeignKey
ALTER TABLE "event_audit" ADD CONSTRAINT "event_audit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_audit" ADD CONSTRAINT "ticket_audit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_audit" ADD CONSTRAINT "ticket_audit_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupom_audit" ADD CONSTRAINT "cupom_audit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "cupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupom_audit" ADD CONSTRAINT "cupom_audit_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
