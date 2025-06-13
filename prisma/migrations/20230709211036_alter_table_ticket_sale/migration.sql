/*
  Warnings:

  - Added the required column `useruid` to the `tickets_sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets_sale" ADD COLUMN     "useruid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tickets_sale" ADD CONSTRAINT "tickets_sale_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
