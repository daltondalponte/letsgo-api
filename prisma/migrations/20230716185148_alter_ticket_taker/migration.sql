/*
  Warnings:

  - A unique constraint covering the columns `[userTicketTakerUid]` on the table `ticket_takers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ticket_takers_userTicketTakerUid_key" ON "ticket_takers"("userTicketTakerUid");
