/*
  Warnings:

  - You are about to drop the column `cupomId` on the `tickets_sale` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tickets_sale" DROP CONSTRAINT "tickets_sale_cupomId_fkey";

-- AlterTable
ALTER TABLE "tickets_sale" DROP COLUMN "cupomId",
ADD COLUMN     "cupom_id" TEXT;

-- AddForeignKey
ALTER TABLE "tickets_sale" ADD CONSTRAINT "tickets_sale_cupom_id_fkey" FOREIGN KEY ("cupom_id") REFERENCES "cupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
