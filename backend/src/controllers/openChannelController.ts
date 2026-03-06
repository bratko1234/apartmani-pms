import crypto from 'node:crypto'
import { Request, Response } from 'express'
import * as movininTypes from ':movinin-types'
import * as env from '../config/env.config'
import * as logger from '../utils/logger'
import * as channexService from '../channex/channex.service'
import Property from '../models/Property'
import ChannexMapping from '../models/ChannexMapping'
import ChannexWebhookLog from '../models/ChannexWebhookLog'

/**
 * Constant-time string comparison to prevent timing attacks.
 */
const safeCompare = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

const verifyApiKey = (req: Request): boolean => {
  const apiKey = (req.headers['user-api-key'] || req.headers['api-key']) as string
  if (!apiKey || !env.CHANNEX_API_KEY) {
    return false
  }
  return safeCompare(apiKey, env.CHANNEX_API_KEY)
}

/**
 * Channex Open Channel: test_connection
 * Verifies that Channex can reach us and our API key matches.
 *
 * GET /api/channex/open-channel/test_connection
 */
export const testConnection = async (req: Request, res: Response) => {
  try {
    if (!verifyApiKey(req)) {
      res.status(401).json({ success: false, message: 'Invalid API key' })
      return
    }

    res.status(200).json({ success: true })
  } catch (err) {
    logger.error('[open-channel] testConnection error', err)
    res.status(500).json({ success: false, message: 'Internal error' })
  }
}

/**
 * Channex Open Channel: mapping_details
 * Returns room types and rate plans for a given hotel_code (our property ID).
 *
 * GET /api/channex/open-channel/mapping_details?hotel_code=<propertyId>
 */
export const mappingDetails = async (req: Request, res: Response) => {
  try {
    if (!verifyApiKey(req)) {
      res.status(401).json({ success: false, message: 'Invalid API key' })
      return
    }

    const hotelCode = req.query.hotel_code as string
    if (!hotelCode) {
      res.status(400).json({ success: false, message: 'hotel_code is required' })
      return
    }

    const property = await Property.findById(hotelCode).lean()
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' })
      return
    }

    const roomTypeMapping = await ChannexMapping.findOne({
      internalId: hotelCode,
      internalType: movininTypes.ChannexMappingType.RoomType,
    }).lean()

    const ratePlanMapping = await ChannexMapping.findOne({
      internalId: hotelCode,
      internalType: movininTypes.ChannexMappingType.RatePlan,
    }).lean()

    if (!roomTypeMapping || !ratePlanMapping) {
      res.status(404).json({ success: false, message: 'Property not synced to Channex' })
      return
    }

    const defaultOccupancy = property.bedrooms ? property.bedrooms * 2 : 2

    res.status(200).json({
      room_types: [{
        room_type_code: roomTypeMapping.channexId,
        title: property.name,
        count_of_rooms: 1,
        default_occupancy: defaultOccupancy,
        rate_plans: [{
          rate_plan_code: ratePlanMapping.channexId,
          title: `${property.name} - Standard`,
          currency: 'EUR',
          sell_mode: 'per_room',
        }],
      }],
    })
  } catch (err) {
    logger.error('[open-channel] mappingDetails error', err)
    res.status(500).json({ success: false, message: 'Internal error' })
  }
}

/**
 * Channex Open Channel: changes
 * Receives ARI updates from Channex (when other channels update rates/availability).
 *
 * POST /api/channex/open-channel/changes
 */
export const changes = async (req: Request, res: Response) => {
  try {
    if (!verifyApiKey(req)) {
      res.status(401).json({ success: false, message: 'Invalid API key' })
      return
    }

    const requestId = `oc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const body = req.body

    const log = new ChannexWebhookLog({
      eventType: 'open_channel_changes',
      payload: body,
      processed: false,
    })
    await log.save()

    const values = body.values || body.data || []

    if (Array.isArray(values) && values.length > 0) {
      logger.info(`[open-channel] ARI changes received: ${requestId}, ${values.length} entries`)

      for (const entry of values) {
        const channexPropertyId = entry.property_id as string | undefined
        const date = entry.date as string | undefined
        const rate = entry.rate as number | undefined
        const availability = entry.availability as number | undefined

        if (!channexPropertyId || !date) {
          continue
        }

        const mapping = await ChannexMapping.findOne({
          channexId: channexPropertyId,
          channexType: 'property',
        }).lean()

        const internalId = mapping?.internalId || 'unmapped'

        logger.info(
          `[open-channel] ARI drift: property=${internalId} date=${date}`
          + `${rate !== undefined ? ` rate=${rate}` : ''}`
          + `${availability !== undefined ? ` avail=${availability}` : ''}`,
        )
      }
    } else {
      logger.info(`[open-channel] ARI changes received: ${requestId}, no values`)
    }

    log.processed = true
    log.processedAt = new Date()
    await log.save()

    res.status(200).json({
      success: true,
      unique_id: requestId,
    })
  } catch (err) {
    logger.error('[open-channel] changes error', err)
    res.status(500).json({ success: false, message: 'Internal error' })
  }
}

/**
 * Channex status dashboard endpoint (admin-only).
 *
 * GET /api/channex/status
 */
export const status = async (_req: Request, res: Response) => {
  try {
    const enabled = channexService.isEnabled()

    let connected = false
    if (enabled) {
      connected = await channexService.testConnection()
    }

    const totalProperties = await Property.countDocuments({ hidden: { $ne: true } })
    const syncedProperties = await ChannexMapping.countDocuments({
      internalType: movininTypes.ChannexMappingType.Property,
    })

    const lastWebhook = await ChannexWebhookLog.findOne()
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean() as Record<string, unknown> | null

    res.status(200).json({
      enabled,
      connected,
      propertyCount: totalProperties,
      syncedCount: syncedProperties,
      lastWebhookAt: lastWebhook?.createdAt || null,
    })
  } catch (err) {
    logger.error('[channex.status] Error', err)
    res.status(500).json({ status: 'error', message: 'An internal error occurred' })
  }
}
