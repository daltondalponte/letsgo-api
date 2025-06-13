/*
  Warnings:

  - You are about to drop the column `isActive` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `events_approvals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[event_id]` on the table `events_approvals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `event_id` to the `events_approvals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events_approvals" DROP CONSTRAINT "events_approvals_eventId_fkey";

-- DropIndex
DROP INDEX "events_approvals_eventId_key";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "isActive",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "events_approvals" DROP COLUMN "eventId",
ADD COLUMN     "event_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "events_approvals_event_id_key" ON "events_approvals"("event_id");

-- AddForeignKey
ALTER TABLE "events_approvals" ADD CONSTRAINT "events_approvals_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
