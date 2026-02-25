/**
 * One-off script to check if the DB has any grade or pricePaid values stored.
 * Run from project root: npx tsx scripts/check-grade-pricepaid.ts
 *
 * Requires: DATABASE_URL in .env (or default SQLite path used by Prisma).
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const total = await prisma.comic.count();
  const withGrade = await prisma.comic.count({
    where: { grade: { not: null } },
  });
  const withPricePaid = await prisma.comic.count({
    where: { pricePaid: { not: null } },
  });
  const withBoth = await prisma.comic.count({
    where: {
      grade: { not: null },
      pricePaid: { not: null },
    },
  });

  console.log("\n--- Grade / Price Paid in DB ---\n");
  console.log("Total comics:", total);
  console.log("With grade set:", withGrade);
  console.log("With pricePaid set:", withPricePaid);
  console.log("With both grade and pricePaid:", withBoth);

  if (total > 0) {
    const sample = await prisma.comic.findMany({
      take: 5,
      select: {
        id: true,
        publisher: true,
        series: true,
        issue: true,
        grade: true,
        pricePaid: true,
        currentValue: true,
        collected: true,
      },
    });
    console.log("\nSample rows (first 5):");
    console.table(sample);
  }

  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
