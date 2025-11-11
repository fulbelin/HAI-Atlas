import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync("./data/world_countries.json", "utf8"));
  const rows = data.features
    .map((feature: any) => feature?.properties?.name)
    .filter(Boolean)
    .map((name: string) => ({ name }));

  await prisma.country.createMany({
    data: rows,
    skipDuplicates: true,
  });

  console.log(`✅ Inserted ${rows.length} countries (duplicates skipped).`);
}

main()
  .catch((err) => console.error("❌ Error inserting countries:", err))
  .finally(() => prisma.$disconnect());
