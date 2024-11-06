/*
  Warnings:

  - You are about to drop the `Parcel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_hbl_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_hbl_fkey";

-- DropTable
DROP TABLE "Parcel";
