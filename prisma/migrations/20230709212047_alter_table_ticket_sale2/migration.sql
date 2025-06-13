/*
  Warnings:

  - You are about to drop the column `eventId` on the `tickets_sale` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tickets_sale" DROP CONSTRAINT "tickets_sale_eventId_fkey";

-- AlterTable
ALTER TABLE "tickets_sale" DROP COLUMN "eventId";
