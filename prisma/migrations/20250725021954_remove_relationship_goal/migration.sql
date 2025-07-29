-- CreateEnum
CREATE TYPE "RelationshipGoal" AS ENUM ('CASUAL', 'FIXED', 'BOTH');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "relationshipGoal" "RelationshipGoal";
