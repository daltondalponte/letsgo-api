/*
  Warnings:

  - You are about to drop the column `coordinates_event` on the `Establishment` table. All the data in the column will be lost.
  - Added the required column `coordinates` to the `Establishment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDITCARD', 'PIX');

-- AlterTable
ALTER TABLE "Establishment" DROP COLUMN "coordinates_event",
ADD COLUMN     "coordinates" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "description" TEXT NOT NULL;
