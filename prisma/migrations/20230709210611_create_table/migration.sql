-- CreateTable
CREATE TABLE "tickets_sale" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tickets_sale_id_idx" ON "tickets_sale"("id");

-- AddForeignKey
ALTER TABLE "tickets_sale" ADD CONSTRAINT "tickets_sale_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_sale" ADD CONSTRAINT "tickets_sale_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_sale" ADD CONSTRAINT "tickets_sale_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
