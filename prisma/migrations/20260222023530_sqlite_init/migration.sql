-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "last_sign_in_at" DATETIME,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "email_verified" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "comics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publisher" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "volume" TEXT NOT NULL DEFAULT '',
    "years" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT '',
    "issue" TEXT NOT NULL,
    "issueNumber" REAL NOT NULL,
    "currentValue" REAL NOT NULL,
    "collected" BOOLEAN NOT NULL DEFAULT false,
    "isGrail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artist" TEXT,
    "cert" TEXT,
    "certificationCompany" TEXT,
    "coverArtist" TEXT,
    "coverImageUrl" TEXT,
    "dateAdded" DATETIME,
    "datePurchased" DATETIME,
    "description" TEXT,
    "firstAppearance" TEXT,
    "gradeDetails" TEXT,
    "issueDate" TEXT,
    "letterer" TEXT,
    "notes" TEXT,
    "pricePaid" REAL,
    "signed" BOOLEAN NOT NULL DEFAULT false,
    "storageLocation" TEXT,
    "storyTitle" TEXT,
    "variantDetails" TEXT,
    "writer" TEXT,
    "grade" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "comics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "favorite_series" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publisher" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "volume" TEXT NOT NULL DEFAULT '',
    "dateAdded" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "favorite_series_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "alert_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" TEXT,
    "telegramSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    CONSTRAINT "alert_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "comics_user_id_idx" ON "comics"("user_id");

-- CreateIndex
CREATE INDEX "comics_publisher_series_issue_idx" ON "comics"("publisher", "series", "issue");

-- CreateIndex
CREATE INDEX "comics_series_idx" ON "comics"("series");

-- CreateIndex
CREATE INDEX "comics_collected_idx" ON "comics"("collected");

-- CreateIndex
CREATE INDEX "comics_isGrail_idx" ON "comics"("isGrail");

-- CreateIndex
CREATE INDEX "comics_publisher_idx" ON "comics"("publisher");

-- CreateIndex
CREATE INDEX "comics_issueNumber_idx" ON "comics"("issueNumber");

-- CreateIndex
CREATE INDEX "comics_grade_idx" ON "comics"("grade");

-- CreateIndex
CREATE INDEX "comics_signed_idx" ON "comics"("signed");

-- CreateIndex
CREATE INDEX "comics_pricePaid_idx" ON "comics"("pricePaid");

-- CreateIndex
CREATE INDEX "comics_dateAdded_idx" ON "comics"("dateAdded");

-- CreateIndex
CREATE INDEX "comics_storageLocation_idx" ON "comics"("storageLocation");

-- CreateIndex
CREATE UNIQUE INDEX "comics_publisher_series_volume_issue_type_user_id_key" ON "comics"("publisher", "series", "volume", "issue", "type", "user_id");

-- CreateIndex
CREATE INDEX "favorite_series_user_id_idx" ON "favorite_series"("user_id");

-- CreateIndex
CREATE INDEX "favorite_series_publisher_series_idx" ON "favorite_series"("publisher", "series");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_series_publisher_series_volume_user_id_key" ON "favorite_series"("publisher", "series", "volume", "user_id");

-- CreateIndex
CREATE INDEX "alert_logs_user_id_idx" ON "alert_logs"("user_id");

-- CreateIndex
CREATE INDEX "alert_logs_severity_idx" ON "alert_logs"("severity");

-- CreateIndex
CREATE INDEX "alert_logs_source_idx" ON "alert_logs"("source");

-- CreateIndex
CREATE INDEX "alert_logs_sentAt_idx" ON "alert_logs"("sentAt");
