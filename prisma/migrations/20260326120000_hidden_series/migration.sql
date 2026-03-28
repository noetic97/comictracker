-- CreateTable
CREATE TABLE "hidden_series" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publisher" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "volume" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hidden_series_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX "hidden_series_user_id_publisher_series_volume_key" ON "hidden_series"("user_id", "publisher", "series", "volume");
CREATE INDEX "hidden_series_user_id_idx" ON "hidden_series"("user_id");

-- AlterTable
ALTER TABLE "users" ADD COLUMN "show_hidden_series" BOOLEAN NOT NULL DEFAULT false;
