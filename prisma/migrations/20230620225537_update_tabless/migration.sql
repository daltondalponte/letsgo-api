/*
  Warnings:

  - Added the required column `coordinates_event` to the `Establishment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity_available` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Establishment" ADD COLUMN     "coordinates_event" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "coordinates_event" JSONB;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "quantity_available" INTEGER NOT NULL;
