/*
  Warnings:

  - You are about to drop the column `ticket_sale_id` on the `cupons_aplicados` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticketSaleId]` on the table `cupons_aplicados` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "cupons_aplicados_ticket_sale_id_key";

-- AlterTable
ALTER TABLE "cupons_aplicados" DROP COLUMN "ticket_sale_id";

-- CreateIndex
CREATE UNIQUE INDEX "cupons_aplicados_ticketSaleId_key" ON "cupons_aplicados"("ticketSaleId");
