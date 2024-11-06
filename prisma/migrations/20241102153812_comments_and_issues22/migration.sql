/*
  Warnings:

  - You are about to drop the column `deliveredAt` on the `Parcel` table. All the data in the column will be lost.
  - You are about to drop the column `deliveredPhotoUrl` on the `Parcel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Parcel" DROP COLUMN "deliveredAt",
DROP COLUMN "deliveredPhotoUrl";
