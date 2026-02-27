import axios, { AxiosInstance } from 'axios'
import * as env from '../config/env.config'
import * as logger from '../utils/logger'
import ChannexMapping from '../models/ChannexMapping'
import * as movininTypes from ':movinin-types'

let client: AxiosInstance | null = null

const getClient = (): AxiosInstance => {
  if (!client) {
    client = axios.create({
      baseURL: env.CHANNEX_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.CHANNEX_API_KEY}`,
      },
      timeout: 30000,
    })
  }
  return client
}

const isEnabled = (): boolean => env.CHANNEX_ENABLED && !!env.CHANNEX_API_KEY

/**
 * Create or update a property in Channex.
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
  } catch (err) {
    logger.error('[channex] Failed to create property', err)
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
 * Push rate plan to Channex.
 */
export const pushRates = async (ratePlanId: string, rates: Record<string, unknown>[]): Promise<void> => {
  if (!isEnabled()) {
    return
  }

  try {
    await getClient().post(`/rate_plans/${ratePlanId}/rates`, {
      values: rates,
    })
    logger.info(`[channex] Rates pushed for rate plan: ${ratePlanId}`)
  } catch (err) {
    logger.error(`[channex] Failed to push rates for ${ratePlanId}`, err)
    throw err
  }
}

/**
 * Push availability to Channex.
 */
export const pushAvailability = async (roomTypeId: string, availability: Record<string, unknown>[]): Promise<void> => {
  if (!isEnabled()) {
    return
  }

  try {
    await getClient().post(`/availability`, {
      values: availability.map((a) => ({
        ...a,
        room_type_id: roomTypeId,
      })),
    })
    logger.info(`[channex] Availability pushed for room type: ${roomTypeId}`)
  } catch (err) {
    logger.error(`[channex] Failed to push availability for ${roomTypeId}`, err)
    throw err
  }
}

/**
 * Create a booking in Channex via Open Channel API (for direct bookings).
 */
export const createBooking = async (bookingData: Record<string, unknown>): Promise<string | null> => {
  if (!isEnabled()) {
    logger.info('[channex] Integration disabled, skipping createBooking')
    return null
  }

  try {
    const response = await getClient().post('/bookings', {
      booking: bookingData,
    })
    const channexBookingId = response.data?.data?.id
    logger.info(`[channex] Booking created: ${channexBookingId}`)
    return channexBookingId
  } catch (err) {
    logger.error('[channex] Failed to create booking', err)
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
