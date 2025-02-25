/*
  Warnings:

  - You are about to drop the column `token` on the `Account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,platform]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessToken` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Account_userId_username_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "token",
ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_platform_key" ON "Account"("userId", "platform");
