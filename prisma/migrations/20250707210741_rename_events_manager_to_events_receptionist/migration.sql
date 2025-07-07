/*
  Warnings:

  - You are about to drop the `events_manager` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "events_manager" DROP CONSTRAINT "events_manager_event_id_fkey";

-- DropForeignKey
ALTER TABLE "events_manager" DROP CONSTRAINT "events_manager_useruid_fkey";

-- DropTable
DROP TABLE "events_manager";

-- CreateTable
CREATE TABLE "events_receptionist" (
    "id" TEXT NOT NULL,
    "recursos" "Recurso"[],
    "useruid" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_receptionist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_receptionist_id_idx" ON "events_receptionist"("id");

-- CreateIndex
CREATE UNIQUE INDEX "events_receptionist_useruid_event_id_key" ON "events_receptionist"("useruid", "event_id");

-- AddForeignKey
ALTER TABLE "events_receptionist" ADD CONSTRAINT "events_receptionist_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_receptionist" ADD CONSTRAINT "events_receptionist_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
