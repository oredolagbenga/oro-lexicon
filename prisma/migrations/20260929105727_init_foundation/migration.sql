-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CONTRIBUTOR',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yoruba" TEXT NOT NULL,
    "normalizedWord" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "translation" TEXT,
    "ipa" TEXT,
    "partOfSpeech" TEXT NOT NULL,
    "exampleYo" TEXT,
    "exampleEn" TEXT,
    "conceptKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "views" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    CONSTRAINT "Word_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Word_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AudioRecording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wordId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT,
    "secureUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "duration" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    CONSTRAINT "AudioRecording_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AudioRecording_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wordId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "prevStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WordReview_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WordReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AudioReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "audioId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "prevStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AudioReview_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "AudioRecording" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AudioReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "relatedType" TEXT,
    "relatedId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Word_slug_key" ON "Word"("slug");

-- CreateIndex
CREATE INDEX "Word_status_idx" ON "Word"("status");

-- CreateIndex
CREATE INDEX "Word_normalizedWord_idx" ON "Word"("normalizedWord");

-- CreateIndex
CREATE INDEX "Word_categoryId_idx" ON "Word"("categoryId");

-- CreateIndex
CREATE INDEX "Word_contributorId_idx" ON "Word"("contributorId");

-- CreateIndex
CREATE INDEX "AudioRecording_wordId_idx" ON "AudioRecording"("wordId");

-- CreateIndex
CREATE INDEX "AudioRecording_status_idx" ON "AudioRecording"("status");

-- CreateIndex
CREATE INDEX "AudioRecording_contributorId_idx" ON "AudioRecording"("contributorId");

-- CreateIndex
CREATE INDEX "WordReview_wordId_idx" ON "WordReview"("wordId");

-- CreateIndex
CREATE INDEX "AudioReview_audioId_idx" ON "AudioReview"("audioId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_read_idx" ON "Notification"("recipientId", "read");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
