/*
  Warnings:

  - The values [PAYMENT,TRIP] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [INVESTIGATING] on the enum `ReportStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `targetUserType` on the `blocks` table. All the data in the column will be lost.
  - You are about to drop the column `userType` on the `blocks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `interests` table. All the data in the column will be lost.
  - You are about to drop the column `conversationId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `imageURL` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `photos` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `availableForTravel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `drinks` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationExpiry` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `hasChildren` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastPaymentDate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastVerificationEmailSent` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetTokenExpiry` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordUpdatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `receiveTravelers` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `relationshipType` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `smokes` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `social` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `EmailConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_post_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_views` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversation_participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `email_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `landing_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `login_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `manual_activations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_links` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile_cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `smtp_config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `testimonials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('MESSAGE', 'INTEREST', 'SYSTEM', 'PROFILE_VIEW');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReportStatus_new" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');
ALTER TABLE "reports" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "reports" ALTER COLUMN "status" TYPE "ReportStatus_new" USING ("status"::text::"ReportStatus_new");
ALTER TYPE "ReportStatus" RENAME TO "ReportStatus_old";
ALTER TYPE "ReportStatus_new" RENAME TO "ReportStatus";
DROP TYPE "ReportStatus_old";
ALTER TABLE "reports" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "blog_analytics" DROP CONSTRAINT "blog_analytics_postId_fkey";

-- DropForeignKey
ALTER TABLE "blog_analytics" DROP CONSTRAINT "blog_analytics_userId_fkey";

-- DropForeignKey
ALTER TABLE "blog_comments" DROP CONSTRAINT "blog_comments_postId_fkey";

-- DropForeignKey
ALTER TABLE "blog_comments" DROP CONSTRAINT "blog_comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "blog_images" DROP CONSTRAINT "blog_images_postId_fkey";

-- DropForeignKey
ALTER TABLE "blog_images" DROP CONSTRAINT "blog_images_uploadedBy_fkey";

-- DropForeignKey
ALTER TABLE "blog_likes" DROP CONSTRAINT "blog_likes_postId_fkey";

-- DropForeignKey
ALTER TABLE "blog_likes" DROP CONSTRAINT "blog_likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "blog_post_categories" DROP CONSTRAINT "blog_post_categories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "blog_post_categories" DROP CONSTRAINT "blog_post_categories_postId_fkey";

-- DropForeignKey
ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_authorId_fkey";

-- DropForeignKey
ALTER TABLE "blog_views" DROP CONSTRAINT "blog_views_postId_fkey";

-- DropForeignKey
ALTER TABLE "blog_views" DROP CONSTRAINT "blog_views_userId_fkey";

-- DropForeignKey
ALTER TABLE "conversation_participants" DROP CONSTRAINT "conversation_participants_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "conversation_participants" DROP CONSTRAINT "conversation_participants_userId_fkey";

-- DropForeignKey
ALTER TABLE "login_history" DROP CONSTRAINT "login_history_userId_fkey";

-- DropForeignKey
ALTER TABLE "manual_activations" DROP CONSTRAINT "manual_activations_planId_fkey";

-- DropForeignKey
ALTER TABLE "manual_activations" DROP CONSTRAINT "manual_activations_userId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "payment_links" DROP CONSTRAINT "payment_links_planId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_paymentLinkId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_userId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_targetUserId_fkey";

-- DropForeignKey
ALTER TABLE "user_plans" DROP CONSTRAINT "user_plans_planId_fkey";

-- DropForeignKey
ALTER TABLE "user_plans" DROP CONSTRAINT "user_plans_userId_fkey";

-- DropIndex
DROP INDEX "users_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "blocks" DROP COLUMN "targetUserType",
DROP COLUMN "userType";

-- AlterTable
ALTER TABLE "interests" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "conversationId",
DROP COLUMN "imageURL",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "data";

-- AlterTable
ALTER TABLE "photos" DROP COLUMN "fileName";

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "availableForTravel",
DROP COLUMN "drinks",
DROP COLUMN "emailVerificationExpiry",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "hasChildren",
DROP COLUMN "height",
DROP COLUMN "lastPaymentDate",
DROP COLUMN "lastVerificationEmailSent",
DROP COLUMN "location",
DROP COLUMN "name",
DROP COLUMN "passwordResetToken",
DROP COLUMN "passwordResetTokenExpiry",
DROP COLUMN "passwordUpdatedAt",
DROP COLUMN "receiveTravelers",
DROP COLUMN "relationshipType",
DROP COLUMN "smokes",
DROP COLUMN "social",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "subscriptionStatus",
DROP COLUMN "verified",
DROP COLUMN "weight";

-- DropTable
DROP TABLE "EmailConfig";

-- DropTable
DROP TABLE "EmailTemplate";

-- DropTable
DROP TABLE "blog_analytics";

-- DropTable
DROP TABLE "blog_categories";

-- DropTable
DROP TABLE "blog_comments";

-- DropTable
DROP TABLE "blog_images";

-- DropTable
DROP TABLE "blog_likes";

-- DropTable
DROP TABLE "blog_post_categories";

-- DropTable
DROP TABLE "blog_posts";

-- DropTable
DROP TABLE "blog_settings";

-- DropTable
DROP TABLE "blog_views";

-- DropTable
DROP TABLE "conversation_participants";

-- DropTable
DROP TABLE "conversations";

-- DropTable
DROP TABLE "email_logs";

-- DropTable
DROP TABLE "landing_settings";

-- DropTable
DROP TABLE "login_history";

-- DropTable
DROP TABLE "manual_activations";

-- DropTable
DROP TABLE "payment_links";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "plans";

-- DropTable
DROP TABLE "profile_cards";

-- DropTable
DROP TABLE "reviews";

-- DropTable
DROP TABLE "smtp_config";

-- DropTable
DROP TABLE "testimonials";

-- DropTable
DROP TABLE "user_plans";

-- DropEnum
DROP TYPE "BlogPostStatus";

-- DropEnum
DROP TYPE "CommentStatus";

-- DropEnum
DROP TYPE "EmailStatus";

-- DropEnum
DROP TYPE "MessageType";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "ReviewStatus";
