/*
  Warnings:

  - Added the required column `useruid` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "useruid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
