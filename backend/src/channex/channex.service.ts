import axios, { AxiosInstance } from 'axios'
import * as env from '../config/env.config'
import * as logger from '../utils/logger'
import ChannexMapping from '../models/ChannexMapping'
import * as movininTypes from ':movinin-types'

let client: AxiosInstance | null = null
let openChannelClient: AxiosInstance | null = null

const getClient = (): AxiosInstance => {
  if (!client) {
    client = axios.create({
      baseURL: env.CHANNEX_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'user-api-key': env.CHANNEX_API_KEY,
      },
      timeout: 30000,
    })
  }
  return client
}

/**
 * Get an Axios client pointed at the secure Channex domain for Open Channel bookings.
 */
const getOpenChannelClient = (): AxiosInstance => {
  if (!openChannelClient) {
    const baseUrl = env.CHANNEX_BASE_URL.replace('staging.channex.io', 'secure-staging.channex.io')
      .replace('app.channex.io', 'secure.channex.io')
    openChannelClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'user-api-key': env.CHANNEX_API_KEY,
      },
      timeout: 30000,
    })
  }
  return openChannelClient
}

const isEnabled = (): boolean => env.CHANNEX_ENABLED && !!env.CHANNEX_API_KEY

// ── Properties ──────────────────────────────────────────────

/**
 * Create a property in Channex.
 */
export const createProperty = async (propertyData: Record<string, unknown>): Promise<string | null> => {
  if (!isEnabled()) {
    logger.info('[channex] Integration disabled, skipping createProperty')
    return null
  }

  try {
    const response = await getClient().post('/properties', {
      property: propertyData,
    })
    const channexId = response.data?.data?.id
    logger.info(`[channex] Property created: ${channexId}`)
    return channexId
  } catch (err: any) {
    logger.error('[channex] Failed to create property', err?.response?.data || err?.message || err)
    throw err
  }
}

/**
 * Update an existing property in Channex.
 */
export const updateProperty = async (channexPropertyId: string, propertyData: Record<string, unknown>): Promise<void> => {
  if (!isEnabled()) {
    return
  }

  try {
    await getClient().put(`/properties/${channexPropertyId}`, {
      property: propertyData,
    })
    logger.info(`[channex] Property updated: ${channexPropertyId}`)
  } catch (err) {
    logger.error(`[channex] Failed to update property ${channexPropertyId}`, err)
    throw err
  }
}

/**
 * Get a property from Channex.
 */
export const getProperty = async (channexPropertyId: string): Promise<Record<string, unknown> | null> => {
  if (!isEnabled()) {
    return null
  }

  try {
    const response = await getClient().get(`/properties/${channexPropertyId}`)
    return response.data?.data?.attributes || null
  } catch (err) {
    logger.error(`[channex] Failed to get property ${channexPropertyId}`, err)
    throw err
  }
}

// ── Room Types ──────────────────────────────────────────────

/**
 * Create a room type in Channex.
 */
export const createRoomType = async (roomTypeData: Record<string, unknown>): Promise<string | null> => {
  if (!isEnabled()) {
    logger.info('[channex] Integration disabled, skipping createRoomType')
    return null
  }

  try {
    const response = await getClient().post('/room_types', {
      room_type: roomTypeData,
    })
    const channexId = response.data?.data?.id
    logger.info(`[channex] Room type created: ${channexId}`)
    return channexId
  } catch (err) {
    logger.error('[channex] Failed to create room type', err)
    throw err
  }
}

/**
 * Get room types for a Channex property.
 */
export const getRoomTypes = async (channexPropertyId: string): Promise<Record<string, unknown>[]> => {
  if (!isEnabled()) {
    return []
  }

  try {
    const response = await getClient().get('/room_types', {
      params: { 'filter[property_id]': channexPropertyId },
    })
    return response.data?.data || []
  } catch (err) {
    logger.error(`[channex] Failed to get room types for property ${channexPropertyId}`, err)
    throw err
  }
}

// ── Rate Plans ──────────────────────────────────────────────

/**
 * Create a rate plan in Channex.
 */
export const createRatePlan = async (ratePlanData: Record<string, unknown>): Promise<string | null> => {
  if (!isEnabled()) {
    logger.info('[channex] Integration disabled, skipping createRatePlan')
    return null
  }

  try {
    const response = await getClient().post('/rate_plans', {
      rate_plan: ratePlanData,
    })
    const channexId = response.data?.data?.id
    logger.info(`[channex] Rate plan created: ${channexId}`)
    return channexId
  } catch (err) {
    logger.error('[channex] Failed to create rate plan', err)
    throw err
  }
}

/**
 * Get rate plans for a Channex property.
 */
export const getRatePlans = async (channexPropertyId: string): Promise<Record<string, unknown>[]> => {
  if (!isEnabled()) {
    return []
  }

  try {
    const response = await getClient().get('/rate_plans', {
      params: { 'filter[property_id]': channexPropertyId },
    })
    return response.data?.data || []
  } catch (err) {
    logger.error(`[channex] Failed to get rate plans for property ${channexPropertyId}`, err)
    throw err
  }
}

// ── Restrictions (Rates + Min Stay) ─────────────────────────

/**
 * Push rate restrictions to Channex (ARI format).
 * Uses POST /restrictions endpoint.
 */
export const pushRates = async (restrictions: Record<string, unknown>[]): Promise<void> => {
  if (!isEnabled()) {
    return
  }

  try {
    await getClient().post('/restrictions', {
      values: restrictions,
    })
    logger.info(`[channex] Restrictions pushed: ${restrictions.length} entries`)
  } catch (err) {
    logger.error('[channex] Failed to push restrictions', err)
    throw err
  }
}

// ── Availability ────────────────────────────────────────────

/**
 * Push availability to Channex.
 */
export const pushAvailability = async (availability: Record<string, unknown>[]): Promise<void> => {
  if (!isEnabled()) {
    return
  }

  try {
    await getClient().post('/availability', {
      values: availability,
    })
    logger.info(`[channex] Availability pushed: ${availability.length} entries`)
  } catch (err) {
    logger.error('[channex] Failed to push availability', err)
    throw err
  }
}

// ── Bookings ────────────────────────────────────────────────

/**
 * Create a booking in Channex via Open Channel API (for direct bookings).
 * Uses the secure Channex domain.
 */
export const createOpenChannelBooking = async (bookingData: Record<string, unknown>): Promise<string | null> => {
  if (!isEnabled()) {
    logger.info('[channex] Integration disabled, skipping createOpenChannelBooking')
    return null
  }

  try {
    const response = await getOpenChannelClient().post('/channel_webhooks/open_channel/new_booking', bookingData)
    const channexBookingId = response.data?.data?.id || response.data?.unique_id
    logger.info(`[channex] Open Channel booking created: ${channexBookingId}`)
    return channexBookingId
  } catch (err) {
    logger.error('[channex] Failed to create Open Channel booking', err)
    throw err
  }
}

/**
 * Cancel a booking in Channex.
 */
export const cancelBooking = async (channexBookingId: string): Promise<void> => {
  if (!isEnabled()) {
    return
  }

  try {
    await getClient().post(`/bookings/${channexBookingId}/cancel`)
    logger.info(`[channex] Booking cancelled: ${channexBookingId}`)
  } catch (err) {
    logger.error(`[channex] Failed to cancel booking ${channexBookingId}`, err)
    throw err
  }
}

// ── Messaging ───────────────────────────────────────────────

/**
 * Send a message to a guest via Channex Messaging API.
 */
export const sendMessage = async (channexBookingId: string, content: string): Promise<string | null> => {
  if (!isEnabled()) {
    logger.info('[channex] Integration disabled, skipping sendMessage')
    return null
  }

  try {
    const response = await getClient().post(`/bookings/${channexBookingId}/messages`, {
      message: {
        message: content,
      },
    })
    const messageId = response.data?.data?.id
    logger.info(`[channex] Message sent for booking ${channexBookingId}: ${messageId}`)
    return messageId
  } catch (err) {
    logger.error(`[channex] Failed to send message for booking ${channexBookingId}`, err)
    throw err
  }
}

// ── Connection Test ─────────────────────────────────────────

/**
 * Test connection to Channex by fetching properties.
 */
export const testConnection = async (): Promise<boolean> => {
  if (!isEnabled()) {
    return false
  }

  try {
    await getClient().get('/properties', { params: { pagination: { page: 1, per_page: 1 } } })
    return true
  } catch (err) {
    logger.error('[channex] Connection test failed', err)
    return false
  }
}

// ── Mapping Helpers ─────────────────────────────────────────

/**
 * Get the Channex mapping for an internal resource.
 */
export const getMapping = async (
  internalId: string,
  internalType: movininTypes.ChannexMappingType,
): Promise<typeof ChannexMapping.prototype | null> => {
  const mapping = await ChannexMapping.findOne({ internalId, internalType })
  return mapping
}

/**
 * Save a mapping between internal and Channex IDs.
 */
export const saveMapping = async (
  internalId: string,
  internalType: movininTypes.ChannexMappingType,
  channexId: string,
  channexType: string,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  await ChannexMapping.findOneAndUpdate(
    { internalId, internalType },
    {
      internalId,
      internalType,
      channexId,
      channexType,
      metadata,
      lastSyncedAt: new Date(),
    },
    { upsert: true, new: true },
  )
}

export { isEnabled }
