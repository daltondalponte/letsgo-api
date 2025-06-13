/*
  Warnings:

  - A unique constraint covering the columns `[ticket_sale_id]` on the table `cupons_aplicados` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cupons_aplicados_ticket_sale_id_key" ON "cupons_aplicados"("ticket_sale_id");
