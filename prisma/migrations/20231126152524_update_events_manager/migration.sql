-- CreateEnum
CREATE TYPE "Recurso" AS ENUM ('CUPOMINSERT', 'CUPOMDELETE', 'CUPOMUPDATE', 'EVENTUPDATE', 'TICKETINSERT', 'TICKETUPDATE', 'TICKETDELETE');

-- AlterTable
ALTER TABLE "events_manager" ADD COLUMN     "recursos" "Recurso"[];
