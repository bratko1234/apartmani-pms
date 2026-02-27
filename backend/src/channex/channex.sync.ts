import * as movininTypes from ':movinin-types'
import * as logger from '../utils/logger'
import * as channexService from './channex.service'
import * as channexMapper from './channex.mapper'
import Property from '../models/Property'
import Booking from '../models/Booking'
import LocationValue from '../models/LocationValue'

/**
 * Sync a single property to Channex.
 * Creates or updates the property in Channex and saves the mapping.
 */
export const syncProperty = async (propertyId: string): Promise<void> => {
  if (!channexService.isEnabled()) {
    logger.info('[channex.sync] Integration disabled')
    return
  }

  const property = await Property.findById(propertyId)
    .populate('location')
    .lean()

  if (!property) {
    throw new Error(`Property ${propertyId} not found`)
  }

  const populatedLocation = property.location as any
  const locationValueIds = (populatedLocation?.values || []) as string[]
  const locationValues = locationValueIds.length > 0
    ? await LocationValue.find({
        _id: { $in: locationValueIds },
        language: 'en',
      }).lean()
    : []
  const locationName = locationValues[0]?.value || ''

  const channexData = channexMapper.propertyToChannex(property as any, locationName)

  const existingMapping = await channexService.getMapping(
    propertyId,
    movininTypes.ChannexMappingType.Property,
  )

  if (existingMapping) {
    await channexService.updateProperty(existingMapping.channexId, channexData)
    await channexService.saveMapping(
      propertyId,
      movininTypes.ChannexMappingType.Property,
      existingMapping.channexId,
      'property',
    )
  } else {
    const channexId = await channexService.createProperty(channexData)
    if (channexId) {
      await channexService.saveMapping(
        propertyId,
        movininTypes.ChannexMappingType.Property,
        channexId,
        'property',
      )
    }
  }

  logger.info(`[channex.sync] Property ${propertyId} synced`)
}

/**
 * Sync all non-hidden properties to Channex.
 */
export const syncAllProperties = async (): Promise<{ synced: number; failed: number }> => {
  if (!channexService.isEnabled()) {
    return { synced: 0, failed: 0 }
  }

  const properties = await Property.find({ hidden: { $ne: true } }).select('_id').lean()

  let synced = 0
  let failed = 0

  for (const property of properties) {
    try {
      await syncProperty(property._id.toString())
      synced += 1
    } catch (err) {
      logger.error(`[channex.sync] Failed to sync property ${property._id}`, err)
      failed += 1
    }
  }

  logger.info(`[channex.sync] Sync complete: ${synced} synced, ${failed} failed`)
  return { synced, failed }
}

/**
 * Sync availability for a property to Channex.
 * Reads existing bookings and pushes blocked dates.
 */
export const syncPropertyAvailability = async (propertyId: string): Promise<void> => {
  if (!channexService.isEnabled()) {
    return
  }

  const mapping = await channexService.getMapping(
    propertyId,
    movininTypes.ChannexMappingType.RoomType,
  )

  if (!mapping) {
    logger.info(`[channex.sync] No room type mapping for property ${propertyId}, skipping availability sync`)
    return
  }

  const now = new Date()
  const futureDate = new Date()
  futureDate.setFullYear(futureDate.getFullYear() + 1)

  const bookings = await Booking.find({
    property: propertyId,
    status: {
      $in: [
        movininTypes.BookingStatus.Paid,
        movininTypes.BookingStatus.Reserved,
        movininTypes.BookingStatus.Deposit,
      ],
    },
    to: { $gte: now },
    from: { $lte: futureDate },
  }).lean()

  const blockedDates = new Set<string>()
  for (const booking of bookings) {
    const current = new Date(booking.from)
    const end = new Date(booking.to)
    while (current < end) {
      blockedDates.add(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
  }

  const availability: Record<string, unknown>[] = []
  const cursor = new Date(now)
  while (cursor <= futureDate) {
    const dateStr = cursor.toISOString().split('T')[0]
    availability.push({
      date: dateStr,
      availability: blockedDates.has(dateStr) ? 0 : 1,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  await channexService.pushAvailability(mapping.channexId, availability)
  logger.info(`[channex.sync] Availability synced for property ${propertyId}`)
}

/**
 * Sync rates for a property to Channex.
 */
export const syncPropertyRates = async (
  propertyId: string,
  rates?: { date: string; rate: number; minStay?: number }[],
): Promise<void> => {
  if (!channexService.isEnabled()) {
    return
  }

  const ratePlanMapping = await channexService.getMapping(
    propertyId,
    movininTypes.ChannexMappingType.RatePlan,
  )

  if (!ratePlanMapping) {
    logger.info(`[channex.sync] No rate plan mapping for property ${propertyId}, skipping rate sync`)
    return
  }

  if (!rates || rates.length === 0) {
    const property = await Property.findById(propertyId).lean()
    if (!property) {
      throw new Error(`Property ${propertyId} not found`)
    }

    const defaultRates: { date: string; rate: number }[] = []
    const cursor = new Date()
    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)
    while (cursor <= end) {
      defaultRates.push({
        date: cursor.toISOString().split('T')[0],
        rate: property.price,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    rates = defaultRates
  }

  const channexRates = channexMapper.ratesToChannex(ratePlanMapping.channexId, rates)
  await channexService.pushRates(ratePlanMapping.channexId, channexRates)
  logger.info(`[channex.sync] Rates synced for property ${propertyId}`)
}
