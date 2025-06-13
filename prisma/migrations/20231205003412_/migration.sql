/*
  Warnings:

  - You are about to drop the column `ticketId` on the `cupons` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `cupons_aplicados` table. All the data in the column will be lost.
  - You are about to drop the column `cupomId` on the `cupons_aplicados` table. All the data in the column will be lost.
  - You are about to drop the column `ticketSaleId` on the `cupons_aplicados` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `cupons_aplicados` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticket_sale_id,cupom_id]` on the table `cupons_aplicados` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeAccountId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_at` to the `cupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cupom_id` to the `cupons_aplicados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticket_sale_id` to the `cupons_aplicados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `cupons_aplicados` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cupons" DROP CONSTRAINT "cupons_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "cupons_aplicados" DROP CONSTRAINT "cupons_aplicados_cupomId_fkey";

-- DropForeignKey
ALTER TABLE "cupons_aplicados" DROP CONSTRAINT "cupons_aplicados_ticketSaleId_fkey";

-- DropIndex
DROP INDEX "cupons_ticketId_code_key";

-- DropIndex
DROP INDEX "cupons_ticketId_descont_percent_key";

-- DropIndex
DROP INDEX "cupons_aplicados_ticketSaleId_key";

-- AlterTable
ALTER TABLE "cupons" DROP COLUMN "ticketId",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "cupons_aplicados" DROP COLUMN "createdAt",
DROP COLUMN "cupomId",
DROP COLUMN "ticketSaleId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "cupom_id" TEXT NOT NULL,
ADD COLUMN     "ticket_sale_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ticket_cupons" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "cupom" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_cupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_cupons_id_idx" ON "ticket_cupons"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_cupons_ticket_id_cupom_key" ON "ticket_cupons"("ticket_id", "cupom");

-- CreateIndex
CREATE UNIQUE INDEX "cupons_aplicados_ticket_sale_id_cupom_id_key" ON "cupons_aplicados"("ticket_sale_id", "cupom_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeAccountId_key" ON "users"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "cupons_aplicados" ADD CONSTRAINT "cupons_aplicados_ticket_sale_id_fkey" FOREIGN KEY ("ticket_sale_id") REFERENCES "tickets_sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupons_aplicados" ADD CONSTRAINT "cupons_aplicados_cupom_id_fkey" FOREIGN KEY ("cupom_id") REFERENCES "cupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_cupons" ADD CONSTRAINT "ticket_cupons_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_cupons" ADD CONSTRAINT "ticket_cupons_cupom_fkey" FOREIGN KEY ("cupom") REFERENCES "cupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
