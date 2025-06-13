/*
  Warnings:

  - You are about to drop the column `eventId` on the `cupom_audit` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `event_audit` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `ticket_audit` table. All the data in the column will be lost.
  - Added the required column `entityId` to the `cupom_audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityId` to the `event_audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityId` to the `ticket_audit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cupom_audit" DROP CONSTRAINT "cupom_audit_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_audit" DROP CONSTRAINT "event_audit_eventId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_audit" DROP CONSTRAINT "ticket_audit_eventId_fkey";

-- AlterTable
ALTER TABLE "cupom_audit" DROP COLUMN "eventId",
ADD COLUMN     "entityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "event_audit" DROP COLUMN "eventId",
ADD COLUMN     "entityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ticket_audit" DROP COLUMN "eventId",
ADD COLUMN     "entityId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "event_audit" ADD CONSTRAINT "event_audit_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_audit" ADD CONSTRAINT "ticket_audit_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupom_audit" ADD CONSTRAINT "cupom_audit_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "cupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
