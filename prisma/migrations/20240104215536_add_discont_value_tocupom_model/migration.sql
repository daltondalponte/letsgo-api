-- AlterTable
ALTER TABLE "cupons" ADD COLUMN     "discount_value" DECIMAL(18,2),
ALTER COLUMN "descont_percent" DROP NOT NULL;
