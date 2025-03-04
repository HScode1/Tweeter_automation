-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "lastRefreshAt" TIMESTAMP(3),
ADD COLUMN     "needsReconnect" BOOLEAN NOT NULL DEFAULT false;
