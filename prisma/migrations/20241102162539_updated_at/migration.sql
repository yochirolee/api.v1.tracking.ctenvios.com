/*
  Warnings:

  - You are about to drop the column `timestamp` on the `Event` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Event_hbl_timestamp_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "timestamp",
ADD COLUMN     "updatedAt" TIMESTAMPTZ NOT NULL;

-- CreateIndex
CREATE INDEX "Event_hbl_updatedAt_idx" ON "Event"("hbl", "updatedAt");
