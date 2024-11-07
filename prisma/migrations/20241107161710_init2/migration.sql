/*
  Warnings:

  - A unique constraint covering the columns `[hbl,locationId,statusId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Event_hbl_locationId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Event_hbl_locationId_statusId_key" ON "Event"("hbl", "locationId", "statusId");
