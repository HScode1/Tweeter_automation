-- AlterTable
ALTER TABLE "ScheduledTweet" ADD COLUMN     "source" TEXT;

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timezone" TEXT,
    "tweetsPerPage" INTEGER NOT NULL DEFAULT 10,
    "sortOrder" TEXT NOT NULL DEFAULT 'chrono',
    "autoImport" BOOLEAN NOT NULL DEFAULT false,
    "importSource" TEXT,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
