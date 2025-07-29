-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "replyToMessageId" TEXT;

-- CreateTable
CREATE TABLE "photo_releases" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_releases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_releases_photoId_targetUserId_key" ON "photo_releases"("photoId", "targetUserId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToMessageId_fkey" FOREIGN KEY ("replyToMessageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_releases" ADD CONSTRAINT "photo_releases_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_releases" ADD CONSTRAINT "photo_releases_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
