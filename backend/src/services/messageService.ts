import mongoose from 'mongoose'
import * as movininTypes from ':movinin-types'
import Message from '../models/Message'
import Booking from '../models/Booking'
import * as channexService from '../channex/channex.service'
import * as logger from '../utils/logger'

/**
 * Get all messages for a booking, sorted by createdAt ascending.
 */
export const getMessages = async (bookingId: string): Promise<typeof Message.prototype[]> => {
  const messages = await Message.find({ booking: new mongoose.Types.ObjectId(bookingId) })
    .sort({ createdAt: 1 })
    .lean()
  return messages
}

/**
 * Create a new message document.
 */
export const createMessage = async (data: {
  booking: string
  property: string
  sender: movininTypes.MessageSender
  senderName: string
  content: string
  source: movininTypes.BookingSource
  channexMessageId?: string
  readByOwner?: boolean
  readByAdmin?: boolean
}): Promise<typeof Message.prototype> => {
  const message = new Message({
    booking: new mongoose.Types.ObjectId(data.booking),
    property: new mongoose.Types.ObjectId(data.property),
    sender: data.sender,
    senderName: data.senderName,
    content: data.content,
    source: data.source,
    channexMessageId: data.channexMessageId,
    readByOwner: data.readByOwner ?? false,
    readByAdmin: data.readByAdmin ?? false,
  })

  await message.save()
  return message
}

/**
 * Send a reply from the owner. Creates the message locally and forwards
 * to Channex if the booking originated from an OTA.
 */
export const sendReply = async (
  bookingId: string,
  senderName: string,
  content: string,
): Promise<typeof Message.prototype> => {
  const booking = await Booking.findById(bookingId)
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`)
  }

  const message = await createMessage({
    booking: bookingId,
    property: booking.property.toString(),
    sender: 'owner',
    senderName,
    content,
    source: booking.source || movininTypes.BookingSource.Direct,
    readByOwner: true,
    readByAdmin: true,
  })

  if (booking.channexBookingId && booking.source !== movininTypes.BookingSource.Direct) {
    try {
      await channexService.sendMessage(booking.channexBookingId, content)
    } catch (err) {
      logger.error(`[messageService.sendReply] Failed to forward message to Channex for booking ${bookingId}`, err)
    }
  }

  return message
}

/**
 * Mark messages as read by a specific reader type.
 */
export const markAsRead = async (
  ids: string[],
  readerType: 'owner' | 'admin',
): Promise<number> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
  const updateField = readerType === 'owner' ? 'readByOwner' : 'readByAdmin'

  const result = await Message.updateMany(
    { _id: { $in: objectIds }, [updateField]: false },
    { $set: { [updateField]: true } },
  )

  return result.modifiedCount
}

/**
 * Get unread message count for an agency (owner).
 * Counts messages where readByOwner is false, across all bookings belonging to the agency.
 */
export const getUnreadCount = async (agencyId: string): Promise<number> => {
  const agencyObjectId = new mongoose.Types.ObjectId(agencyId)

  const result = await Message.aggregate([
    {
      $lookup: {
        from: 'Booking',
        localField: 'booking',
        foreignField: '_id',
        as: 'bookingDoc',
      },
    },
    { $unwind: '$bookingDoc' },
    {
      $match: {
        'bookingDoc.agency': agencyObjectId,
        readByOwner: false,
        sender: { $ne: 'owner' },
      },
    },
    { $count: 'total' },
  ])

  return result.length > 0 ? result[0].total : 0
}
