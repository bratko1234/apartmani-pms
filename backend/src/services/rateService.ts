import mongoose from 'mongoose'
import * as movininTypes from ':movinin-types'
import RateSeason from '../models/RateSeason'
import RateDiscount from '../models/RateDiscount'
import Property from '../models/Property'
import * as logger from '../utils/logger'

/**
 * Get the effective nightly rate for a property on a given date.
 * Finds the matching active season; falls back to property.price.
 */
export const getEffectiveRate = async (
  propertyId: string,
  date: Date,
  channel: movininTypes.RateChannel = movininTypes.RateChannel.All,
): Promise<{ rate: number; seasonName?: string; minStay: number }> => {
  const channelFilter = channel === movininTypes.RateChannel.All
    ? { $in: [movininTypes.RateChannel.All] }
    : { $in: [movininTypes.RateChannel.All, channel] }

  const season = await RateSeason.findOne({
    property: new mongoose.Types.ObjectId(propertyId),
    active: true,
    startDate: { $lte: date },
    endDate: { $gte: date },
    channel: channelFilter,
  })
    .sort({ nightlyRate: -1 })
    .lean()

  if (season) {
    return {
      rate: season.nightlyRate,
      seasonName: season.name,
      minStay: season.minStay,
    }
  }

  const property = await Property.findById(propertyId).select('price').lean()
  if (!property) {
    throw new Error(`Property ${propertyId} not found`)
  }

  return {
    rate: property.price,
    seasonName: undefined,
    minStay: 1,
  }
}

/**
 * Get a per-day rate schedule for a date range.
 */
export const getRateSchedule = async (
  propertyId: string,
  from: Date,
  to: Date,
  channel: movininTypes.RateChannel = movininTypes.RateChannel.All,
): Promise<movininTypes.DailyRate[]> => {
  const channelFilter = channel === movininTypes.RateChannel.All
    ? { $in: [movininTypes.RateChannel.All] }
    : { $in: [movininTypes.RateChannel.All, channel] }

  const seasons = await RateSeason.find({
    property: new mongoose.Types.ObjectId(propertyId),
    active: true,
    startDate: { $lte: to },
    endDate: { $gte: from },
    channel: channelFilter,
  })
    .sort({ nightlyRate: -1 })
    .lean()

  const property = await Property.findById(propertyId).select('price').lean()
  if (!property) {
    throw new Error(`Property ${propertyId} not found`)
  }

  const schedule: movininTypes.DailyRate[] = []
  const cursor = new Date(from)

  while (cursor < to) {
    const dateStr = cursor.toISOString().split('T')[0]

    const matchingSeason = seasons.find((s) => {
      const start = new Date(s.startDate)
      const end = new Date(s.endDate)
      return cursor >= start && cursor <= end
    })

    schedule.push({
      date: dateStr,
      rate: matchingSeason ? matchingSeason.nightlyRate : property.price,
      seasonName: matchingSeason?.name,
      minStay: matchingSeason?.minStay ?? 1,
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  return schedule
}

/**
 * Calculate the total price for a stay, applying the best applicable discount.
 */
export const calculateStayPrice = async (
  propertyId: string,
  from: Date,
  to: Date,
  channel: movininTypes.RateChannel = movininTypes.RateChannel.All,
  isMember: boolean = false,
): Promise<movininTypes.StayPriceResult> => {
  const schedule = await getRateSchedule(propertyId, from, to, channel)
  const nights = schedule.length

  if (nights === 0) {
    throw new Error('Stay must be at least 1 night')
  }

  const totalPrice = schedule.reduce((sum, day) => sum + day.rate, 0)
  const averageNightlyRate = totalPrice / nights

  const discountChannelFilter = channel === movininTypes.RateChannel.Direct
    ? { $in: [movininTypes.DiscountChannel.All, movininTypes.DiscountChannel.Direct] }
    : { $in: [movininTypes.DiscountChannel.All] }

  const discounts = await RateDiscount.find({
    property: new mongoose.Types.ObjectId(propertyId),
    active: true,
    channelRestriction: discountChannelFilter,
  }).lean()

  const daysUntilCheckin = Math.ceil(
    (from.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  )

  let bestDiscount: { type: movininTypes.DiscountType; percent: number } | undefined

  for (const discount of discounts) {
    let applicable = false

    switch (discount.type) {
      case movininTypes.DiscountType.LastMinute:
        if (
          discount.daysBeforeCheckin
          && daysUntilCheckin <= discount.daysBeforeCheckin
          && daysUntilCheckin >= 0
        ) {
          applicable = true
        }
        break

      case movininTypes.DiscountType.LongStayWeekly:
        if (discount.minNights && nights >= discount.minNights) {
          applicable = true
        }
        break

      case movininTypes.DiscountType.LongStayMonthly:
        if (discount.minNights && nights >= discount.minNights) {
          applicable = true
        }
        break

      case movininTypes.DiscountType.Member:
        if (isMember) {
          applicable = true
        }
        break

      default:
        break
    }

    if (applicable) {
      if (!bestDiscount || discount.discountPercent > bestDiscount.percent) {
        bestDiscount = {
          type: discount.type,
          percent: discount.discountPercent,
        }
      }
    }
  }

  const savings = bestDiscount
    ? Math.round((totalPrice * bestDiscount.percent) / 100 * 100) / 100
    : 0
  const finalPrice = Math.round((totalPrice - savings) * 100) / 100

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    nightlyBreakdown: schedule,
    averageNightlyRate: Math.round(averageNightlyRate * 100) / 100,
    nights,
    discountApplied: bestDiscount
      ? {
          type: bestDiscount.type,
          percent: bestDiscount.percent,
          savings,
        }
      : undefined,
    finalPrice,
  }
}

// -------------------------------------------------------------------
// CRUD operations for seasons
// -------------------------------------------------------------------

/**
 * Validate that a new season does not overlap with existing ones
 * for the same property and channel scope.
 */
const validateNoOverlap = async (
  propertyId: string,
  startDate: Date,
  endDate: Date,
  channel: movininTypes.RateChannel,
  excludeId?: string,
): Promise<string | null> => {
  const channelMatch =
    channel === movininTypes.RateChannel.All
      ? {}
      : { channel: { $in: [movininTypes.RateChannel.All, channel] } }

  const query: Record<string, unknown> = {
    property: new mongoose.Types.ObjectId(propertyId),
    active: true,
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
    ...channelMatch,
  }

  if (excludeId) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeId) }
  }

  const overlap = await RateSeason.findOne(query).lean()
  if (overlap) {
    return `Overlaps with existing season "${overlap.name}" (${new Date(overlap.startDate).toISOString().split('T')[0]} - ${new Date(overlap.endDate).toISOString().split('T')[0]})`
  }

  return null
}

export const createSeason = async (
  payload: movininTypes.CreateRateSeasonPayload,
): Promise<movininTypes.RateSeason> => {
  const startDate = new Date(payload.startDate)
  const endDate = new Date(payload.endDate)

  if (endDate <= startDate) {
    throw new Error('End date must be after start date')
  }

  const overlapError = await validateNoOverlap(
    payload.property,
    startDate,
    endDate,
    payload.channel || movininTypes.RateChannel.All,
  )
  if (overlapError) {
    throw new Error(overlapError)
  }

  const season = new RateSeason({
    property: new mongoose.Types.ObjectId(payload.property),
    name: payload.name,
    startDate,
    endDate,
    nightlyRate: payload.nightlyRate,
    minStay: payload.minStay ?? 1,
    maxStay: payload.maxStay,
    channel: payload.channel ?? movininTypes.RateChannel.All,
    active: payload.active ?? true,
  })

  const saved = await season.save()
  logger.info(`[rateService] Season created: ${saved._id}`)
  return saved.toObject() as unknown as movininTypes.RateSeason
}

export const updateSeason = async (
  id: string,
  payload: movininTypes.UpdateRateSeasonPayload,
): Promise<movininTypes.RateSeason | null> => {
  const startDate = new Date(payload.startDate)
  const endDate = new Date(payload.endDate)

  if (endDate <= startDate) {
    throw new Error('End date must be after start date')
  }

  const overlapError = await validateNoOverlap(
    payload.property,
    startDate,
    endDate,
    payload.channel || movininTypes.RateChannel.All,
    id,
  )
  if (overlapError) {
    throw new Error(overlapError)
  }

  const updated = await RateSeason.findByIdAndUpdate(
    id,
    {
      name: payload.name,
      startDate,
      endDate,
      nightlyRate: payload.nightlyRate,
      minStay: payload.minStay ?? 1,
      maxStay: payload.maxStay,
      channel: payload.channel ?? movininTypes.RateChannel.All,
      active: payload.active ?? true,
    },
    { new: true },
  ).lean()

  if (updated) {
    logger.info(`[rateService] Season updated: ${id}`)
  }

  return updated as unknown as movininTypes.RateSeason | null
}

export const deleteSeason = async (id: string): Promise<boolean> => {
  const result = await RateSeason.findByIdAndDelete(id)
  if (result) {
    logger.info(`[rateService] Season deleted: ${id}`)
    return true
  }
  return false
}

export const getSeasons = async (propertyId: string): Promise<movininTypes.RateSeason[]> => {
  const seasons = await RateSeason.find({
    property: new mongoose.Types.ObjectId(propertyId),
  })
    .sort({ startDate: 1 })
    .lean()

  return seasons as unknown as movininTypes.RateSeason[]
}

// -------------------------------------------------------------------
// CRUD operations for discounts
// -------------------------------------------------------------------

export const createDiscount = async (
  payload: movininTypes.CreateRateDiscountPayload,
): Promise<movininTypes.RateDiscount> => {
  if (payload.discountPercent <= 0 || payload.discountPercent > 100) {
    throw new Error('Discount percent must be between 1 and 100')
  }

  const discount = new RateDiscount({
    property: new mongoose.Types.ObjectId(payload.property),
    type: payload.type,
    discountPercent: payload.discountPercent,
    daysBeforeCheckin: payload.daysBeforeCheckin,
    minNights: payload.minNights,
    channelRestriction: payload.channelRestriction ?? movininTypes.DiscountChannel.All,
    active: payload.active ?? true,
  })

  const saved = await discount.save()
  logger.info(`[rateService] Discount created: ${saved._id}`)
  return saved.toObject() as unknown as movininTypes.RateDiscount
}

export const updateDiscount = async (
  id: string,
  payload: movininTypes.UpdateRateDiscountPayload,
): Promise<movininTypes.RateDiscount | null> => {
  if (payload.discountPercent <= 0 || payload.discountPercent > 100) {
    throw new Error('Discount percent must be between 1 and 100')
  }

  const updated = await RateDiscount.findByIdAndUpdate(
    id,
    {
      type: payload.type,
      discountPercent: payload.discountPercent,
      daysBeforeCheckin: payload.daysBeforeCheckin,
      minNights: payload.minNights,
      channelRestriction: payload.channelRestriction ?? movininTypes.DiscountChannel.All,
      active: payload.active ?? true,
    },
    { new: true },
  ).lean()

  if (updated) {
    logger.info(`[rateService] Discount updated: ${id}`)
  }

  return updated as unknown as movininTypes.RateDiscount | null
}

export const deleteDiscount = async (id: string): Promise<boolean> => {
  const result = await RateDiscount.findByIdAndDelete(id)
  if (result) {
    logger.info(`[rateService] Discount deleted: ${id}`)
    return true
  }
  return false
}

export const getDiscounts = async (propertyId: string): Promise<movininTypes.RateDiscount[]> => {
  const discounts = await RateDiscount.find({
    property: new mongoose.Types.ObjectId(propertyId),
  })
    .sort({ type: 1 })
    .lean()

  return discounts as unknown as movininTypes.RateDiscount[]
}
