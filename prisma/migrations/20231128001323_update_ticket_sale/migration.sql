-- AlterTable
ALTER TABLE "tickets_sale" ADD COLUMN     "cupomId" TEXT;

-- AddForeignKey
ALTER TABLE "tickets_sale" ADD CONSTRAINT "tickets_sale_cupomId_fkey" FOREIGN KEY ("cupomId") REFERENCES "cupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
