/*
  Warnings:

  - You are about to drop the column `userOwnerUid` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - Added the required column `isActive` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_userOwnerUid_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "userOwnerUid",
ADD COLUMN     "establishmentId" TEXT,
ADD COLUMN     "useruid" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
ADD COLUMN     "isActive" BOOLEAN NOT NULL;

-- DropEnum
DROP TYPE "DocumentType";

-- CreateTable
CREATE TABLE "Establishment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "userOwnerUid" TEXT NOT NULL,
    "photos" TEXT[],

    CONSTRAINT "Establishment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Establishment" ADD CONSTRAINT "Establishment_userOwnerUid_fkey" FOREIGN KEY ("userOwnerUid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
