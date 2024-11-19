-- AlterEnum
ALTER TYPE "EventType" ADD VALUE 'PUBLIC_UPDATE';

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "issueType" TEXT;
