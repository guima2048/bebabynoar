/*
  Warnings:

  - The `lookingFor` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TravelAcceptance" AS ENUM ('YES', 'NO', 'DEPENDS');

-- CreateEnum
CREATE TYPE "MeetingFrequency" AS ENUM ('ONCE_WEEK', 'TWICE_WEEK', 'DAILY', 'WHEN_POSSIBLE');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('MEETINGS', 'SERIOUS_RELATIONSHIP', 'SUGAR_AGREEMENT');

-- CreateEnum
CREATE TYPE "SponsorshipStyle" AS ENUM ('MONTHLY', 'PER_MEETING', 'GIFTS', 'TO_COMBINE');

-- CreateEnum
CREATE TYPE "AvailableTime" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'WEEKENDS', 'FREE');

-- CreateEnum
CREATE TYPE "ExclusivityAcceptance" AS ENUM ('YES', 'NO', 'DEPENDS_ON_PROPOSAL');

-- CreateEnum
CREATE TYPE "RelationshipFormat" AS ENUM ('IN_PERSON', 'ONLINE', 'TRAVELS');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "acceptsExclusivity" "ExclusivityAcceptance",
ADD COLUMN     "acceptsTravel" "TravelAcceptance",
ADD COLUMN     "availableTime" "AvailableTime",
ADD COLUMN     "meetingFrequency" "MeetingFrequency",
ADD COLUMN     "relationshipFormat" "RelationshipFormat",
ADD COLUMN     "relationshipType" "RelationshipType",
ADD COLUMN     "sponsorshipStyle" "SponsorshipStyle",
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "lookingFor",
ADD COLUMN     "lookingFor" TEXT;
