/*
  Warnings:

  - You are about to drop the column `useruid` on the `cupons` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cupons" DROP CONSTRAINT "cupons_useruid_fkey";

-- AlterTable
ALTER TABLE "cupons" DROP COLUMN "useruid";
