import crypto from 'node:crypto'
import { Request, Response, NextFunction } from 'express'
import * as movininTypes from ':movinin-types'
import * as env from '../config/env.config'
import * as logger from '../utils/logger'
import * as channexMapper from './channex.mapper'
import * as messageService from '../services/messageService'
import Booking from '../models/Booking'
import ChannexMapping from '../models/ChannexMapping'
import ChannexWebhookLog from '../models/ChannexWebhookLog'
import Notification from '../models/Notification'
import NotificationCounter from '../models/NotificationCounter'
import Property from '../models/Property'
import User from '../models/User'

/**
 * Verify Channex webhook signature using HMAC-SHA256.
 * Rejects all webhooks when the secret is not configured.
 * Uses the raw request body (if available) for accurate HMAC computation.
 * Falls back to JSON.stringify if rawBody is not captured.
 */
export const verifySignature = (req: Request, res: Response, next: NextFunction): void => {
  if (!env.CHANNEX_WEBHOOK_SECRET) {
    logger.error('[channex.webhook] CHANNEX_WEBHOOK_SECRET not configured, rejecting webhook')
    res.status(503).send({ message: 'Webhook verification not configured' })
    return
  }

  const signature = req.headers['x-channex-signature'] as string
  if (!signature) {
    res.status(401).send({ message: 'Missing webhook signature' })
    return
  }

  const rawBody = (req as any).rawBody as Buffer | undefined
  const body = rawBody || Buffer.from(JSON.stringify(req.body))
  const expectedSignature = crypto
    .createHmac('sha256', env.CHANNEX_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    logger.error('[channex.webhook] Invalid signature')
    res.status(401).send({ message: 'Invalid webhook signature' })
    return
  }

  next()
}

/**
 * Handle incoming Channex webhook events.
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body
  const eventType = payload?.event || payload?.type || 'unknown'

  const log = new ChannexWebhookLog({
    eventType,
    channexBookingId: payload?.data?.id || payload?.booking_id,
    payload,
    processed: false,
  })

  try {
    await log.save()

    switch (eventType) {
      case 'booking_new':
        await handleNewBooking(payload)
        break
      case 'booking_modification':
        await handleBookingModification(payload)
        break
      case 'booking_cancellation':
        await handleBookingCancellation(payload)
        break
      case 'message_new':
        await handleNewMessage(payload)
        break
      default:
        logger.info(`[channex.webhook] Unhandled event type: ${eventType}`)
    }

    log.processed = true
    log.processedAt = new Date()
    await log.save()

    res.status(200).send({ status: 'ok' })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    log.error = errorMessage
    await log.save()

    logger.error(`[channex.webhook] Error processing ${eventType}`, err)
    res.status(200).send({ status: 'error_logged', message: 'Event logged with error' })
  }
}

const handleNewBooking = async (payload: Record<string, unknown>): Promise<void> => {
  const data = (payload.data || payload) as Record<string, unknown>
  const bookingData = channexMapper.channexBookingToInternal(data)

  const existingBooking = await Booking.findOne({
    channexBookingId: bookingData.channexBookingId,
  })

  if (existingBooking) {
    logger.info(`[channex.webhook] Booking ${bookingData.channexBookingId} already exists, skipping`)
    return
  }

  const roomTypeId = extractRoomTypeId(data)
  if (!roomTypeId) {
    logger.error('[channex.webhook] No room type ID in booking payload')
    return
  }

  const mapping = await ChannexMapping.findOne({
    channexId: roomTypeId,
    channexType: 'room_type',
  })

  if (!mapping) {
    logger.error(`[channex.webhook] No mapping found for room type ${roomTypeId}`)
    return
  }

  const propertyId = mapping.internalId
  const property = await Property.findById(propertyId)
  if (!property) {
    logger.error(`[channex.webhook] Property ${propertyId} not found`)
    return
  }

  const booking = new Booking({
    agency: property.agency,
    location: property.location,
    property: propertyId,
    from: bookingData.from,
    to: bookingData.to,
    status: bookingData.status,
    price: bookingData.price,
    source: bookingData.source,
    channexBookingId: bookingData.channexBookingId,
    channexReservationId: bookingData.channexReservationId,
    externalGuestName: bookingData.externalGuestName,
    externalGuestEmail: bookingData.externalGuestEmail,
    externalGuestPhone: bookingData.externalGuestPhone,
    externalGuestCountry: bookingData.externalGuestCountry,
    externalGuestAddress: bookingData.externalGuestAddress,
    externalGuestCity: bookingData.externalGuestCity,
    externalGuestZip: bookingData.externalGuestZip,
    externalGuestLanguage: bookingData.externalGuestLanguage,
  })

  await booking.save()
  logger.info(`[channex.webhook] New booking created: ${booking._id} from ${bookingData.source}`)

  await notifyAgency(property.agency.toString(), booking._id.toString(), 'New booking received from OTA')
}

const handleBookingModification = async (payload: Record<string, unknown>): Promise<void> => {
  const data = (payload.data || payload) as Record<string, unknown>
  const bookingData = channexMapper.channexBookingToInternal(data)

  const booking = await Booking.findOne({
    channexBookingId: bookingData.channexBookingId,
  })

  if (!booking) {
    logger.info(`[channex.webhook] Booking ${bookingData.channexBookingId} not found for modification, creating new`)
    await handleNewBooking(payload)
    return
  }

  const update: Record<string, unknown> = {
    from: bookingData.from,
    to: bookingData.to,
    price: bookingData.price,
    status: bookingData.status,
    externalGuestName: bookingData.externalGuestName,
  }

  const contactFields = [
    'externalGuestEmail', 'externalGuestPhone', 'externalGuestCountry',
    'externalGuestAddress', 'externalGuestCity', 'externalGuestZip', 'externalGuestLanguage',
  ] as const
  for (const field of contactFields) {
    if (bookingData[field] !== undefined) {
      update[field] = bookingData[field]
    }
  }

  await Booking.findOneAndUpdate(
    { channexBookingId: bookingData.channexBookingId },
    { $set: update },
  )

  logger.info(`[channex.webhook] Booking ${booking._id} modified`)
  await notifyAgency(booking.agency.toString(), booking._id.toString(), 'OTA booking has been modified')
}

const handleBookingCancellation = async (payload: Record<string, unknown>): Promise<void> => {
  const data = (payload.data || payload) as Record<string, unknown>
  const channexBookingId = (data.id || (data.attributes as Record<string, unknown>)?.id || '') as string

  const booking = await Booking.findOne({ channexBookingId })

  if (!booking) {
    logger.info(`[channex.webhook] Booking ${channexBookingId} not found for cancellation`)
    return
  }

  booking.status = movininTypes.BookingStatus.Cancelled
  await booking.save()

  logger.info(`[channex.webhook] Booking ${booking._id} cancelled`)
  await notifyAgency(booking.agency.toString(), booking._id.toString(), 'OTA booking has been cancelled')
}

const handleNewMessage = async (payload: Record<string, unknown>): Promise<void> => {
  const data = (payload.data || payload) as Record<string, unknown>
  const attributes = (data.attributes || data) as Record<string, unknown>

  const channexBookingId = (attributes.booking_id || attributes.reservation_id || '') as string
  const messageContent = (attributes.message || attributes.content || attributes.text || '') as string
  const channexMessageId = (data.id || '') as string
  const senderName = (attributes.sender_name || attributes.guest_name || 'Guest') as string

  if (!channexBookingId) {
    logger.error('[channex.webhook] No booking ID in message payload')
    return
  }

  const booking = await Booking.findOne({ channexBookingId })
  if (!booking) {
    logger.info(`[channex.webhook] Booking ${channexBookingId} not found for message`)
    return
  }

  await messageService.createMessage({
    booking: booking._id.toString(),
    property: booking.property.toString(),
    sender: 'guest',
    senderName,
    content: messageContent,
    source: booking.source || movininTypes.BookingSource.Other,
    channexMessageId,
  })

  logger.info(`[channex.webhook] New message created for booking ${booking._id}`)
  await notifyAgency(booking.agency.toString(), booking._id.toString(), `New message from ${senderName}`)
}

const extractRoomTypeId = (data: Record<string, unknown>): string | null => {
  const attributes = (data.attributes || data) as Record<string, unknown>
  const rooms = attributes.rooms as Record<string, unknown>[] | undefined
  if (rooms && rooms.length > 0) {
    return (rooms[0].room_type_id || '') as string
  }
  return (attributes.room_type_id || null) as string | null
}

const notifyAgency = async (agencyId: string, bookingId: string, message: string): Promise<void> => {
  try {
    const agency = await User.findById(agencyId)
    if (!agency) {
      return
    }

    const notification = new Notification({
      user: agency._id,
      message,
      booking: bookingId,
    })
    await notification.save()

    await NotificationCounter.findOneAndUpdate(
      { user: agency._id },
      { $inc: { count: 1 } },
      { upsert: true },
    )
  } catch (err) {
    logger.error(`[channex.webhook] Failed to notify agency ${agencyId}`, err)
  }
}
