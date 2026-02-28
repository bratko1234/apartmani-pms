import * as movininTypes from ':movinin-types'
import axiosInstance from './axiosInstance'

/**
 * Calculate member discount for a property booking.
 *
 * @param {string} propertyId
 * @param {Date} from
 * @param {Date} to
 * @param {string} [userId]
 * @returns {Promise<movininTypes.DiscountResult>}
 */
export const calculateDiscount = (
  propertyId: string,
  from: Date,
  to: Date,
  userId?: string,
): Promise<movininTypes.DiscountResult> => {
  const params = new URLSearchParams({
    propertyId,
    from: from.toISOString(),
    to: to.toISOString(),
  })

  if (userId) {
    params.set('userId', userId)
  }

  return axiosInstance
    .get(`/api/discount/calculate?${params.toString()}`)
    .then((res) => res.data)
}

/**
 * Get the current member discount percentage.
 *
 * @returns {Promise<number>}
 */
export const getDiscountPercent = (): Promise<number> =>
  axiosInstance
    .get('/api/discount/percent')
    .then((res) => res.data.percent)
