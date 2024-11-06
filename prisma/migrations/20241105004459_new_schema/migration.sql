/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Parcel` table. All the data in the column will be lost.
  - You are about to drop the column `currentLocationId` on the `Parcel` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Parcel` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Parcel` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Parcel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hbl,invoiceId]` on the table `Parcel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_hbl_fkey";

-- DropForeignKey
ALTER TABLE "Parcel" DROP CONSTRAINT "Parcel_currentLocationId_fkey";

-- DropForeignKey
ALTER TABLE "Parcel" DROP CONSTRAINT "Parcel_userId_fkey";

-- DropIndex
DROP INDEX "Parcel_hbl_status_currentLocationId_idx";

-- DropIndex
DROP INDEX "Parcel_hbl_status_currentLocationId_key";

-- AlterTable
ALTER TABLE "Parcel" DROP COLUMN "createdAt",
DROP COLUMN "currentLocationId",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
DROP COLUMN "userId";

-- CreateIndex
CREATE INDEX "Parcel_hbl_invoiceId_idx" ON "Parcel"("hbl", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_hbl_invoiceId_key" ON "Parcel"("hbl", "invoiceId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_hbl_fkey" FOREIGN KEY ("hbl") REFERENCES "Parcel"("hbl") ON DELETE CASCADE ON UPDATE CASCADE;
