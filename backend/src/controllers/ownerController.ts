import { Request, Response } from 'express'
import * as movininTypes from ':movinin-types'
import * as logger from '../utils/logger'
import Booking from '../models/Booking'
import Property from '../models/Property'

/**
 * Get owner dashboard data.
 * Returns aggregate stats for the agency's properties.
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const agencyId = req.user?._id
    if (!agencyId) {
      res.sendStatus(401)
      return
    }

    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const properties = await Property.find({ agency: agencyId }).select('_id').lean()
    const propertyIds = properties.map((p) => p._id)

    const [totalBookings, upcomingBookings, revenueAgg, upcomingBookingsList] = await Promise.all([
      Booking.countDocuments({
        agency: agencyId,
        status: { $in: [movininTypes.BookingStatus.Paid, movininTypes.BookingStatus.Reserved, movininTypes.BookingStatus.Deposit] },
      }),

      Booking.countDocuments({
        agency: agencyId,
        from: { $gte: now, $lte: thirtyDaysFromNow },
        status: { $in: [movininTypes.BookingStatus.Paid, movininTypes.BookingStatus.Reserved, movininTypes.BookingStatus.Deposit] },
      }),

      Booking.aggregate([
        {
          $match: {
            agency: { $in: [agencyId].map((id) => new (require('mongoose').Types.ObjectId)(id)) },
            status: { $in: [movininTypes.BookingStatus.Paid, movininTypes.BookingStatus.Reserved, movininTypes.BookingStatus.Deposit] },
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
        agency: agencyId,
        from: { $gte: now },
        status: { $in: [movininTypes.BookingStatus.Paid, movininTypes.BookingStatus.Reserved, movininTypes.BookingStatus.Deposit] },
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
    const agencyId = req.user?._id
    if (!agencyId) {
      res.sendStatus(401)
      return
    }

    const year = parseInt(req.params.year, 10)
    const month = parseInt(req.params.month, 10)

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const bookings = await Booking.find({
      agency: agencyId,
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

      const existing = revenueMap.get(key)
      if (existing) {
        revenueMap.set(key, {
          ...existing,
          bookings: existing.bookings + 1,
          nights: existing.nights + nights,
          grossRevenue: existing.grossRevenue + booking.price,
        })
      } else {
        revenueMap.set(key, {
          propertyId: property._id.toString(),
          propertyName: property.name,
          source,
          bookings: 1,
          nights,
          grossRevenue: booking.price,
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
    const agencyId = req.user?._id
    if (!agencyId) {
      res.sendStatus(401)
      return
    }

    const { propertyId } = req.params
    const year = parseInt(req.params.year, 10)
    const month = parseInt(req.params.month, 10)

    const property = await Property.findOne({ _id: propertyId, agency: agencyId }).lean()
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
