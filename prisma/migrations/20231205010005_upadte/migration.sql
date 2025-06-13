/*
  Warnings:

  - A unique constraint covering the columns `[event_id,code]` on the table `cupons` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cupons_event_id_code_key" ON "cupons"("event_id", "code");
