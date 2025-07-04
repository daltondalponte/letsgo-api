-- AlterTable
ALTER TABLE "Establishment" ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "socialMedia" JSONB,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT;
