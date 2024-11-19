/*
  Warnings:

  - The primary key for the `error_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `error_log` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "error_log" DROP CONSTRAINT "error_log_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "error_log_pkey" PRIMARY KEY ("id");
