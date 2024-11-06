-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'DELIVERED', 'FAILED');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_hbl_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "Issue" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "resolvedAt" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN     "deliveredAt" TIMESTAMPTZ,
ADD COLUMN     "deliveredPhotoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "hbl" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "sentAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "NotificationStatus" NOT NULL DEFAULT 'SENT',

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_eventId_key" ON "Notification"("eventId");

-- CreateIndex
CREATE INDEX "Notification_hbl_status_idx" ON "Notification"("hbl", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_hbl_eventId_key" ON "Notification"("hbl", "eventId");

-- CreateIndex
CREATE INDEX "Comment_issueId_idx" ON "Comment"("issueId");

-- CreateIndex
CREATE INDEX "Event_hbl_timestamp_idx" ON "Event"("hbl", "timestamp");

-- CreateIndex
CREATE INDEX "Issue_hbl_status_idx" ON "Issue"("hbl", "status");

-- CreateIndex
CREATE INDEX "Parcel_hbl_status_currentLocationId_idx" ON "Parcel"("hbl", "status", "currentLocationId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_hbl_fkey" FOREIGN KEY ("hbl") REFERENCES "Parcel"("hbl") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
