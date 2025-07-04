/*
  Warnings:

  - A unique constraint covering the columns `[userOwnerUid,userTicketTakerUid]` on the table `ticket_takers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ticket_takers_userTicketTakerUid_key";

-- CreateIndex
CREATE UNIQUE INDEX "ticket_takers_userOwnerUid_userTicketTakerUid_key" ON "ticket_takers"("userOwnerUid", "userTicketTakerUid");
