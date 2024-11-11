/*
  Warnings:

  - You are about to drop the column `status` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Status` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Issue_hbl_status_idx";

-- DropIndex
DROP INDEX "Status_name_key";

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Status" DROP COLUMN "name";

-- CreateIndex
CREATE INDEX "Issue_hbl_idx" ON "Issue"("hbl");
