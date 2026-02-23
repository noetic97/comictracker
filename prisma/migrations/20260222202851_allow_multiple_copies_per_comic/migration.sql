-- DropIndex
DROP INDEX "comics_publisher_series_volume_issue_type_user_id_key";

-- CreateIndex
CREATE INDEX "comics_user_id_publisher_series_volume_issue_type_idx" ON "comics"("user_id", "publisher", "series", "volume", "issue", "type");
