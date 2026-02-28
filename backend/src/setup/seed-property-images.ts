import 'dotenv/config'
import asyncFs from 'node:fs/promises'
import path from 'node:path'
import * as env from '../config/env.config'
import * as databaseHelper from '../utils/databaseHelper'
import Property from '../models/Property'
import * as logger from '../utils/logger'

const TARGET_EXTRA_IMAGES = 4 // 1 main + 4 extras = 5 total

try {
  const connected = await databaseHelper.connect(env.DB_URI, env.DB_SSL, env.DB_DEBUG)
  if (!connected) {
    logger.error('Failed to connect to the database')
    process.exit(1)
  }

  const cdnDir = env.CDN_PROPERTIES
  const properties = await Property.find({ image: { $exists: true, $ne: '' } })

  logger.info(`Found ${properties.length} properties with images`)

  let updated = 0
  for (const property of properties) {
    const currentExtras = property.images?.length ?? 0
    const needed = TARGET_EXTRA_IMAGES - currentExtras

    if (needed <= 0) {
      logger.info(`"${property.name}" already has ${currentExtras + 1} images — skipping`)
      continue
    }

    const srcPath = path.join(cdnDir, property.image)

    try {
      await asyncFs.access(srcPath)
    } catch {
      logger.error(`Source image not found for "${property.name}": ${srcPath}`)
      continue
    }

    const ext = path.extname(property.image)
    const newImages: string[] = [...(property.images || [])]

    for (let i = 0; i < needed; i++) {
      const newName = `${property._id}_extra_${i}_${Date.now()}${ext}`
      const destPath = path.join(cdnDir, newName)
      await asyncFs.copyFile(srcPath, destPath)
      newImages.push(newName)
    }

    property.images = newImages
    await property.save()
    updated++
    logger.info(`"${property.name}": added ${needed} images (now ${newImages.length + 1} total)`)
  }

  logger.info(`Done! Updated ${updated} properties.`)
  process.exit(0)
} catch (err) {
  logger.error('Seed images error:', err)
  process.exit(1)
}
