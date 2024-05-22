/*
  Warnings:

  - You are about to drop the column `opt_auth_url` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "opt_auth_url",
ADD COLUMN     "otp_auth_url" TEXT;
