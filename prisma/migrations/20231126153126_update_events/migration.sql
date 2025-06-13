/*
  Warnings:

  - A unique constraint covering the columns `[establishmentId,dateTimestamp]` on the table `events` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "events_establishmentId_dateTimestamp_key" ON "events"("establishmentId", "dateTimestamp");
