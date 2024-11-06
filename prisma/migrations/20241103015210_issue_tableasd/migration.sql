-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ISSUE', 'UPDATE');

-- AlterEnum
ALTER TYPE "ParcelStatus" ADD VALUE 'OTRO';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'UPDATE';
