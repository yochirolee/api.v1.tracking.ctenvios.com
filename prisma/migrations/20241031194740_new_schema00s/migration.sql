-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "timestamp" DROP DEFAULT,
ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMPTZ;
