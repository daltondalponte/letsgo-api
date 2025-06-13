/*
  Warnings:

  - You are about to drop the column `establishmentId` on the `ticket_takers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ticket_takers" DROP CONSTRAINT "ticket_takers_establishmentId_fkey";

-- AlterTable
ALTER TABLE "ticket_takers" DROP COLUMN "establishmentId";
