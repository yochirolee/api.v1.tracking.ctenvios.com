-- DropIndex
DROP INDEX "Event_hbl_statusId_locationId_key";

-- DropIndex
DROP INDEX "Event_hbl_updatedAt_idx";

-- CreateIndex
CREATE INDEX "Event_hbl_statusId_locationId_idx" ON "Event"("hbl", "statusId", "locationId");
