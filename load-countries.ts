import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const prisma = new PrismaClient()

// Resolve the directory path (works both locally and on Vercel)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read the GeoJSON file
const filePath = join(__dirname, 'data', 'world_countries.json')
const raw = readFileSync(filePath, 'utf-8')
const worldCountries = JSON.parse(raw)

async function main() {
  let count = 0
  for (const feature of worldCountries.features) {
    const name = feature.properties.name
    const iso3 = feature.id // ISO-3 code like "DEU", "USA", etc.

    if (!name || !iso3) continue

    await prisma.country.upsert({
      where: { name },
      update: { countryCode: iso3 },
      create: { name, countryCode: iso3 },
    })
    count++
  }

  console.log(`✅ Inserted or updated ${count} countries`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
