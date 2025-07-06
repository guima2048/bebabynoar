/*
  Warnings:

  - Added the required column `targetUserType` to the `blocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `blocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "blocks" ADD COLUMN     "targetUserType" "UserType" NOT NULL,
ADD COLUMN     "userType" "UserType" NOT NULL;
