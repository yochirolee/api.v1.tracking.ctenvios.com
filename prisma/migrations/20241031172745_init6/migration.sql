/*
  Warnings:

  - You are about to drop the column `updateMethod` on the `Parcel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "updateMethod" SET DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "Parcel" DROP COLUMN "updateMethod",
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ;
