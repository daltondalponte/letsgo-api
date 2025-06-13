-- CreateEnum
CREATE TYPE "ModificationType" AS ENUM ('CREATE', 'UPDATE');

-- CreateEnum
CREATE TYPE "EventApprovalsStatus" AS ENUM ('PENDING', 'APPROVE', 'REJECT');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "events_approvals" (
    "id" TEXT NOT NULL,
    "useruid" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "EventApprovalsStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_audit" (
    "id" TEXT NOT NULL,
    "useruid" TEXT NOT NULL,
    "modificationType" "ModificationType" NOT NULL DEFAULT 'UPDATE',
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events_manager" (
    "id" TEXT NOT NULL,
    "useruid" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cupons_aplicados" (
    "id" TEXT NOT NULL,
    "ticket_sale_id" TEXT NOT NULL,
    "cupomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketSaleId" TEXT NOT NULL,

    CONSTRAINT "cupons_aplicados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "quantity_available" INTEGER NOT NULL,
    "ticketId" TEXT,
    "useruid" TEXT NOT NULL,
    "descont_percent" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_approvals_id_idx" ON "events_approvals"("id");

-- CreateIndex
CREATE INDEX "event_audit_id_idx" ON "event_audit"("id");

-- CreateIndex
CREATE INDEX "events_manager_id_idx" ON "events_manager"("id");

-- CreateIndex
CREATE UNIQUE INDEX "events_manager_useruid_eventId_key" ON "events_manager"("useruid", "eventId");

-- CreateIndex
CREATE INDEX "cupons_aplicados_id_idx" ON "cupons_aplicados"("id");

-- CreateIndex
CREATE INDEX "cupons_id_idx" ON "cupons"("id");

-- AddForeignKey
ALTER TABLE "events_approvals" ADD CONSTRAINT "events_approvals_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_approvals" ADD CONSTRAINT "events_approvals_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_audit" ADD CONSTRAINT "event_audit_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_manager" ADD CONSTRAINT "events_manager_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_manager" ADD CONSTRAINT "events_manager_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupons_aplicados" ADD CONSTRAINT "cupons_aplicados_ticketSaleId_fkey" FOREIGN KEY ("ticketSaleId") REFERENCES "tickets_sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupons_aplicados" ADD CONSTRAINT "cupons_aplicados_cupomId_fkey" FOREIGN KEY ("cupomId") REFERENCES "cupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupons" ADD CONSTRAINT "cupons_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupons" ADD CONSTRAINT "cupons_useruid_fkey" FOREIGN KEY ("useruid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
