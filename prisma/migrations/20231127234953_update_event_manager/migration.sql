/*
  Warnings:

  - The `details` column on the `event_audit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "event_audit" DROP COLUMN "details",
ADD COLUMN     "details" JSONB;
