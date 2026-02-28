/**
 * Phase 2 Seed Script
 *
 * Seeds the database with realistic data for all Phase 2 features:
 * - 3 new Agency (owner) users + reassigns existing properties
 * - 10 guest users
 * - ~100 bookings (Oct 2025 - Feb 2026) + 15 upcoming (Mar-Jun 2026)
 * - Rate seasons (3 per owner)
 * - Rate discounts (2 per owner)
 * - Monthly payouts (Oct 2025 - Feb 2026) via payoutService
 * - ~25 messages across several bookings
 *
 * Usage (inside Docker):
 *   docker exec movinin-mi-dev-backend-1 sh -c \
 *     "cd /movinin/backend && npx tsx src/scripts/seed-phase2.ts"
 *
 * Usage (local):
 *   cd backend && npx tsx src/scripts/seed-phase2.ts
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import * as movininTypes from ':movinin-types'
import * as env from '../config/env.config'
import * as databaseHelper from '../utils/databaseHelper'
import * as authHelper from '../utils/authHelper'
import * as payoutService from '../services/payoutService'
import User from '../models/User'
import Property from '../models/Property'
import Booking from '../models/Booking'
import RateSeason from '../models/RateSeason'
import RateDiscount from '../models/RateDiscount'
import OwnerPayout from '../models/OwnerPayout'
import Message from '../models/Message'

// ─── Existing IDs ──────────────────────────────────────────────────────────────

const EXISTING_IDS = {
  admin: '69a1bcbf8a3254909c99eab9',
  agencyWL: '69a1eb15136d9fd0349f4683',
  guestMarko: '69a1edf8136d9fd0349f47c5',
  countryBiH: '69a1ead4136d9fd0349f465e',
  locTrebinje: '69a1ec1c136d9fd0349f4704',
  locMostar: '69a2a0e98c3aa3c4fb57779b',
  locNeum: '69a2a0e98c3aa3c4fb5777a3',
} as const

// ─── Helpers ───────────────────────────────────────────────────────────────────

const oid = (id: string) => new mongoose.Types.ObjectId(id)

/** Seeded PRNG (xoshiro128**) for reproducible data across runs */
function createRng(seed: number) {
  let s0 = seed >>> 0
  let s1 = (seed * 1597334677) >>> 0
  let s2 = (seed * 2853336371) >>> 0
  let s3 = (seed * 3914176071) >>> 0

  return {
    /** Returns a float in [0, 1) */
    next(): number {
      const result = (((s1 * 5) << 7 | (s1 * 5) >>> 25) * 9) >>> 0
      const t = (s1 << 9) >>> 0
      s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3
      s2 ^= t
      s3 = (s3 << 11 | s3 >>> 21) >>> 0
      return result / 4294967296
    },
    /** Integer in [min, max] inclusive */
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min
    },
    /** Pick random element from array */
    pick<T>(arr: readonly T[]): T {
      return arr[Math.floor(this.next() * arr.length)]
    },
    /** Shuffle array (Fisher-Yates) */
    shuffle<T>(arr: T[]): T[] {
      const result = [...arr]
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(this.next() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
      }
      return result
    },
  }
}

const rng = createRng(42)

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}


function log(msg: string) {
  // eslint-disable-next-line no-console
  console.log(`[seed-phase2] ${msg}`)
}

// ─── Owner Definitions ─────────────────────────────────────────────────────────

interface OwnerDef {
  fullName: string
  email: string
  phone: string
  location: string
  locationId: string
}

const OWNERS: OwnerDef[] = [
  {
    fullName: 'Dragan Kovačević',
    email: 'dragan@apartmani.ba',
    phone: '+38765111222',
    location: 'Trebinje',
    locationId: EXISTING_IDS.locTrebinje,
  },
  {
    fullName: 'Mirela Hadžić',
    email: 'mirela@apartmani.ba',
    phone: '+38761333444',
    location: 'Mostar',
    locationId: EXISTING_IDS.locMostar,
  },
  {
    fullName: 'Nikola Petrović',
    email: 'nikola@apartmani.ba',
    phone: '+38766555666',
    location: 'Neum',
    locationId: EXISTING_IDS.locNeum,
  },
]

// ─── Guest Definitions ─────────────────────────────────────────────────────────

interface GuestDef {
  fullName: string
  email: string
  phone?: string
  language: string
  isMember: boolean
}

const GUESTS: GuestDef[] = [
  { fullName: 'Ana Jovanović', email: 'ana.jovanovic@gmail.com', phone: '+38162123456', language: 'sr', isMember: true },
  { fullName: 'Stefan Ilić', email: 'stefan.ilic@yahoo.com', phone: '+38163234567', language: 'sr', isMember: false },
  { fullName: 'Thomas Mueller', email: 'thomas.mueller@web.de', phone: '+4915112345678', language: 'de', isMember: false },
  { fullName: 'Emma Wilson', email: 'emma.wilson@outlook.com', phone: '+447911123456', language: 'en', isMember: true },
  { fullName: 'Ivana Marković', email: 'ivana.markovic@hotmail.com', phone: '+38164345678', language: 'sr', isMember: false },
  { fullName: 'Hans Schmidt', email: 'hans.schmidt@gmx.de', phone: '+4915213456789', language: 'de', isMember: false },
  { fullName: 'Jelena Đurić', email: 'jelena.djuric@gmail.com', phone: '+38165456789', language: 'sr', isMember: true },
  { fullName: 'Marco Rossi', email: 'marco.rossi@libero.it', phone: '+393311234567', language: 'en', isMember: false },
  { fullName: 'Milica Nikolić', email: 'milica.nikolic@yahoo.com', phone: '+38166567890', language: 'sr', isMember: false },
  { fullName: 'Sarah Johnson', email: 'sarah.johnson@gmail.com', phone: '+12025551234', language: 'en', isMember: true },
]

// ─── External (OTA) guest names for bookings without a renter user ─────────────

const EXTERNAL_GUESTS = [
  'Pierre Dupont',
  'Maria Garcia',
  'James Smith',
  'Yuki Tanaka',
  'Fatima Al-Hassan',
  'Lars Eriksson',
  'Olga Petrova',
  'Chen Wei',
  'Isabella Romano',
  'Mohammed Al-Farsi',
  'Katarina Novak',
  'Pavel Koval',
  'Sophie Laurent',
  'David Brown',
  'Anna Kowalski',
]

// ─── Message Templates ─────────────────────────────────────────────────────────

const MSG_GUEST = [
  'Hello, we will be arriving around 3 PM. Is early check-in possible?',
  'Could you provide directions from the bus station?',
  'We have a small dog, is that okay?',
  'Is there parking available near the property?',
  'Can we get extra towels and bed linens?',
  'What is the WiFi password?',
  'We would like to extend our stay by 2 nights. Is the property available?',
  'Thank you for the wonderful stay! We will definitely come back.',
  'Is there a good restaurant nearby you would recommend?',
  'What time is check-out?',
  'We arrived safely. The apartment is beautiful!',
  'Can you recommend any local tours or activities?',
]

const MSG_OWNER = [
  'Welcome! Check-in is from 2 PM. I will meet you at the property.',
  'Of course! The bus station is a 10-minute walk. I will send you a map.',
  'Small dogs are welcome! There is a park nearby for walks.',
  'Yes, there is free parking right in front of the building.',
  'Extra towels are in the closet. Let me know if you need anything else.',
  'The WiFi password is on the card next to the TV. Enjoy your stay!',
  'Let me check availability and get back to you shortly.',
  'Thank you for the kind words! You are always welcome back.',
  'I recommend "Stari Grad" restaurant, 5 minutes walk from the apartment.',
  'Check-out is at 11 AM. Please leave the keys on the table.',
  'Glad you like it! Do not hesitate to reach out if you need anything.',
  'There are great hiking trails nearby. I can send you details.',
]

// ─── Main Seed Logic ───────────────────────────────────────────────────────────

async function main() {
  const nodeEnv = process.env.NODE_ENV || 'development'
  if (nodeEnv === 'production') {
    throw new Error('ABORTED: seed-phase2 must not run in production. Set NODE_ENV to "development" or "test".')
  }

  const connected = await databaseHelper.connect(env.DB_URI, env.DB_SSL, env.DB_DEBUG)
  if (!connected) {
    throw new Error('Failed to connect to database')
  }

  log('Connected to database')

  // ── 1. Create owner (agency) users ──────────────────────────────────────

  const seedOwnerPassword = process.env.SEED_OWNER_PASSWORD || 'Owner2025!'
  const passwordHash = await authHelper.hashPassword(seedOwnerPassword)
  const ownerIds: string[] = []

  for (const ownerDef of OWNERS) {
    const existing = await User.findOne({ email: ownerDef.email })
    if (existing) {
      log(`Owner "${ownerDef.fullName}" already exists, skipping`)
      ownerIds.push(existing._id.toString())
      continue
    }

    const user = new User({
      fullName: ownerDef.fullName,
      email: ownerDef.email,
      phone: ownerDef.phone,
      password: passwordHash,
      language: 'sr',
      type: movininTypes.UserType.Agency,
      active: true,
      verified: true,
      location: ownerDef.location,
    })
    await user.save()
    ownerIds.push(user._id.toString())
    log(`Created owner: ${ownerDef.fullName} (${user._id})`)
  }

  // ── 2. Create guest users ──────────────────────────────────────────────

  const seedGuestPassword = process.env.SEED_GUEST_PASSWORD || 'Guest2025!'
  const guestPasswordHash = await authHelper.hashPassword(seedGuestPassword)
  const guestIds: string[] = []

  // Include existing guest Marko
  guestIds.push(EXISTING_IDS.guestMarko)

  for (const guestDef of GUESTS) {
    const existing = await User.findOne({ email: guestDef.email })
    if (existing) {
      log(`Guest "${guestDef.fullName}" already exists, skipping`)
      guestIds.push(existing._id.toString())
      continue
    }

    const user = new User({
      fullName: guestDef.fullName,
      email: guestDef.email,
      phone: guestDef.phone,
      password: guestPasswordHash,
      language: guestDef.language,
      type: movininTypes.UserType.User,
      active: true,
      verified: true,
      isMember: guestDef.isMember,
      memberSince: guestDef.isMember ? new Date('2025-06-01') : undefined,
    })
    await user.save()
    guestIds.push(user._id.toString())
    log(`Created guest: ${guestDef.fullName}`)
  }

  log(`Total guest IDs available: ${guestIds.length}`)

  // ── 3. Reassign properties across owners ───────────────────────────────

  const allProperties = await Property.find({}).sort({ location: 1, name: 1 }).lean()
  log(`Found ${allProperties.length} existing properties`)

  if (allProperties.length === 0) {
    throw new Error('No properties found in database. Run seed-properties first.')
  }

  // Group properties by location
  const trebinjeProps = allProperties.filter(
    (p) => p.location.toString() === EXISTING_IDS.locTrebinje,
  )
  const mostarProps = allProperties.filter(
    (p) => p.location.toString() === EXISTING_IDS.locMostar,
  )
  const neumProps = allProperties.filter(
    (p) => p.location.toString() === EXISTING_IDS.locNeum,
  )

  log(`Properties by location: Trebinje=${trebinjeProps.length}, Mostar=${mostarProps.length}, Neum=${neumProps.length}`)

  // Assign: Dragan gets Trebinje (up to 8), Mirela gets Mostar (up to 8),
  // Nikola gets Neum (up to 8), WL keeps the rest
  const assignments: Array<{ propertyId: string; ownerId: string }> = []

  const assignGroup = (props: typeof allProperties, ownerId: string, max: number) => {
    const toAssign = props.slice(0, max)
    for (const p of toAssign) {
      assignments.push({ propertyId: p._id.toString(), ownerId })
    }
    // Remaining go to WL
    for (const p of props.slice(max)) {
      assignments.push({ propertyId: p._id.toString(), ownerId: EXISTING_IDS.agencyWL })
    }
  }

  assignGroup(trebinjeProps, ownerIds[0], 8)
  assignGroup(mostarProps, ownerIds[1], 8)
  assignGroup(neumProps, ownerIds[2], 8)

  // Reassign in DB
  for (const a of assignments) {
    await Property.updateOne(
      { _id: oid(a.propertyId) },
      { $set: { agency: oid(a.ownerId) } },
    )
  }

  // Also update existing booking's agency if needed
  const existingBookings = await Booking.find({}).lean()
  for (const b of existingBookings) {
    const propAssignment = assignments.find((a) => a.propertyId === b.property.toString())
    if (propAssignment && b.agency.toString() !== propAssignment.ownerId) {
      await Booking.updateOne(
        { _id: b._id },
        { $set: { agency: oid(propAssignment.ownerId) } },
      )
    }
  }

  log(`Reassigned ${assignments.length} properties across ${ownerIds.length + 1} owners`)

  // Refresh properties with new agency assignments
  const refreshedProperties = await Property.find({}).lean()
  const propertyByOwner = new Map<string, typeof refreshedProperties>()
  for (const p of refreshedProperties) {
    const key = p.agency.toString()
    if (!propertyByOwner.has(key)) {
      propertyByOwner.set(key, [])
    }
    propertyByOwner.get(key)!.push(p)
  }

  // ── 4. Create bookings ─────────────────────────────────────────────────

  // Booking sources with weighted distribution: 40% Direct, 30% Airbnb, 20% Booking.com, 10% Expedia
  const SOURCE_POOL: movininTypes.BookingSource[] = [
    ...Array(4).fill(movininTypes.BookingSource.Direct),
    ...Array(3).fill(movininTypes.BookingSource.Airbnb),
    ...Array(2).fill(movininTypes.BookingSource.BookingCom),
    ...Array(1).fill(movininTypes.BookingSource.Expedia),
  ]

  // Status distribution: 70% PAID, 15% RESERVED, 10% DEPOSIT, 5% CANCELLED
  const STATUS_POOL: movininTypes.BookingStatus[] = [
    ...Array(14).fill(movininTypes.BookingStatus.Paid),
    ...Array(3).fill(movininTypes.BookingStatus.Reserved),
    ...Array(2).fill(movininTypes.BookingStatus.Deposit),
    ...Array(1).fill(movininTypes.BookingStatus.Cancelled),
  ]

  const bookingDocs: Array<{
    agency: mongoose.Types.ObjectId
    location: mongoose.Types.ObjectId
    property: mongoose.Types.ObjectId
    renter: mongoose.Types.ObjectId
    from: Date
    to: Date
    status: movininTypes.BookingStatus
    price: number
    source: movininTypes.BookingSource
    externalGuestName?: string
  }> = []

  // Historical bookings: Oct 2025 - Feb 2026 (checkout in these months)
  // We need bookings whose `to` date falls in each target month
  const historicalMonths = [
    { year: 2025, month: 10 }, // Oct
    { year: 2025, month: 11 }, // Nov
    { year: 2025, month: 12 }, // Dec
    { year: 2026, month: 1 },  // Jan
    { year: 2026, month: 2 },  // Feb
  ]

  for (const period of historicalMonths) {
    // ~20 bookings per month across all owners
    const bookingsThisMonth = rng.int(18, 22)

    for (let i = 0; i < bookingsThisMonth; i++) {
      // Pick a random property from all owners (not WL)
      const ownerIdx = rng.int(0, ownerIds.length - 1)
      const ownerPropsForBooking = propertyByOwner.get(ownerIds[ownerIdx]) || []
      if (ownerPropsForBooking.length === 0) continue

      const prop = rng.pick(ownerPropsForBooking)
      const source = rng.pick(SOURCE_POOL)
      const status = rng.pick(STATUS_POOL)

      // Stay length: 3-14 nights
      const nights = rng.int(3, 14)
      const price = prop.price * nights

      // Checkout date falls within this month
      const checkoutDay = rng.int(2, 28)
      const checkoutDate = new Date(period.year, period.month - 1, checkoutDay)
      const checkinDate = addDays(checkoutDate, -nights)

      // For OTA bookings (non-direct), 60% use external guest name (no renter user)
      const isOta = source !== movininTypes.BookingSource.Direct
      const useExternalGuest = isOta && rng.next() < 0.6

      // OTA bookings with external guests still require a valid renter ref in the schema;
      // externalGuestName is used for display purposes instead
      const renterId = rng.pick(guestIds)

      bookingDocs.push({
        agency: oid(ownerIds[ownerIdx]),
        location: prop.location as mongoose.Types.ObjectId,
        property: prop._id as mongoose.Types.ObjectId,
        renter: oid(renterId),
        from: checkinDate,
        to: checkoutDate,
        status,
        price,
        source,
        externalGuestName: useExternalGuest ? rng.pick(EXTERNAL_GUESTS) : undefined,
      })
    }
  }

  // Upcoming bookings: Mar-Jun 2026 (15 bookings)
  const upcomingMonths = [
    { year: 2026, month: 3 },
    { year: 2026, month: 4 },
    { year: 2026, month: 5 },
    { year: 2026, month: 6 },
  ]

  for (let i = 0; i < 15; i++) {
    const period = upcomingMonths[i % upcomingMonths.length]
    const ownerIdx = rng.int(0, ownerIds.length - 1)
    const ownerPropsForBooking = propertyByOwner.get(ownerIds[ownerIdx]) || []
    if (ownerPropsForBooking.length === 0) continue

    const prop = rng.pick(ownerPropsForBooking)
    const source = rng.pick(SOURCE_POOL)
    const nights = rng.int(3, 10)
    const price = prop.price * nights

    const checkinDay = rng.int(5, 25)
    const checkinDate = new Date(period.year, period.month - 1, checkinDay)
    const checkoutDate = addDays(checkinDate, nights)

    // Upcoming bookings are RESERVED or DEPOSIT
    const upcomingStatus = rng.next() < 0.7
      ? movininTypes.BookingStatus.Reserved
      : movininTypes.BookingStatus.Deposit

    bookingDocs.push({
      agency: oid(ownerIds[ownerIdx]),
      location: prop.location as mongoose.Types.ObjectId,
      property: prop._id as mongoose.Types.ObjectId,
      renter: oid(rng.pick(guestIds)),
      from: checkinDate,
      to: checkoutDate,
      status: upcomingStatus,
      price,
      source,
    })
  }

  // Insert all bookings
  const insertedBookings = await Booking.insertMany(bookingDocs)
  log(`Created ${insertedBookings.length} bookings (${bookingDocs.length - 15} historical + 15 upcoming)`)

  // ── 5. Create rate seasons ─────────────────────────────────────────────

  const seasonDefs = [
    { name: 'Winter Holiday', startMonth: 11, startDay: 15, endMonth: 0, endDay: 15, multiplier: 1.5, minStay: 3 },
    { name: 'Spring', startMonth: 3, startDay: 1, endMonth: 4, endDay: 31, multiplier: 1.0, minStay: 2 },
    { name: 'Summer Peak', startMonth: 5, startDay: 15, endMonth: 8, endDay: 15, multiplier: 1.8, minStay: 5 },
  ]

  let seasonCount = 0
  for (const ownerIdStr of ownerIds) {
    const ownerProps = propertyByOwner.get(ownerIdStr) || []

    for (const prop of ownerProps) {
      for (const sDef of seasonDefs) {
        // Use 2025-2026 season dates
        const startYear = sDef.startMonth >= 10 ? 2025 : 2026
        const endYear = sDef.endMonth < sDef.startMonth ? startYear + 1 : startYear

        await RateSeason.findOneAndUpdate(
          {
            property: prop._id,
            name: sDef.name,
          },
          {
            $set: {
              property: prop._id,
              name: sDef.name,
              startDate: new Date(startYear, sDef.startMonth, sDef.startDay),
              endDate: new Date(endYear, sDef.endMonth, sDef.endDay),
              nightlyRate: Math.round(prop.price * sDef.multiplier),
              minStay: sDef.minStay,
              channel: movininTypes.RateChannel.All,
              active: true,
            },
          },
          { upsert: true, new: true },
        )
        seasonCount++
      }
    }
  }

  log(`Created/updated ${seasonCount} rate seasons`)

  // ── 6. Create rate discounts ───────────────────────────────────────────

  let discountCount = 0
  for (const ownerIdStr of ownerIds) {
    const ownerProps = propertyByOwner.get(ownerIdStr) || []

    for (const prop of ownerProps) {
      // Long stay weekly: 7+ nights, 10% off
      await RateDiscount.findOneAndUpdate(
        { property: prop._id, type: movininTypes.DiscountType.LongStayWeekly },
        {
          $set: {
            property: prop._id,
            type: movininTypes.DiscountType.LongStayWeekly,
            discountPercent: 10,
            minNights: 7,
            channelRestriction: movininTypes.DiscountChannel.All,
            active: true,
          },
        },
        { upsert: true, new: true },
      )
      discountCount++

      // Last minute: 3 days before, 15% off
      await RateDiscount.findOneAndUpdate(
        { property: prop._id, type: movininTypes.DiscountType.LastMinute },
        {
          $set: {
            property: prop._id,
            type: movininTypes.DiscountType.LastMinute,
            discountPercent: 15,
            daysBeforeCheckin: 3,
            channelRestriction: movininTypes.DiscountChannel.Direct,
            active: true,
          },
        },
        { upsert: true, new: true },
      )
      discountCount++
    }
  }

  log(`Created/updated ${discountCount} rate discounts`)

  // ── 7. Generate payouts ────────────────────────────────────────────────

  // Clear existing payouts for seed owners to regenerate cleanly
  await OwnerPayout.deleteMany({
    ownerId: { $in: ownerIds.map((id) => oid(id)) },
  })

  const payoutMonths = [
    { year: 2025, month: 10, targetStatus: movininTypes.PayoutStatus.Paid },
    { year: 2025, month: 11, targetStatus: movininTypes.PayoutStatus.Paid },
    { year: 2025, month: 12, targetStatus: movininTypes.PayoutStatus.Approved },
    { year: 2026, month: 1, targetStatus: movininTypes.PayoutStatus.Draft },
    { year: 2026, month: 2, targetStatus: movininTypes.PayoutStatus.Draft },
  ]

  let payoutCount = 0
  for (const pm of payoutMonths) {
    for (const ownerIdStr of ownerIds) {
      try {
        const payout = await payoutService.generateMonthlyPayout(ownerIdStr, pm.year, pm.month)

        // Advance status if needed (generate creates as Draft)
        if (pm.targetStatus === movininTypes.PayoutStatus.Approved) {
          await OwnerPayout.updateOne(
            { _id: (payout as any)._id },
            { $set: { status: movininTypes.PayoutStatus.Approved } },
          )
        } else if (pm.targetStatus === movininTypes.PayoutStatus.Paid) {
          await OwnerPayout.updateOne(
            { _id: (payout as any)._id },
            {
              $set: {
                status: movininTypes.PayoutStatus.Paid,
                paidAt: new Date(pm.year, pm.month, 5), // Paid on the 5th of next month
                paymentMethod: 'bank_transfer',
              },
            },
          )
        }

        payoutCount++
        log(`  Payout ${pm.year}-${String(pm.month).padStart(2, '0')} for owner ${ownerIdStr}: ${pm.targetStatus}`)
      } catch (err) {
        log(`  Skipped payout ${pm.year}-${pm.month} for ${ownerIdStr}: ${(err as Error).message}`)
      }
    }
  }

  log(`Generated ${payoutCount} payouts`)

  // ── 8. Create messages ─────────────────────────────────────────────────

  // Pick 6 bookings that have actual renter users (not cancelled)
  const messageBookings = await Booking.find({
    status: { $ne: movininTypes.BookingStatus.Cancelled },
    externalGuestName: { $exists: false },
  })
    .populate('renter', 'fullName')
    .populate('property', 'name agency')
    .limit(6)
    .lean()

  let messageCount = 0
  for (const booking of messageBookings) {
    const renter = booking.renter as any
    const property = booking.property as any
    if (!renter?.fullName || !property?.name) continue

    // Find the owner name
    const owner = await User.findById(property.agency).select('fullName').lean()
    const ownerName = owner?.fullName || 'Owner'
    const guestName = renter.fullName

    // Create 3-5 message exchanges per booking
    const msgCount = rng.int(3, 5)
    const baseTime = addDays(new Date(booking.from), -rng.int(1, 5))

    let cumulativeMinutes = 0
    for (let m = 0; m < msgCount; m++) {
      const isGuestMsg = m % 2 === 0
      cumulativeMinutes += rng.int(30, 240)

      const msgTime = new Date(baseTime.getTime() + cumulativeMinutes * 60 * 1000)

      await Message.create({
        booking: booking._id,
        property: property._id,
        sender: isGuestMsg ? 'guest' : 'owner',
        senderName: isGuestMsg ? guestName : ownerName,
        content: isGuestMsg ? rng.pick(MSG_GUEST) : rng.pick(MSG_OWNER),
        source: booking.source || movininTypes.BookingSource.Direct,
        readByOwner: true,
        readByAdmin: m < msgCount - 1, // Last message unread by admin
        createdAt: msgTime,
        updatedAt: msgTime,
      })
      messageCount++
    }
  }

  log(`Created ${messageCount} messages across ${messageBookings.length} bookings`)

  // ── 9. Summary ─────────────────────────────────────────────────────────

  const totalBookings = await Booking.countDocuments()
  const totalProperties = await Property.countDocuments()
  const totalOwners = await User.countDocuments({ type: movininTypes.UserType.Agency })
  const totalGuests = await User.countDocuments({ type: movininTypes.UserType.User })
  const totalPayouts = await OwnerPayout.countDocuments()
  const totalSeasons = await RateSeason.countDocuments()
  const totalDiscounts = await RateDiscount.countDocuments()
  const totalMessages = await Message.countDocuments()

  log('')
  log('=== Seed Complete ===')
  log(`  Owners (agencies):  ${totalOwners}`)
  log(`  Guests (users):     ${totalGuests}`)
  log(`  Properties:         ${totalProperties}`)
  log(`  Bookings:           ${totalBookings}`)
  log(`  Payouts:            ${totalPayouts}`)
  log(`  Rate Seasons:       ${totalSeasons}`)
  log(`  Rate Discounts:     ${totalDiscounts}`)
  log(`  Messages:           ${totalMessages}`)
  log('')
  log('Verification checklist:')
  log('  Admin login      -> /                 -> ~100 bookings, multiple agencies')
  log('  Dragan login     -> /owner-dashboard  -> KPI cards, charts, upcoming bookings')
  log('  Admin login      -> /payouts          -> Monthly list: Draft/Approved/Paid')
  log('  Admin login      -> click a payout    -> Per-property breakdown')
  log('  Dragan login     -> /owner-payouts    -> Owner statements')
  log('  Admin login      -> /rate-management  -> Seasons & discounts per property')
  log('  Dragan login     -> /messages?b=<id>  -> Chat thread')
}

main()
  .then(() => {
    log('Done!')
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[seed-phase2] FATAL:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await databaseHelper.close()
    process.exit()
  })
