-- AlterTable
ALTER TABLE "User" ADD COLUMN     "opt_auth_url" TEXT,
ADD COLUMN     "otp_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp_verified" BOOLEAN NOT NULL DEFAULT false;