/*
  Warnings:

  - Added the required column `userOwnerUid` to the `ticket_takers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ticket_takers" DROP CONSTRAINT "ticket_takers_eventId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_takers" DROP CONSTRAINT "ticket_takers_userTicketTakerUid_fkey";

-- DropIndex
DROP INDEX "ticket_takers_id_eventId_userTicketTakerUid_idx";

-- AlterTable
ALTER TABLE "ticket_takers" ADD COLUMN     "establishmentId" TEXT,
ADD COLUMN     "userOwnerUid" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ticket_takers_id_userOwnerUid_userTicketTakerUid_idx" ON "ticket_takers"("id", "userOwnerUid", "userTicketTakerUid");

-- AddForeignKey
ALTER TABLE "ticket_takers" ADD CONSTRAINT "ticket_takers_userOwnerUid_fkey" FOREIGN KEY ("userOwnerUid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_takers" ADD CONSTRAINT "ticket_takers_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
