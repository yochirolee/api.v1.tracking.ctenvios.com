/*
  Warnings:

  - A unique constraint covering the columns `[hbl,statusId,locationId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Event_hbl_statusId_locationId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Event_hbl_statusId_locationId_key" ON "Event"("hbl", "statusId", "locationId");
