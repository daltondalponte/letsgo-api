/*
  Warnings:

  - Added the required column `event_id` to the `cupons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cupons" ADD COLUMN     "event_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "cupons" ADD CONSTRAINT "cupons_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
