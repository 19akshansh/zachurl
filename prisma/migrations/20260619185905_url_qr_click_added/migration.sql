-- AlterTable
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "url" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "originalUrl" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "url_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_code" (
    "id" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "fgColor" TEXT NOT NULL DEFAULT '#000000',
    "bgColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "click" (
    "id" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "referer" TEXT,

    CONSTRAINT "click_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "url_slug_key" ON "url"("slug");

-- CreateIndex
CREATE INDEX "url_userId_idx" ON "url"("userId");

-- CreateIndex
CREATE INDEX "url_slug_idx" ON "url"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "qr_code_urlId_key" ON "qr_code"("urlId");

-- CreateIndex
CREATE INDEX "click_urlId_timestamp_idx" ON "click"("urlId", "timestamp" DESC);

-- AddForeignKey
ALTER TABLE "url" ADD CONSTRAINT "url_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "url"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click" ADD CONSTRAINT "click_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "url"("id") ON DELETE CASCADE ON UPDATE CASCADE;
