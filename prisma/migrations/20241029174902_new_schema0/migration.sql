/*
  Warnings:

  - A unique constraint covering the columns `[hbl,locationId,status]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hbl,status,currentLocationId]` on the table `Parcel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Event_hbl_locationId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Event_hbl_locationId_status_key" ON "Event"("hbl", "locationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_hbl_status_currentLocationId_key" ON "Parcel"("hbl", "status", "currentLocationId");
