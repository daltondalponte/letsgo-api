-- DropForeignKey
ALTER TABLE "cupons" DROP CONSTRAINT "cupons_event_id_fkey";

-- AlterTable
ALTER TABLE "cupons" ALTER COLUMN "event_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cupons" ADD CONSTRAINT "cupons_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
