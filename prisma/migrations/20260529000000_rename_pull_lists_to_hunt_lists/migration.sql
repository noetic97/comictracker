-- Rename pull_lists → hunt_lists
ALTER TABLE "pull_lists" RENAME TO "hunt_lists";

-- Rename pull_list_series → hunt_list_series
ALTER TABLE "pull_list_series" RENAME TO "hunt_list_series";

-- Rename the foreign key column in hunt_list_series
ALTER TABLE "hunt_list_series" RENAME COLUMN "pull_list_id" TO "hunt_list_id";

-- Recreate indexes on hunt_lists (old names were left by ALTER TABLE RENAME)
DROP INDEX IF EXISTS "pull_list_user_name";
CREATE UNIQUE INDEX "hunt_list_user_name" ON "hunt_lists"("user_id", "name");

DROP INDEX IF EXISTS "pull_lists_user_id_idx";
CREATE INDEX "hunt_lists_user_id_idx" ON "hunt_lists"("user_id");

-- Recreate indexes on hunt_list_series
DROP INDEX IF EXISTS "pull_list_series_unique";
CREATE UNIQUE INDEX "hunt_list_series_unique" ON "hunt_list_series"("hunt_list_id", "publisher", "series", "volume");

DROP INDEX IF EXISTS "pull_list_series_pull_list_id_idx";
CREATE INDEX "hunt_list_series_hunt_list_id_idx" ON "hunt_list_series"("hunt_list_id");
