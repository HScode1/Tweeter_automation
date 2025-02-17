/*
  Warnings:

  - You are about to drop the column `publishedTweetId` on the `ScheduledTweet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScheduledTweet" DROP COLUMN "publishedTweetId",
ADD COLUMN     "tweetId" TEXT;
