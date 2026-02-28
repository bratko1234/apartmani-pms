import { Request, Response } from 'express'
import * as movininTypes from ':movinin-types'
import * as messageService from '../services/messageService'
import * as logger from '../utils/logger'
import Booking from '../models/Booking'
import User from '../models/User'

/**
 * Get all messages for a booking (thread view).
 *
 * GET /api/messages/:bookingId
 */
export const getThread = async (req: Request, res: Response): Promise<void> => {
  const { bookingId } = req.params

  try {
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      res.status(404).send({ message: 'Booking not found' })
      return
    }

    const user = req.user
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' })
      return
    }

    if (user.type === movininTypes.UserType.Agency && booking.agency.toString() !== user._id) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }

    const messages = await messageService.getMessages(bookingId)
    res.json(messages)
  } catch (err) {
    logger.error(`[messageController.getThread] Error for booking ${bookingId}`, err)
    res.status(500).send({ message: 'Internal server error' })
  }
}

/**
 * Send a reply to a booking thread.
 *
 * POST /api/messages/:bookingId/reply
 */
export const sendReply = async (req: Request, res: Response): Promise<void> => {
  const { bookingId } = req.params
  const { content } = req.body as { content: string }

  if (!content || !content.trim()) {
    res.status(400).send({ message: 'Message content is required' })
    return
  }

  try {
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      res.status(404).send({ message: 'Booking not found' })
      return
    }

    const user = req.user
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' })
      return
    }

    if (user.type === movininTypes.UserType.Agency && booking.agency.toString() !== user._id) {
      res.status(403).send({ message: 'Forbidden' })
      return
    }

    const sender = await User.findById(user._id)
    const senderName = sender?.fullName || 'Owner'

    const message = await messageService.sendReply(bookingId, senderName, content.trim())
    res.status(201).json(message)
  } catch (err) {
    logger.error(`[messageController.sendReply] Error for booking ${bookingId}`, err)
    res.status(500).send({ message: 'Internal server error' })
  }
}

/**
 * Mark messages as read.
 *
 * PUT /api/messages/mark-read
 */
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const { ids, readerType } = req.body as { ids: string[]; readerType: 'owner' | 'admin' }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).send({ message: 'Message IDs are required' })
    return
  }

  if (!readerType || !['owner', 'admin'].includes(readerType)) {
    res.status(400).send({ message: 'Valid readerType is required (owner or admin)' })
    return
  }

  try {
    const modifiedCount = await messageService.markAsRead(ids, readerType)
    res.json({ modifiedCount })
  } catch (err) {
    logger.error('[messageController.markAsRead] Error', err)
    res.status(500).send({ message: 'Internal server error' })
  }
}

/**
 * Get unread message count for the current agency.
 *
 * GET /api/messages/unread-count
 */
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).send({ message: 'Unauthorized' })
      return
    }

    const agencyId = user._id
    const total = await messageService.getUnreadCount(agencyId)
    res.json({ total })
  } catch (err) {
    logger.error('[messageController.getUnreadCount] Error', err)
    res.status(500).send({ message: 'Internal server error' })
  }
}
