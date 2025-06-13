/*
  Warnings:

  - A unique constraint covering the columns `[ticketId,descont_percent]` on the table `cupons` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cupons_ticketId_descont_percent_key" ON "cupons"("ticketId", "descont_percent");
