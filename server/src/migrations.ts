import fs from "fs";
import path from "path";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    const migrationFiles = fs
      .readdirSync(path.join(__dirname, "../db/migrations"))
      .sort();

    for (const file of migrationFiles) {
      const migration = fs.readFileSync(
        path.join(__dirname, "../db/migrations", file),
        "utf8"
      );
      console.log(`Running migration: ${file}`);
      await client.query(migration);
    }

    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
  } finally {
    client.release();
  }
};

runMigrations();
