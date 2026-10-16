/*
  Warnings:

  - Added the required column `normalizedEnglish` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "yoruba" TEXT NOT NULL,
    "normalizedWord" TEXT NOT NULL,
    "normalizedEnglish" TEXT NOT NULL,
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
INSERT INTO "new_Word" ("approvedAt", "approvedBy", "categoryId", "conceptKey", "contributorId", "createdAt", "english", "exampleEn", "exampleYo", "id", "ipa", "normalizedWord", "partOfSpeech", "slug", "status", "translation", "updatedAt", "views", "yoruba") SELECT "approvedAt", "approvedBy", "categoryId", "conceptKey", "contributorId", "createdAt", "english", "exampleEn", "exampleYo", "id", "ipa", "normalizedWord", "partOfSpeech", "slug", "status", "translation", "updatedAt", "views", "yoruba" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
CREATE UNIQUE INDEX "Word_slug_key" ON "Word"("slug");
CREATE INDEX "Word_status_idx" ON "Word"("status");
CREATE INDEX "Word_normalizedWord_idx" ON "Word"("normalizedWord");
CREATE INDEX "Word_categoryId_idx" ON "Word"("categoryId");
CREATE INDEX "Word_contributorId_idx" ON "Word"("contributorId");
CREATE UNIQUE INDEX "Word_normalizedWord_normalizedEnglish_key" ON "Word"("normalizedWord", "normalizedEnglish");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
