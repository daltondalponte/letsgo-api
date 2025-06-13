/*
  Warnings:

  - Changed the type of `document` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
DROP COLUMN "document",
ADD COLUMN     "document" TEXT NOT NULL;
