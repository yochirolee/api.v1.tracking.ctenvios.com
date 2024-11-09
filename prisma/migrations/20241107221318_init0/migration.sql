/*
  Warnings:

  - A unique constraint covering the columns `[hbl,statusId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Event_hbl_locationId_statusId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_hbl_statusId_key" ON "Event"("hbl", "statusId");
