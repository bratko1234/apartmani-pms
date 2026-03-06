import mongoose from 'mongoose'
import * as movininTypes from ':movinin-types'
import Booking from '../models/Booking'
import Property from '../models/Property'
import OwnerPayout from '../models/OwnerPayout'
import User from '../models/User'
import * as logger from '../utils/logger'
import {
  OTA_COMMISSION_RATES,
  MANAGEMENT_FEE_RATE,
  DEFAULT_CLEANING_FEE,
} from '../config/commissions.config'

/**
 * Pure function: calculate financial breakdown for a single booking.
 */
export const calculateBookingFinancials = (
  grossRevenue: number,
  source: movininTypes.BookingSource,
): {
  otaCommission: number
  managementFee: number
  cleaningFee: number
  netToOwner: number
} => {
  const otaRate = OTA_COMMISSION_RATES[source] ?? 0
  const otaCommission = Math.round(grossRevenue * otaRate * 100) / 100
  const managementFee = Math.round(grossRevenue * MANAGEMENT_FEE_RATE * 100) / 100
  const cleaningFee = DEFAULT_CLEANING_FEE
  const netToOwner = Math.round((grossRevenue - otaCommission - managementFee - cleaningFee) * 100) / 100

  return { otaCommission, managementFee, cleaningFee, netToOwner }
}

/**
 * Generate (or re-generate) a monthly payout for a specific owner.
 * Uses the checkout date (booking.to) to determine which month a booking belongs to.
 * Upserts: if a draft payout exists for the same owner/period, it is replaced.
 */
export const generateMonthlyPayout = async (
  ownerId: string,
  year: number,
  month: number,
): Promise<movininTypes.OwnerPayout> => {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  const existingPayout = await OwnerPayout.findOne({
    ownerId: new mongoose.Types.ObjectId(ownerId),
    'period.year': year,
    'period.month': month,
  }).lean() as any

  if (existingPayout && existingPayout.status !== movininTypes.PayoutStatus.Draft) {
    throw new Error(`Payout for ${year}-${month} is already ${existingPayout.status} and cannot be regenerated`)
  }

  const properties = await Property.find({ agency: ownerId }).select('_id name').lean()
  const propertyIds = properties.map((p) => p._id)

  if (propertyIds.length === 0) {
    throw new Error('No properties found for this owner')
  }

  const bookings = await Booking.find({
    property: { $in: propertyIds },
    to: { $gte: startDate, $lt: endDate },
    status: {
      $in: [
        movininTypes.BookingStatus.Paid,
        movininTypes.BookingStatus.Reserved,
        movininTypes.BookingStatus.Deposit,
      ],
    },
  })
    .populate('renter', 'fullName')
    .lean()

  const propertyMap = new Map<string, { name: string; bookingLines: movininTypes.PayoutBookingLine[] }>()

  for (const prop of properties) {
    propertyMap.set(prop._id.toString(), {
      name: prop.name,
      bookingLines: [],
    })
  }

  for (const booking of bookings) {
    const propertyId = (booking.property as mongoose.Types.ObjectId).toString()
    const propEntry = propertyMap.get(propertyId)
    if (!propEntry) {
      continue
    }

    const source = (booking as unknown as { source?: movininTypes.BookingSource }).source
      || movininTypes.BookingSource.Direct
    const renter = booking.renter as unknown as { fullName?: string } | undefined
    const externalGuestName = (booking as unknown as { externalGuestName?: string }).externalGuestName
    const guestName = renter?.fullName || externalGuestName || 'Guest'

    const checkIn = new Date(booking.from).toISOString().split('T')[0]
    const checkOut = new Date(booking.to).toISOString().split('T')[0]
    const nights = Math.ceil(
      (new Date(booking.to).getTime() - new Date(booking.from).getTime()) / (1000 * 60 * 60 * 24),
    )

    const financials = calculateBookingFinancials(booking.price, source)

    propEntry.bookingLines.push({
      bookingId: booking._id.toString(),
      source,
      guestName,
      checkIn,
      checkOut,
      nights,
      grossRevenue: booking.price,
      ...financials,
    })
  }

  const payoutProperties: movininTypes.PayoutPropertyLine[] = []

  for (const [propId, entry] of propertyMap) {
    if (entry.bookingLines.length === 0) {
      continue
    }

    const totalGross = entry.bookingLines.reduce((sum, b) => sum + b.grossRevenue, 0)
    const totalOtaCommission = entry.bookingLines.reduce((sum, b) => sum + b.otaCommission, 0)
    const totalManagementFee = entry.bookingLines.reduce((sum, b) => sum + b.managementFee, 0)
    const totalCleaningFee = entry.bookingLines.reduce((sum, b) => sum + b.cleaningFee, 0)
    const totalNetToOwner = entry.bookingLines.reduce((sum, b) => sum + b.netToOwner, 0)

    payoutProperties.push({
      propertyId: propId,
      propertyName: entry.name,
      bookings: entry.bookingLines,
      totalGross: Math.round(totalGross * 100) / 100,
      totalOtaCommission: Math.round(totalOtaCommission * 100) / 100,
      totalManagementFee: Math.round(totalManagementFee * 100) / 100,
      totalCleaningFee: Math.round(totalCleaningFee * 100) / 100,
      totalNetToOwner: Math.round(totalNetToOwner * 100) / 100,
    })
  }

  const totalPayout = Math.round(
    payoutProperties.reduce((sum, p) => sum + p.totalNetToOwner, 0) * 100,
  ) / 100

  const payoutData = {
    ownerId: new mongoose.Types.ObjectId(ownerId),
    period: { month, year },
    properties: payoutProperties,
    totalPayout,
    status: movininTypes.PayoutStatus.Draft,
  }

  const result = await OwnerPayout.findOneAndUpdate(
    {
      ownerId: new mongoose.Types.ObjectId(ownerId),
      'period.year': year,
      'period.month': month,
    },
    { $set: payoutData },
    { upsert: true, new: true, lean: true },
  )

  return result as unknown as movininTypes.OwnerPayout
}

/**
 * Generate payouts for all owners (agencies) for a given month.
 */
export const generateAllPayouts = async (
  year: number,
  month: number,
): Promise<movininTypes.OwnerPayout[]> => {
  const owners = await User.find({ type: movininTypes.UserType.Agency }).select('_id').lean()
  const results: movininTypes.OwnerPayout[] = []

  for (const owner of owners) {
    try {
      const payout = await generateMonthlyPayout(owner._id.toString(), year, month)
      results.push(payout)
    } catch (err) {
      logger.warn(`[payoutService.generateAllPayouts] Skipping owner ${owner._id}: ${(err as Error).message}`)
    }
  }

  return results
}

/**
 * Approve one or more payouts (Draft -> Approved).
 */
export const approvePayouts = async (ids: string[]): Promise<number> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
  const result = await OwnerPayout.updateMany(
    {
      _id: { $in: objectIds },
      status: movininTypes.PayoutStatus.Draft,
    },
    { $set: { status: movininTypes.PayoutStatus.Approved } },
  )

  return result.modifiedCount
}

/**
 * Mark one or more payouts as paid (Approved -> Paid).
 */
export const markPayoutsPaid = async (
  ids: string[],
  paymentMethod?: string,
  notes?: string,
): Promise<number> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
  const updateFields: Record<string, unknown> = {
    status: movininTypes.PayoutStatus.Paid,
    paidAt: new Date(),
  }

  if (paymentMethod) {
    updateFields.paymentMethod = paymentMethod
  }
  if (notes) {
    updateFields.notes = notes
  }

  const result = await OwnerPayout.updateMany(
    {
      _id: { $in: objectIds },
      status: movininTypes.PayoutStatus.Approved,
    },
    { $set: updateFields },
  )

  return result.modifiedCount
}

/**
 * Get payouts with optional filters.
 */
export const getPayouts = async (
  query: movininTypes.GetPayoutsQuery,
): Promise<movininTypes.OwnerPayout[]> => {
  const filter: Record<string, unknown> = {}

  if (query.ownerId) {
    filter.ownerId = new mongoose.Types.ObjectId(query.ownerId)
  }
  if (query.year) {
    filter['period.year'] = query.year
  }
  if (query.month) {
    filter['period.month'] = query.month
  }
  if (query.status) {
    filter.status = query.status
  }

  const payouts = await OwnerPayout.find(filter)
    .populate('ownerId', 'fullName email')
    .sort({ 'period.year': -1, 'period.month': -1 })
    .lean()

  return payouts as unknown as movininTypes.OwnerPayout[]
}

/**
 * Get a single payout by ID.
 */
export const getPayoutById = async (payoutId: string): Promise<movininTypes.OwnerPayout | null> => {
  const payout = await OwnerPayout.findById(payoutId)
    .populate('ownerId', 'fullName email')
    .lean()

  return payout as unknown as movininTypes.OwnerPayout | null
}
