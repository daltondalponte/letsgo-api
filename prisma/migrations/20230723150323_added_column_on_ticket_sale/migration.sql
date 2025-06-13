-- CreateEnum
CREATE TYPE "TicketSaleStatus" AS ENUM ('CONFERRED', 'UNCONFERRED');

-- AlterTable
ALTER TABLE "tickets_sale" ADD COLUMN     "ticket_status" "TicketSaleStatus" NOT NULL DEFAULT 'UNCONFERRED';
