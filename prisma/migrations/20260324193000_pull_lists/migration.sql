-- CreateTable
CREATE TABLE "pull_lists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pull_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "pull_list_series" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pull_list_id" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "volume" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pull_list_series_pull_list_id_fkey" FOREIGN KEY ("pull_list_id") REFERENCES "pull_lists" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX "pull_list_user_name" ON "pull_lists"("user_id", "name");
CREATE INDEX "pull_lists_user_id_idx" ON "pull_lists"("user_id");
CREATE UNIQUE INDEX "pull_list_series_unique" ON "pull_list_series"("pull_list_id", "publisher", "series", "volume");
CREATE INDEX "pull_list_series_pull_list_id_idx" ON "pull_list_series"("pull_list_id");
