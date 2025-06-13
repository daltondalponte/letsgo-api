/*
  Warnings:

  - The values [CREATE,UPDATE] on the enum `ModificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ModificationType_new" AS ENUM ('CREATEEVENT', 'UPDATEEVENT', 'CREATECUPOM', 'UPDATECUPOM', 'CREATETICKET', 'UPDATETICKET');
ALTER TABLE "event_audit" ALTER COLUMN "modificationType" DROP DEFAULT;
ALTER TABLE "event_audit" ALTER COLUMN "modificationType" TYPE "ModificationType_new" USING ("modificationType"::text::"ModificationType_new");
ALTER TYPE "ModificationType" RENAME TO "ModificationType_old";
ALTER TYPE "ModificationType_new" RENAME TO "ModificationType";
DROP TYPE "ModificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "event_audit" ALTER COLUMN "modificationType" DROP DEFAULT;
