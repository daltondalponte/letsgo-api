/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `events_approvals` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "events_approvals_eventId_key" ON "events_approvals"("eventId");
