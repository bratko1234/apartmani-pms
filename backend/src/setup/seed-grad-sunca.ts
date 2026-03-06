import 'dotenv/config'
import process from 'node:process'
import asyncFs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import * as movininTypes from ':movinin-types'

// Provide defaults for required env vars that the model imports need
// but the seed script doesn't use
const envDefaults: Record<string, string> = {
  MI_SMTP_HOST: 'localhost',
  MI_SMTP_PORT: '587',
  MI_SMTP_USER: 'noreply@example.com',
  MI_SMTP_PASS: 'dummy',
  MI_SMTP_FROM: 'noreply@example.com',
  MI_ADMIN_EMAIL: 'admin@example.com',
  MI_FRONTEND_HOST: 'http://localhost:3001',
  MI_BACKEND_HOST: 'http://localhost:4004',
  MI_ADMIN_HOST: 'http://localhost:3003',
  MI_CDN_USERS: '/tmp/cdn/users',
  MI_CDN_TEMP_USERS: '/tmp/cdn/temp/users',
  MI_CDN_PROPERTIES: '/tmp/cdn/properties',
  MI_CDN_TEMP_PROPERTIES: '/tmp/cdn/temp/properties',
  MI_CDN_LOCATIONS: '/tmp/cdn/locations',
  MI_CDN_TEMP_LOCATIONS: '/tmp/cdn/temp/locations',
  MI_DB_URI: 'mongodb://admin:admin@127.0.0.1:27018/movinin?authSource=admin&appName=movinin',
}
for (const [key, val] of Object.entries(envDefaults)) {
  if (!process.env[key]) {
    process.env[key] = val
  }
}

// Now safe to import modules that depend on env.config
const { default: Property } = await import('../models/Property')
const { default: User } = await import('../models/User')
const { default: Location } = await import('../models/Location')
const databaseHelper = await import('../utils/databaseHelper')
const logger = await import('../utils/logger')
const env = await import('../config/env.config')

interface RoomTypeSeed {
  name: string
  bedrooms: number
  bathrooms: number
  kitchens: number
  parkingSpaces: number
  size: number
  price: number
  countOfRooms: number
  description: string
}

const BUILDING_NAME = 'Grad Sunca Trebinje'

const ROOM_TYPES: RoomTypeSeed[] = [
  {
    name: 'Studio Apartman',
    bedrooms: 0,
    bathrooms: 1,
    kitchens: 1,
    parkingSpaces: 0,
    size: 30,
    price: 45,
    countOfRooms: 40,
    description: '<p>Kompaktan studio apartman sa modernim namještajem, idealan za parove ili solo putnike. Uključuje mini kuhinju i kupatilo.</p>',
  },
  {
    name: 'Jednosobni Apartman',
    bedrooms: 1,
    bathrooms: 1,
    kitchens: 1,
    parkingSpaces: 0,
    size: 45,
    price: 65,
    countOfRooms: 50,
    description: '<p>Prostran jednosobni apartman sa odvojenom spavaćom sobom, dnevnim boravkom i potpuno opremljenom kuhinjom.</p>',
  },
  {
    name: 'Dvosobni Apartman',
    bedrooms: 2,
    bathrooms: 1,
    kitchens: 1,
    parkingSpaces: 1,
    size: 65,
    price: 85,
    countOfRooms: 30,
    description: '<p>Komforan dvosobni apartman sa dva balkona, idealan za porodice. Potpuno opremljena kuhinja i prostrani dnevni boravak.</p>',
  },
  {
    name: 'Trosobni Apartman',
    bedrooms: 3,
    bathrooms: 2,
    kitchens: 1,
    parkingSpaces: 1,
    size: 90,
    price: 120,
    countOfRooms: 15,
    description: '<p>Luksuzni trosobni apartman sa dva kupatila, prostranom kuhinjom i dnevnim boravkom. Pogodan za veće porodice ili grupe.</p>',
  },
  {
    name: 'Premium Suite',
    bedrooms: 2,
    bathrooms: 2,
    kitchens: 1,
    parkingSpaces: 1,
    size: 80,
    price: 150,
    countOfRooms: 5,
    description: '<p>Ekskluzivni premium suite sa panoramskim pogledom, jacuzzijem, premium namještajem i personalizovanim uslugama.</p>',
  },
]

try {
  const connected = await databaseHelper.connect(env.DB_URI, env.DB_SSL, env.DB_DEBUG)
  if (!connected) {
    logger.error('Failed to connect to the database')
    process.exit(1)
  }

  // Find agency
  const agency = await User.findOne({ type: movininTypes.UserType.Agency })
  if (!agency) {
    logger.error('No agency found. Create one first.')
    process.exit(1)
  }
  logger.info(`Agency: ${agency.fullName} (${agency._id})`)

  // Find Trebinje location
  const existingLocations = await Location.find({}).populate('values')
  let trebinjeLocationId: mongoose.Types.ObjectId | null = null
  for (const loc of existingLocations) {
    const vals = loc.values as any[]
    const enVal = vals.find((v: any) => v.language === 'en')
    if (enVal && enVal.value === 'Trebinje') {
      trebinjeLocationId = loc._id as mongoose.Types.ObjectId
      break
    }
  }
  if (!trebinjeLocationId) {
    logger.error('Trebinje location not found. Run seed-properties first.')
    process.exit(1)
  }
  logger.info(`Location: Trebinje (${trebinjeLocationId})`)

  // Find existing image to copy
  const existingProperty = await Property.findOne({ image: { $exists: true, $ne: '' } })
  const existingImage = existingProperty?.image || ''
  const cdnDir = env.CDN_PROPERTIES

  // Check if building already exists
  const existingBuilding = await Property.findOne({ name: BUILDING_NAME })
  if (existingBuilding) {
    logger.info(`"${BUILDING_NAME}" already exists — skipping`)
    process.exit(0)
  }

  // Create building
  const building = new Property({
    name: BUILDING_NAME,
    type: movininTypes.PropertyType.Hotel,
    agency: agency._id,
    description: '<p>Grad Sunca je moderni apartmanski kompleks u Trebinju sa 140 apartmana. Smješten na sunčanoj lokaciji, kompleks nudi raznovrsne tipove smještaja od studio apartmana do premium suiteova. Gostima su dostupni bazen, fitnes centar, restoran i podzemni parking.</p>',
    available: true,
    hidden: false,
    image: '',
    images: [],
    bedrooms: 0,
    bathrooms: 0,
    kitchens: 0,
    parkingSpaces: 50,
    size: 0,
    petsAllowed: false,
    furnished: true,
    aircon: true,
    minimumAge: 21,
    location: trebinjeLocationId,
    address: 'Grad Sunca, Trebinje',
    price: 0,
    cancellation: -1,
    rentalTerm: movininTypes.RentalTerm.Daily,
    blockOnPay: true,
    isBuilding: true,
  })
  await building.save()

  if (existingImage && cdnDir) {
    try {
      const srcPath = path.join(cdnDir, existingImage)
      const ext = path.extname(existingImage)
      const newName = `${building._id}_${Date.now()}${ext}`
      await asyncFs.copyFile(srcPath, path.join(cdnDir, newName))
      building.image = newName
      await building.save()
    } catch {
      // Image copy failed, proceed without
    }
  }

  logger.info(`Created building: ${BUILDING_NAME} (${building._id})`)

  // Create room types
  let totalRooms = 0
  for (const seed of ROOM_TYPES) {
    const roomType = new Property({
      name: seed.name,
      type: movininTypes.PropertyType.Apartment,
      agency: agency._id,
      description: seed.description,
      available: true,
      hidden: false,
      image: '',
      images: [],
      bedrooms: seed.bedrooms,
      bathrooms: seed.bathrooms,
      kitchens: seed.kitchens,
      parkingSpaces: seed.parkingSpaces,
      size: seed.size,
      petsAllowed: false,
      furnished: true,
      aircon: true,
      minimumAge: 21,
      location: trebinjeLocationId,
      address: 'Grad Sunca, Trebinje',
      price: seed.price,
      cancellation: -1,
      rentalTerm: movininTypes.RentalTerm.Daily,
      blockOnPay: true,
      parentProperty: building._id,
      countOfRooms: seed.countOfRooms,
      isBuilding: false,
    })
    await roomType.save()

    if (existingImage && cdnDir) {
      try {
        const srcPath = path.join(cdnDir, existingImage)
        const ext = path.extname(existingImage)
        const newName = `${roomType._id}_${Date.now()}${ext}`
        await asyncFs.copyFile(srcPath, path.join(cdnDir, newName))
        roomType.image = newName
        await roomType.save()
      } catch {
        // Image copy failed, proceed without
      }
    }

    totalRooms += seed.countOfRooms
    logger.info(`  Created room type: ${seed.name} (${seed.countOfRooms} rooms, €${seed.price}/night)`)
  }

  logger.info(`Done! Created 1 building + ${ROOM_TYPES.length} room types = ${totalRooms} total rooms.`)
  process.exit(0)
} catch (err) {
  logger.error('Seed error:', err)
  process.exit(1)
}
