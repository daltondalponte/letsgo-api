/*
  Warnings:

  - A unique constraint covering the columns `[ticket_id]` on the table `ticket_cupons` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ticket_cupons_ticket_id_cupom_key";

-- CreateIndex
CREATE UNIQUE INDEX "ticket_cupons_ticket_id_key" ON "ticket_cupons"("ticket_id");
