import 'dotenv/config'
import asyncFs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import * as movininTypes from ':movinin-types'
import * as env from '../config/env.config'
import * as databaseHelper from '../utils/databaseHelper'
import Property from '../models/Property'
import User from '../models/User'
import Location from '../models/Location'
import LocationValue from '../models/LocationValue'
import Country from '../models/Country'
import * as logger from '../utils/logger'

interface LocationSeed {
  name: string
  nameFr: string
  nameSr: string
}

interface PropertySeed {
  name: string
  type: movininTypes.PropertyType
  description: string
  bedrooms: number
  bathrooms: number
  kitchens: number
  parkingSpaces: number
  size: number
  price: number
  petsAllowed: boolean
  furnished: boolean
  aircon: boolean
  minimumAge: number
  rentalTerm: movininTypes.RentalTerm
  address: string
  locationName: string
}

const LOCATIONS: LocationSeed[] = [
  { name: 'Mostar', nameFr: 'Mostar', nameSr: 'Mostar' },
  { name: 'Neum', nameFr: 'Neum', nameSr: 'Neum' },
]

const PROPERTIES: PropertySeed[] = [
  // Trebinje (existing location)
  { name: 'Apartman Stari Grad', type: movininTypes.PropertyType.Apartment, description: '<p>Udoban apartman u srcu starog grada Trebinja.</p>', bedrooms: 2, bathrooms: 1, kitchens: 1, parkingSpaces: 1, size: 65, price: 55, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Stari Grad bb, Trebinje', locationName: 'Trebinje' },
  { name: 'Vila Lastva', type: movininTypes.PropertyType.House, description: '<p>Luksuzna vila sa bazenom i prostranom baštom.</p>', bedrooms: 3, bathrooms: 2, kitchens: 1, parkingSpaces: 2, size: 150, price: 120, petsAllowed: true, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Lastva, Trebinje', locationName: 'Trebinje' },
  { name: 'Studio Centar', type: movininTypes.PropertyType.Apartment, description: '<p>Moderan studio apartman u centru grada.</p>', bedrooms: 1, bathrooms: 1, kitchens: 1, parkingSpaces: 0, size: 35, price: 35, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Jovana Dučića 15, Trebinje', locationName: 'Trebinje' },
  { name: 'Apartman Trebišnjica', type: movininTypes.PropertyType.Apartment, description: '<p>Prostran apartman sa pogledom na rijeku Trebišnjicu.</p>', bedrooms: 2, bathrooms: 1, kitchens: 1, parkingSpaces: 1, size: 70, price: 60, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Obala Luke Vukalovića, Trebinje', locationName: 'Trebinje' },
  { name: 'Kuća Tvrdoš', type: movininTypes.PropertyType.House, description: '<p>Tradicionalna kamena kuća u blizini manastira Tvrdoš.</p>', bedrooms: 2, bathrooms: 1, kitchens: 1, parkingSpaces: 2, size: 90, price: 75, petsAllowed: true, furnished: true, aircon: false, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Tvrdoš, Trebinje', locationName: 'Trebinje' },
  { name: 'Lux Penthouse', type: movininTypes.PropertyType.Apartment, description: '<p>Premium penthouse sa panoramskim pogledom na grad.</p>', bedrooms: 3, bathrooms: 2, kitchens: 1, parkingSpaces: 2, size: 120, price: 150, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Dučićeva bb, Trebinje', locationName: 'Trebinje' },
  { name: 'Apartman Platani', type: movininTypes.PropertyType.Apartment, description: '<p>Ugodan apartman u aleji platana.</p>', bedrooms: 1, bathrooms: 1, kitchens: 1, parkingSpaces: 1, size: 45, price: 40, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Aleja Platana, Trebinje', locationName: 'Trebinje' },
  { name: 'Vila Arslanagića Most', type: movininTypes.PropertyType.House, description: '<p>Prekrasna vila sa pogledom na Arslanagića most.</p>', bedrooms: 3, bathrooms: 2, kitchens: 1, parkingSpaces: 2, size: 130, price: 110, petsAllowed: true, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Arslanagića Most, Trebinje', locationName: 'Trebinje' },
  { name: 'Gradska Kuća', type: movininTypes.PropertyType.Townhouse, description: '<p>Renovirana gradska kuća u centru.</p>', bedrooms: 2, bathrooms: 1, kitchens: 1, parkingSpaces: 1, size: 85, price: 65, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Vuka Karadžića 8, Trebinje', locationName: 'Trebinje' },

  // Mostar
  { name: 'Apartman Stari Most', type: movininTypes.PropertyType.Apartment, description: '<p>Apartman sa pogledom na Stari Most i Neretvu.</p>', bedrooms: 2, bathrooms: 1, kitchens: 1, parkingSpaces: 0, size: 60, price: 70, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Kujundžiluk 5, Mostar', locationName: 'Mostar' },
  { name: 'Vila Blagaj', type: movininTypes.PropertyType.House, description: '<p>Kamena vila u Blagaju, blizu tekije i izvora Bune.</p>', bedrooms: 3, bathrooms: 2, kitchens: 1, parkingSpaces: 2, size: 140, price: 130, petsAllowed: true, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Blagaj, Mostar', locationName: 'Mostar' },
  { name: 'Studio Mepas', type: movininTypes.PropertyType.Apartment, description: '<p>Moderan studio u blizini Mepas Malla.</p>', bedrooms: 1, bathrooms: 1, kitchens: 1, parkingSpaces: 1, size: 32, price: 40, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Kardinala Stepinca bb, Mostar', locationName: 'Mostar' },
  { name: 'Apartman Neretva', type: movininTypes.PropertyType.Apartment, description: '<p>Prostran apartman na obali Neretve sa balkonom.</p>', bedrooms: 2, bathrooms: 1, kitchens: 1, parkingSpaces: 1, size: 75, price: 65, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Bulevar, Mostar', locationName: 'Mostar' },
  { name: 'Kuća Počitelj', type: movininTypes.PropertyType.House, description: '<p>Renovirana kamena kuća u istorijskom Počitelju.</p>', bedrooms: 2, bathrooms: 1, kitchens: 1, parkingSpaces: 1, size: 80, price: 85, petsAllowed: false, furnished: true, aircon: false, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Počitelj, Mostar', locationName: 'Mostar' },
  { name: 'Lux Suite Mostar', type: movininTypes.PropertyType.Apartment, description: '<p>Luksuzni suite sa jacuzzijem i pogledom na grad.</p>', bedrooms: 2, bathrooms: 2, kitchens: 1, parkingSpaces: 1, size: 95, price: 140, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Rade Bitange 2, Mostar', locationName: 'Mostar' },
  { name: 'Apartman Muslibegović', type: movininTypes.PropertyType.Apartment, description: '<p>Apartman u stilu osmanskog naslijeđa, blizu muzeja.</p>', bedrooms: 1, bathrooms: 1, kitchens: 1, parkingSpaces: 0, size: 50, price: 55, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Osmana Đikića, Mostar', locationName: 'Mostar' },
  { name: 'Vila Fortica', type: movininTypes.PropertyType.House, description: '<p>Vila na brdu iznad grada sa panoramskim pogledom.</p>', bedrooms: 4, bathrooms: 2, kitchens: 1, parkingSpaces: 3, size: 180, price: 160, petsAllowed: true, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Fortica, Mostar', locationName: 'Mostar' },

  // Neum
  { name: 'Apartman Plaža', type: movininTypes.PropertyType.Apartment, description: '<p>Apartman na samoj plaži sa pogledom na more.</p>', bedrooms: 2, bathrooms: 1, kitchens: 1, parkingSpaces: 1, size: 55, price: 80, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Šetalište, Neum', locationName: 'Neum' },
  { name: 'Vila Sunce', type: movininTypes.PropertyType.House, description: '<p>Luksuzna vila sa privatnom plažom i terasom.</p>', bedrooms: 3, bathrooms: 2, kitchens: 1, parkingSpaces: 2, size: 160, price: 180, petsAllowed: true, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Tiha Luka, Neum', locationName: 'Neum' },
  { name: 'Studio More', type: movininTypes.PropertyType.Apartment, description: '<p>Kompaktan studio sa pogledom na Jadransko more.</p>', bedrooms: 1, bathrooms: 1, kitchens: 1, parkingSpaces: 0, size: 30, price: 50, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Zagrebačka 12, Neum', locationName: 'Neum' },
  { name: 'Apartman Jadran', type: movininTypes.PropertyType.Apartment, description: '<p>Prostran apartman sa velikom terasom i roštiljem.</p>', bedrooms: 2, bathrooms: 1, kitchens: 1, parkingSpaces: 1, size: 65, price: 75, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Jadranska 8, Neum', locationName: 'Neum' },
  { name: 'Penthouse Neum', type: movininTypes.PropertyType.Apartment, description: '<p>Penthouse na vrhu zgrade sa 360° pogledom na more.</p>', bedrooms: 3, bathrooms: 2, kitchens: 1, parkingSpaces: 2, size: 110, price: 200, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Magistrala bb, Neum', locationName: 'Neum' },
  { name: 'Kuća Klek', type: movininTypes.PropertyType.House, description: '<p>Kuća na poluostrvu Klek sa privatnom plažom.</p>', bedrooms: 4, bathrooms: 2, kitchens: 1, parkingSpaces: 2, size: 170, price: 190, petsAllowed: true, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Klek, Neum', locationName: 'Neum' },
  { name: 'Apartman Rivijera', type: movininTypes.PropertyType.Apartment, description: '<p>Apartman na rivijeri, 50 metara od plaže.</p>', bedrooms: 1, bathrooms: 1, kitchens: 1, parkingSpaces: 1, size: 40, price: 60, petsAllowed: false, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Rivijera, Neum', locationName: 'Neum' },
  { name: 'Vila Mediteran', type: movininTypes.PropertyType.House, description: '<p>Mediteranska vila sa maslinovim gajem i bazenom.</p>', bedrooms: 3, bathrooms: 2, kitchens: 1, parkingSpaces: 2, size: 145, price: 170, petsAllowed: true, furnished: true, aircon: true, minimumAge: 21, rentalTerm: movininTypes.RentalTerm.Daily, address: 'Hutovo, Neum', locationName: 'Neum' },
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

  // Find country
  const country = await Country.findOne({})
  if (!country) {
    logger.error('No country found. Create one first.')
    process.exit(1)
  }
  logger.info(`Country: ${country._id}`)

  // Create locations
  const locationMap: Record<string, mongoose.Types.ObjectId> = {}

  // Load existing locations
  const existingLocations = await Location.find({}).populate('values')
  for (const loc of existingLocations) {
    const vals = loc.values as any[]
    const enVal = vals.find((v: any) => v.language === 'en')
    if (enVal) {
      locationMap[enVal.value] = loc._id as mongoose.Types.ObjectId
    }
  }

  // Create new locations
  for (const locSeed of LOCATIONS) {
    if (locationMap[locSeed.name]) {
      logger.info(`Location "${locSeed.name}" already exists`)
      continue
    }

    const enValue = new LocationValue({ language: 'en', value: locSeed.name })
    const frValue = new LocationValue({ language: 'fr', value: locSeed.nameFr })
    const srValue = new LocationValue({ language: 'sr', value: locSeed.nameSr })
    await enValue.save()
    await frValue.save()
    await srValue.save()

    const location = new Location({
      country: country._id,
      values: [enValue._id, frValue._id, srValue._id],
    })
    await location.save()
    locationMap[locSeed.name] = location._id as mongoose.Types.ObjectId
    logger.info(`Created location: ${locSeed.name}`)
  }

  // Find existing image to copy
  const existingProperty = await Property.findOne({ image: { $exists: true, $ne: '' } })
  const existingImage = existingProperty?.image || ''
  const cdnDir = env.CDN_PROPERTIES

  // Create properties
  let created = 0
  for (const seed of PROPERTIES) {
    const exists = await Property.findOne({ name: seed.name })
    if (exists) {
      logger.info(`Skipping "${seed.name}" — exists`)
      continue
    }

    const locId = locationMap[seed.locationName]
    if (!locId) {
      logger.error(`Location "${seed.locationName}" not found, skipping "${seed.name}"`)
      continue
    }

    const property = new Property({
      name: seed.name,
      type: seed.type,
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
      petsAllowed: seed.petsAllowed,
      furnished: seed.furnished,
      aircon: seed.aircon,
      minimumAge: seed.minimumAge,
      location: locId,
      address: seed.address,
      price: seed.price,
      cancellation: -1,
      rentalTerm: seed.rentalTerm,
      blockOnPay: true,
    })
    await property.save()

    if (existingImage && cdnDir) {
      try {
        const srcPath = path.join(cdnDir, existingImage)
        const ext = path.extname(existingImage)
        const newName = `${property._id}_${Date.now()}${ext}`
        await asyncFs.copyFile(srcPath, path.join(cdnDir, newName))
        property.image = newName
        await property.save()
      } catch {
        // Image copy failed, proceed without
      }
    }

    created++
    logger.info(`Created "${seed.name}" in ${seed.locationName}`)
  }

  logger.info(`Done! Created ${created} new properties.`)
  process.exit(0)
} catch (err) {
  logger.error('Seed error:', err)
  process.exit(1)
}
