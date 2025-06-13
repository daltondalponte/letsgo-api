/*
  Warnings:

  - You are about to drop the column `useruid` on the `tickets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_useruid_fkey";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "useruid";
