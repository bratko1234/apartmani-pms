import * as movininTypes from ':movinin-types'
import axiosInstance from './axiosInstance'

/**
 * Get all seasons for a property.
 */
export const getSeasons = (propertyId: string): Promise<movininTypes.RateSeason[]> =>
  axiosInstance
    .get(`/api/rate/seasons/${propertyId}`, { withCredentials: true })
    .then((res) => res.data)

/**
 * Create a new season.
 */
export const createSeason = (payload: movininTypes.CreateRateSeasonPayload): Promise<movininTypes.RateSeason> =>
  axiosInstance
    .post('/api/rate/seasons', payload, { withCredentials: true })
    .then((res) => res.data)

/**
 * Update an existing season.
 */
export const updateSeason = (id: string, payload: movininTypes.UpdateRateSeasonPayload): Promise<movininTypes.RateSeason> =>
  axiosInstance
    .put(`/api/rate/seasons/${id}`, payload, { withCredentials: true })
    .then((res) => res.data)

/**
 * Delete a season.
 */
export const deleteSeason = (id: string): Promise<void> =>
  axiosInstance
    .delete(`/api/rate/seasons/${id}`, { withCredentials: true })
    .then(() => undefined)

/**
 * Get all discounts for a property.
 */
export const getDiscounts = (propertyId: string): Promise<movininTypes.RateDiscount[]> =>
  axiosInstance
    .get(`/api/rate/discounts/${propertyId}`, { withCredentials: true })
    .then((res) => res.data)

/**
 * Create a new discount.
 */
export const createDiscount = (payload: movininTypes.CreateRateDiscountPayload): Promise<movininTypes.RateDiscount> =>
  axiosInstance
    .post('/api/rate/discounts', payload, { withCredentials: true })
    .then((res) => res.data)

/**
 * Update an existing discount.
 */
export const updateDiscount = (id: string, payload: movininTypes.UpdateRateDiscountPayload): Promise<movininTypes.RateDiscount> =>
  axiosInstance
    .put(`/api/rate/discounts/${id}`, payload, { withCredentials: true })
    .then((res) => res.data)

/**
 * Delete a discount.
 */
export const deleteDiscount = (id: string): Promise<void> =>
  axiosInstance
    .delete(`/api/rate/discounts/${id}`, { withCredentials: true })
    .then(() => undefined)

/**
 * Calculate stay price.
 */
export const calculateStayPrice = (payload: movininTypes.CalculateStayPricePayload): Promise<movininTypes.StayPriceResult> =>
  axiosInstance
    .post('/api/rate/calculate', payload, { withCredentials: true })
    .then((res) => res.data)

/**
 * Sync rates for a property to Channex.
 */
export const syncRatesToChannex = (propertyId: string): Promise<{ synced: number }> =>
  axiosInstance
    .post(`/api/rate/sync-channex/${propertyId}`, {}, { withCredentials: true })
    .then((res) => res.data)
