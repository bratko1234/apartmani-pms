import { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as movininTypes from ':movinin-types'
import * as logger from '../utils/logger'
import Booking from '../models/Booking'
import Property from '../models/Property'
import User from '../models/User'
import { calculateBookingFinancials } from '../services/payoutService'

/**
 * Resolve the effective agency filter for owner endpoints.
 * - Admin with ?ownerId= → use that specific owner
 * - Admin without ?ownerId= → all agencies (returns null to skip agency filter)
 * - Agency user → always their own ID
 */
const resolveAgencyFilter = async (req: Request): Promise<mongoose.Types.ObjectId[] | null> => {
  const user = req.user
  if (!user?._id) {
    return []
  }

  const isAdmin = user.type === movininTypes.UserType.Admin
  const ownerIdParam = req.query.ownerId as string | undefined

  if (isAdmin && ownerIdParam) {
    return [new mongoose.Types.ObjectId(ownerIdParam)]
  }

  if (isAdmin) {
    const agencies = await User.find({ type: movininTypes.UserType.Agency }).select('_id').lean()
    return agencies.map((a) => a._id as mongoose.Types.ObjectId)
  }

  return [new mongoose.Types.ObjectId(String(user._id))]
}

/**
 * Get owner dashboard data.
 * Returns aggregate stats for the agency's properties.
 * Admin sees all agencies or a specific one via ?ownerId=
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      res.sendStatus(401)
      return
    }

    const agencyIds = await resolveAgencyFilter(req)
    if (!agencyIds || agencyIds.length === 0) {
      const emptyDashboard: movininTypes.OwnerDashboardData = {
        totalBookings: 0,
        upcomingBookings: 0,
        occupancyRate: 0,
        totalRevenue: 0,
        revenueBySource: [],
        upcomingBookingsList: [],
      }
      res.status(200).send(emptyDashboard)
      return
    }

    const agencyFilter = { $in: agencyIds }

    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const properties = await Property.find({ agency: agencyFilter }).select('_id').lean()
    const propertyIds = properties.map((p) => p._id)

    const activeStatuses = [
      movininTypes.BookingStatus.Paid,
      movininTypes.BookingStatus.Reserved,
      movininTypes.BookingStatus.Deposit,
    ]

    const [totalBookings, upcomingBookings, revenueAgg, upcomingBookingsList] = await Promise.all([
      Booking.countDocuments({
        agency: agencyFilter,
        status: { $in: activeStatuses },
      }),

      Booking.countDocuments({
        agency: agencyFilter,
        from: { $gte: now, $lte: thirtyDaysFromNow },
        status: { $in: activeStatuses },
      }),

      Booking.aggregate([
        {
          $match: {
            agency: agencyFilter,
            status: { $in: activeStatuses },
          },
        },
        {
          $group: {
            _id: '$source',
            bookings: { $sum: 1 },
            revenue: { $sum: '$price' },
            nights: {
              $sum: {
                $divide: [{ $subtract: ['$to', '$from'] }, 1000 * 60 * 60 * 24],
              },
            },
          },
        },
      ]),

      Booking.find({
        agency: agencyFilter,
        from: { $gte: now },
        status: { $in: activeStatuses },
      })
        .sort({ from: 1 })
        .limit(10)
        .populate('property', 'name')
        .populate('renter', 'fullName email')
        .lean(),
    ])

    const totalRevenue = revenueAgg.reduce((sum: number, r: Record<string, unknown>) => sum + (r.revenue as number || 0), 0)
    const totalNights = revenueAgg.reduce((sum: number, r: Record<string, unknown>) => sum + (r.nights as number || 0), 0)

    const daysInYear = 365
    const totalPropertyDays = propertyIds.length * daysInYear
    const occupancyRate = totalPropertyDays > 0 ? Math.round((totalNights / totalPropertyDays) * 100) : 0

    const revenueBySource: movininTypes.OwnerRevenueBySource[] = revenueAgg.map((r: Record<string, unknown>) => ({
      source: (r._id || movininTypes.BookingSource.Direct) as movininTypes.BookingSource,
      bookings: r.bookings as number,
      nights: Math.round(r.nights as number),
      revenue: r.revenue as number,
    }))

    const dashboard: movininTypes.OwnerDashboardData = {
      totalBookings,
      upcomingBookings,
      occupancyRate,
      totalRevenue,
      revenueBySource,
      upcomingBookingsList: upcomingBookingsList as unknown as movininTypes.Booking[],
    }

    res.status(200).send(dashboard)
  } catch (err) {
    logger.error('[owner.getDashboard]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}

/**
 * Get revenue breakdown for a specific month.
 */
export const getRevenue = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      res.sendStatus(401)
      return
    }

    const agencyIds = await resolveAgencyFilter(req)
    if (!agencyIds || agencyIds.length === 0) {
      res.status(200).send([])
      return
    }

    const agencyFilter = { $in: agencyIds }
    const year = parseInt(req.params.year, 10)
    const month = parseInt(req.params.month, 10)

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const bookings = await Booking.find({
      agency: agencyFilter,
      from: { $lt: endDate },
      to: { $gt: startDate },
      status: { $in: [movininTypes.BookingStatus.Paid, movininTypes.BookingStatus.Reserved, movininTypes.BookingStatus.Deposit] },
    })
      .populate('property', 'name')
      .lean()

    const revenueMap = new Map<string, movininTypes.OwnerRevenueRow>()

    for (const booking of bookings) {
      const property = booking.property as unknown as { _id: string; name: string }
      const source = (booking as unknown as { source?: movininTypes.BookingSource }).source || movininTypes.BookingSource.Direct
      const key = `${property._id}-${source}`

      const nights = Math.ceil(
        (new Date(booking.to).getTime() - new Date(booking.from).getTime()) / (1000 * 60 * 60 * 24),
      )

      const financials = calculateBookingFinancials(booking.price, source)

      const existing = revenueMap.get(key)
      if (existing) {
        revenueMap.set(key, {
          ...existing,
          bookings: existing.bookings + 1,
          nights: existing.nights + nights,
          grossRevenue: existing.grossRevenue + booking.price,
          otaCommission: Math.round((existing.otaCommission + financials.otaCommission) * 100) / 100,
          managementFee: Math.round((existing.managementFee + financials.managementFee) * 100) / 100,
          netToOwner: Math.round((existing.netToOwner + financials.netToOwner) * 100) / 100,
        })
      } else {
        revenueMap.set(key, {
          propertyId: property._id.toString(),
          propertyName: property.name,
          source,
          bookings: 1,
          nights,
          grossRevenue: booking.price,
          otaCommission: financials.otaCommission,
          managementFee: financials.managementFee,
          netToOwner: financials.netToOwner,
        })
      }
    }

    res.status(200).send(Array.from(revenueMap.values()))
  } catch (err) {
    logger.error('[owner.getRevenue]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}

/**
 * Get calendar data for a property in a specific month.
 */
export const getCalendar = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      res.sendStatus(401)
      return
    }

    const { propertyId } = req.params
    const year = parseInt(req.params.year, 10)
    const month = parseInt(req.params.month, 10)

    // Admin can view any property; agency can only view their own
    const isAdmin = req.user.type === movininTypes.UserType.Admin
    const propertyQuery: Record<string, unknown> = { _id: propertyId }
    if (!isAdmin) {
      propertyQuery.agency = req.user._id
    }

    const property = await Property.findOne(propertyQuery).lean()
    if (!property) {
      res.status(404).send({ message: 'Property not found' })
      return
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const bookings = await Booking.find({
      property: propertyId,
      from: { $lt: endDate },
      to: { $gt: startDate },
      status: { $ne: movininTypes.BookingStatus.Cancelled },
    })
      .populate('renter', 'fullName')
      .lean()

    const days: movininTypes.OwnerCalendarDay[] = []
    const cursor = new Date(startDate)

    while (cursor < endDate) {
      const dateStr = cursor.toISOString().split('T')[0]
      const booking = bookings.find((b) => {
        const from = new Date(b.from)
        const to = new Date(b.to)
        return cursor >= from && cursor < to
      })

      if (booking) {
        const renter = booking.renter as unknown as { fullName?: string } | undefined
        const source = (booking as unknown as { source?: movininTypes.BookingSource }).source
        const externalGuestName = (booking as unknown as { externalGuestName?: string }).externalGuestName

        days.push({
          date: dateStr,
          bookingId: booking._id.toString(),
          guestName: renter?.fullName || externalGuestName || 'Guest',
          source: source || movininTypes.BookingSource.Direct,
          status: booking.status,
        })
      } else {
        days.push({ date: dateStr })
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    res.status(200).send(days)
  } catch (err) {
    logger.error('[owner.getCalendar]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}

/**
 * Get occupancy trend for past N months.
 * For each month, calculates: booked nights / (propertyCount * daysInMonth).
 * Booking dates are clamped to month boundaries.
 */
export const getOccupancyTrend = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      res.sendStatus(401)
      return
    }

    const agencyIds = await resolveAgencyFilter(req)
    if (!agencyIds || agencyIds.length === 0) {
      res.status(200).send([])
      return
    }

    const agencyFilter = { $in: agencyIds }
    const months = Math.min(parseInt(req.query.months as string, 10) || 12, 24)

    const properties = await Property.find({ agency: agencyFilter }).select('_id').lean()
    const propertyCount = properties.length

    if (propertyCount === 0) {
      res.status(200).send([])
      return
    }

    const now = new Date()
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const activeStatuses = [
      movininTypes.BookingStatus.Paid,
      movininTypes.BookingStatus.Reserved,
      movininTypes.BookingStatus.Deposit,
    ]

    const trend: movininTypes.OccupancyTrendPoint[] = []

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(startOfCurrentMonth)
      monthStart.setMonth(monthStart.getMonth() - i)
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)

      const daysInMonth = Math.round(
        (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24),
      )
      const totalAvailableNights = propertyCount * daysInMonth

      const bookings = await Booking.find({
        agency: agencyFilter,
        from: { $lt: monthEnd },
        to: { $gt: monthStart },
        status: { $in: activeStatuses },
      })
        .select('from to')
        .lean()

      let bookedNights = 0
      for (const booking of bookings) {
        const clampedFrom = new Date(Math.max(new Date(booking.from).getTime(), monthStart.getTime()))
        const clampedTo = new Date(Math.min(new Date(booking.to).getTime(), monthEnd.getTime()))
        const nights = Math.max(
          0,
          Math.ceil((clampedTo.getTime() - clampedFrom.getTime()) / (1000 * 60 * 60 * 24)),
        )
        bookedNights += nights
      }

      const occupancyRate = totalAvailableNights > 0
        ? Math.round((bookedNights / totalAvailableNights) * 100)
        : 0

      const label = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`
      trend.push({ month: label, occupancyRate })
    }

    res.status(200).send(trend)
  } catch (err) {
    logger.error('[owner.getOccupancyTrend]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}

/**
 * Get revenue trend for past N months, broken down by booking source.
 * Aggregates price from Paid/Reserved/Deposit bookings grouped by source per month.
 */
export const getRevenueTrend = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      res.sendStatus(401)
      return
    }

    const agencyIds = await resolveAgencyFilter(req)
    if (!agencyIds || agencyIds.length === 0) {
      res.status(200).send([])
      return
    }

    const agencyFilter = { $in: agencyIds }
    const months = Math.min(parseInt(req.query.months as string, 10) || 12, 24)

    const now = new Date()
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const periodStart = new Date(startOfCurrentMonth)
    periodStart.setMonth(periodStart.getMonth() - (months - 1))

    const periodEnd = new Date(startOfCurrentMonth.getFullYear(), startOfCurrentMonth.getMonth() + 1, 1)

    const activeStatuses = [
      movininTypes.BookingStatus.Paid,
      movininTypes.BookingStatus.Reserved,
      movininTypes.BookingStatus.Deposit,
    ]

    const bookings = await Booking.find({
      agency: agencyFilter,
      from: { $lt: periodEnd },
      to: { $gt: periodStart },
      status: { $in: activeStatuses },
    })
      .select('from to price source')
      .lean()

    const revenueMap = new Map<string, movininTypes.RevenueTrendPoint>()

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(startOfCurrentMonth)
      monthStart.setMonth(monthStart.getMonth() - i)
      const label = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`
      revenueMap.set(label, {
        month: label,
        direct: 0,
        airbnb: 0,
        bookingCom: 0,
        expedia: 0,
        other: 0,
        total: 0,
      })
    }

    for (const booking of bookings) {
      const bookingFrom = new Date(booking.from)
      const bookingMonth = `${bookingFrom.getFullYear()}-${String(bookingFrom.getMonth() + 1).padStart(2, '0')}`

      const point = revenueMap.get(bookingMonth)
      if (!point) {
        continue
      }

      const price = booking.price || 0
      const source = (booking as unknown as { source?: movininTypes.BookingSource }).source || movininTypes.BookingSource.Direct

      switch (source) {
        case movininTypes.BookingSource.Direct:
          revenueMap.set(bookingMonth, { ...point, direct: point.direct + price, total: point.total + price })
          break
        case movininTypes.BookingSource.Airbnb:
          revenueMap.set(bookingMonth, { ...point, airbnb: point.airbnb + price, total: point.total + price })
          break
        case movininTypes.BookingSource.BookingCom:
          revenueMap.set(bookingMonth, { ...point, bookingCom: point.bookingCom + price, total: point.total + price })
          break
        case movininTypes.BookingSource.Expedia:
          revenueMap.set(bookingMonth, { ...point, expedia: point.expedia + price, total: point.total + price })
          break
        default:
          revenueMap.set(bookingMonth, { ...point, other: point.other + price, total: point.total + price })
          break
      }
    }

    const trend = Array.from(revenueMap.values())
    res.status(200).send(trend)
  } catch (err) {
    logger.error('[owner.getRevenueTrend]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}
