import * as movininTypes from ':movinin-types'
import * as logger from '../utils/logger'
import * as env from '../config/env.config'
import * as channexService from './channex.service'
import * as channexMapper from './channex.mapper'
import * as rateService from '../services/rateService'
import Property from '../models/Property'
import Booking from '../models/Booking'
import LocationValue from '../models/LocationValue'

/**
 * Resolve the Channex property ID for a given property.
 * For child properties (room types within a building), the Channex property
 * is the parent building. For standalone properties, it's the property itself.
 */
const resolveChannexPropertySource = async (
  property: env.Property,
  propertyId: string,
): Promise<{ channexSourceId: string; channexSourceProperty: env.Property; locationName: string }> => {
  let channexSourceProperty = property
  let channexSourceId = propertyId

  if (property.parentProperty) {
    const parent = await Property.findById(property.parentProperty)
      .populate('location')
      .lean()
    if (parent) {
      channexSourceProperty = parent as env.Property
      channexSourceId = parent._id.toString()
    }
  }

  const populatedLocation = channexSourceProperty.location as any
  const locationValueIds = (populatedLocation?.values || []) as string[]
  const locationValues = locationValueIds.length > 0
    ? await LocationValue.find({
        _id: { $in: locationValueIds },
        language: 'en',
      }).lean()
    : []
  const locationName = locationValues[0]?.value || ''

  return { channexSourceId, channexSourceProperty, locationName }
}

/**
 * Sync a single property to Channex — full lifecycle:
 * 1. Create/update property (uses parent if child)
 * 2. Create room type (if not mapped)
 * 3. Create rate plan (if not mapped)
 * 4. Push availability
 * 5. Push rates
 *
 * For buildings (isBuilding=true): syncs children as room types under one Channex property.
 * For standalone properties: 1 Channex property + 1 room type (unchanged behavior).
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

  // If this is a building, sync the building as a Channex property,
  // then sync each child room type individually.
  if (property.isBuilding) {
    await syncBuildingProperty(property as env.Property, propertyId)
    return
  }

  // Resolve which entity maps to the Channex property (parent for children, self for standalone)
  const { channexSourceId, channexSourceProperty, locationName } =
    await resolveChannexPropertySource(property as env.Property, propertyId)

  // 1. Create/update property in Channex
  const channexPropertyData = channexMapper.propertyToChannex(channexSourceProperty, locationName, channexSourceProperty.isBuilding)
  const existingPropertyMapping = await channexService.getMapping(
    channexSourceId,
    movininTypes.ChannexMappingType.Property,
  )

  let channexPropertyId: string

  if (existingPropertyMapping) {
    await channexService.updateProperty(existingPropertyMapping.channexId, channexPropertyData)
    channexPropertyId = existingPropertyMapping.channexId
    await channexService.saveMapping(
      channexSourceId,
      movininTypes.ChannexMappingType.Property,
      channexPropertyId,
      'property',
    )
  } else {
    const newId = await channexService.createProperty(channexPropertyData)
    if (!newId) {
      throw new Error(`Failed to create property ${channexSourceId} in Channex`)
    }
    channexPropertyId = newId
    await channexService.saveMapping(
      channexSourceId,
      movininTypes.ChannexMappingType.Property,
      channexPropertyId,
      'property',
    )
  }

  // 2. Create room type if no mapping exists
  const existingRoomMapping = await channexService.getMapping(
    propertyId,
    movininTypes.ChannexMappingType.RoomType,
  )

  let channexRoomTypeId: string

  if (existingRoomMapping) {
    channexRoomTypeId = existingRoomMapping.channexId
    logger.info(`[channex.sync] Room type already mapped: ${channexRoomTypeId}`)
  } else {
    const roomTypeData = channexMapper.propertyToRoomType(property as any, channexPropertyId)
    const newRoomTypeId = await channexService.createRoomType(roomTypeData)
    if (!newRoomTypeId) {
      throw new Error(`Failed to create room type for property ${propertyId}`)
    }
    channexRoomTypeId = newRoomTypeId
    await channexService.saveMapping(
      propertyId,
      movininTypes.ChannexMappingType.RoomType,
      channexRoomTypeId,
      'room_type',
    )
    logger.info(`[channex.sync] Room type created and mapped: ${channexRoomTypeId}`)
  }

  // 3. Create rate plan if no mapping exists
  const existingRateMapping = await channexService.getMapping(
    propertyId,
    movininTypes.ChannexMappingType.RatePlan,
  )

  let channexRatePlanId: string

  if (existingRateMapping) {
    channexRatePlanId = existingRateMapping.channexId
    logger.info(`[channex.sync] Rate plan already mapped: ${channexRatePlanId}`)
  } else {
    const ratePlanData = channexMapper.propertyToRatePlan(property as any, channexPropertyId, channexRoomTypeId)
    const newRatePlanId = await channexService.createRatePlan(ratePlanData)
    if (!newRatePlanId) {
      throw new Error(`Failed to create rate plan for property ${propertyId}`)
    }
    channexRatePlanId = newRatePlanId
    await channexService.saveMapping(
      propertyId,
      movininTypes.ChannexMappingType.RatePlan,
      channexRatePlanId,
      'rate_plan',
    )
    logger.info(`[channex.sync] Rate plan created and mapped: ${channexRatePlanId}`)
  }

  // 4. Push availability
  await syncPropertyAvailability(propertyId)

  // 5. Push rates
  await syncPropertyRates(propertyId)

  logger.info(`[channex.sync] Property ${propertyId} fully synced (property + room type + rate plan + availability + rates)`)
}

/**
 * Sync a building property — creates one Channex property,
 * then syncs each child as a room type under it.
 */
const syncBuildingProperty = async (building: env.Property, buildingId: string): Promise<void> => {
  const children = await Property.find({ parentProperty: buildingId, isBuilding: { $ne: true } }).lean()

  if (children.length === 0) {
    logger.info(`[channex.sync] Building ${buildingId} has no room types, skipping`)
    return
  }

  // Sync each child — they will all resolve to the same parent Channex property
  for (const child of children) {
    try {
      await syncProperty(child._id.toString())
    } catch (err) {
      logger.error(`[channex.sync] Failed to sync room type ${child._id} of building ${buildingId}`, err)
    }
  }

  logger.info(`[channex.sync] Building ${buildingId} synced with ${children.length} room types`)
}

/**
 * Sync all non-hidden properties to Channex.
 * Buildings are synced first (which syncs their children).
 * Standalone properties (no parent) are synced individually.
 * Child properties with a parent are skipped — they're synced via their building.
 */
export const syncAllProperties = async (): Promise<{ synced: number; failed: number }> => {
  if (!channexService.isEnabled()) {
    return { synced: 0, failed: 0 }
  }

  // Sync buildings first (they trigger child syncs)
  const buildings = await Property.find({ hidden: { $ne: true }, isBuilding: true }).select('_id').lean()
  // Then sync standalone properties (no parent, not a building)
  const standalones = await Property.find({
    hidden: { $ne: true },
    isBuilding: { $ne: true },
    parentProperty: null,
  }).select('_id').lean()

  const allToSync = [...buildings, ...standalones]
  let synced = 0
  let failed = 0

  for (const property of allToSync) {
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
 * For multi-room properties (countOfRooms > 1), availability = countOfRooms - overlapping bookings per day.
 * For single-room properties, availability = 0 or 1 (unchanged behavior).
 */
export const syncPropertyAvailability = async (propertyId: string): Promise<void> => {
  if (!channexService.isEnabled()) {
    return
  }

  const property = await Property.findById(propertyId).lean()
  if (!property) {
    logger.info(`[channex.sync] Property ${propertyId} not found, skipping availability sync`)
    return
  }

  // For child properties, the Channex property mapping is on the parent
  const channexPropertySourceId = property.parentProperty
    ? property.parentProperty.toString()
    : propertyId

  const propertyMapping = await channexService.getMapping(
    channexPropertySourceId,
    movininTypes.ChannexMappingType.Property,
  )
  const roomTypeMapping = await channexService.getMapping(
    propertyId,
    movininTypes.ChannexMappingType.RoomType,
  )

  if (!propertyMapping || !roomTypeMapping) {
    logger.info(`[channex.sync] Missing mappings for property ${propertyId}, skipping availability sync`)
    return
  }

  const totalRooms = property.countOfRooms || 1
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

  // Count overlapping bookings per date
  const dateBookingCount = new Map<string, number>()
  for (const booking of bookings) {
    const current = new Date(booking.from)
    const end = new Date(booking.to)
    while (current < end) {
      const dateStr = current.toISOString().split('T')[0]
      dateBookingCount.set(dateStr, (dateBookingCount.get(dateStr) || 0) + 1)
      current.setDate(current.getDate() + 1)
    }
  }

  const rawDates: { date: string; availability: number }[] = []
  const cursor = new Date(now)
  while (cursor <= futureDate) {
    const dateStr = cursor.toISOString().split('T')[0]
    const booked = dateBookingCount.get(dateStr) || 0
    rawDates.push({
      date: dateStr,
      availability: Math.max(0, totalRooms - booked),
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  const availability = channexMapper.availabilityToChannex(
    propertyMapping.channexId,
    roomTypeMapping.channexId,
    rawDates,
  )

  await channexService.pushAvailability(availability)
  logger.info(`[channex.sync] Availability synced for property ${propertyId} (${totalRooms} rooms)`)
}

/**
 * Sync rates for a property to Channex using ARI restrictions format.
 */
export const syncPropertyRates = async (
  propertyId: string,
  rates?: { date: string; rate: number; minStay?: number }[],
): Promise<void> => {
  if (!channexService.isEnabled()) {
    return
  }

  const propertyMapping = await channexService.getMapping(
    propertyId,
    movininTypes.ChannexMappingType.Property,
  )
  const ratePlanMapping = await channexService.getMapping(
    propertyId,
    movininTypes.ChannexMappingType.RatePlan,
  )

  if (!propertyMapping || !ratePlanMapping) {
    logger.info(`[channex.sync] Missing mappings for property ${propertyId}, skipping rate sync`)
    return
  }

  let effectiveRates: { date: string; rate: number; minStay?: number }[]

  if (rates && rates.length > 0) {
    effectiveRates = rates
  } else {
    const now = new Date()
    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)

    try {
      const schedule = await rateService.getRateSchedule(
        propertyId,
        now,
        end,
        movininTypes.RateChannel.All,
      )
      effectiveRates = schedule.map((day) => ({
        date: day.date,
        rate: day.rate,
        minStay: day.minStay,
      }))
    } catch (err) {
      logger.error(`[channex.sync] Failed to get rate schedule for ${propertyId}, falling back to property price`, err)
      const property = await Property.findById(propertyId).lean()
      if (!property) {
        throw new Error(`Property ${propertyId} not found`)
      }

      const defaultRates: { date: string; rate: number }[] = []
      const cursor = new Date(now)
      while (cursor <= end) {
        defaultRates.push({
          date: cursor.toISOString().split('T')[0],
          rate: property.price,
        })
        cursor.setDate(cursor.getDate() + 1)
      }
      effectiveRates = defaultRates
    }
  }

  const channexRates = channexMapper.ratesToChannex(
    propertyMapping.channexId,
    ratePlanMapping.channexId,
    effectiveRates,
  )
  await channexService.pushRates(channexRates)
  logger.info(`[channex.sync] Rates synced for property ${propertyId}`)
}
