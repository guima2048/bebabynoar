-- CreateTable
CREATE TABLE "blog_settings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "titleFont" TEXT NOT NULL,
    "bodyFont" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroBackgroundImage" TEXT NOT NULL,
    "heroBackgroundAlt" TEXT NOT NULL,
    "siteTitle" TEXT NOT NULL,
    "siteDescription" TEXT NOT NULL,
    "defaultKeywords" TEXT NOT NULL,
    "searchPlaceholder" TEXT NOT NULL,
    "recentArticlesTitle" TEXT NOT NULL,
    "popularArticlesTitle" TEXT NOT NULL,
    "readMoreText" TEXT NOT NULL,
    "noArticlesText" TEXT NOT NULL,
    "footerText" TEXT NOT NULL,
    "privacyPolicyText" TEXT NOT NULL,
    "termsText" TEXT NOT NULL,
    "contactText" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_settings_pkey" PRIMARY KEY ("id")
);
