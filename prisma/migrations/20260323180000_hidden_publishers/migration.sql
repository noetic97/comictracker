-- CreateTable
CREATE TABLE "hidden_publishers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publisher" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hidden_publishers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX "hidden_publishers_user_id_publisher_key" ON "hidden_publishers"("user_id", "publisher");
CREATE INDEX "hidden_publishers_user_id_idx" ON "hidden_publishers"("user_id");

-- AlterTable
ALTER TABLE "users" ADD COLUMN "show_hidden_publishers" BOOLEAN NOT NULL DEFAULT false;
