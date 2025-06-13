/*
  Warnings:

  - You are about to drop the column `eventId` on the `events_manager` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `events_manager` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[useruid,event_id]` on the table `events_manager` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `cupom_audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `event_audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_id` to the `events_manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `events_manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ticket_audit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events_manager" DROP CONSTRAINT "events_manager_eventId_fkey";

-- DropIndex
DROP INDEX "events_manager_useruid_eventId_key";

-- AlterTable
ALTER TABLE "cupom_audit" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "event_audit" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "events_manager" DROP COLUMN "eventId",
DROP COLUMN "updatedAt",
ADD COLUMN     "event_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ticket_audit" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "events_manager_useruid_event_id_key" ON "events_manager"("useruid", "event_id");

-- AddForeignKey
ALTER TABLE "events_manager" ADD CONSTRAINT "events_manager_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
