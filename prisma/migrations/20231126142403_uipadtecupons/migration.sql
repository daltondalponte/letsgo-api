/*
  Warnings:

  - A unique constraint covering the columns `[ticketId,code]` on the table `cupons` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cupons_ticketId_code_key" ON "cupons"("ticketId", "code");
