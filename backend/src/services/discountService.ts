import * as movininTypes from ':movinin-types'
import User from '../models/User'
import * as logger from '../utils/logger'

/**
 * Member discount percentage for direct bookings.
 */
const MEMBER_DISCOUNT_PERCENT = 10

/**
 * Calculate member discount for a given base price.
 *
 * Only applies to direct channel bookings for authenticated members.
 *
 * @param {number} basePrice - The total price before discount
 * @param {string} [userId] - The user ID to check membership
 * @param {string} [channel='direct'] - The booking channel
 * @returns {Promise<movininTypes.DiscountResult>}
 */
export const calculateMemberDiscount = async (
  basePrice: number,
  userId?: string,
  channel: string = 'direct',
): Promise<movininTypes.DiscountResult> => {
  const noDiscount: movininTypes.DiscountResult = {
    originalPrice: basePrice,
    discountPercent: 0,
    discountAmount: 0,
    finalPrice: basePrice,
    discountLabel: '',
  }

  // Only direct channel gets member discount
  if (channel !== 'direct') {
    return noDiscount
  }

  // Must have a user ID
  if (!userId) {
    return noDiscount
  }

  try {
    const user = await User.findById(userId)

    if (!user) {
      return noDiscount
    }

    // Must be an active member
    if (!user.isMember) {
      return noDiscount
    }

    // Must be a regular user (not admin or agency)
    if (user.type !== movininTypes.UserType.User) {
      return noDiscount
    }

    const discountAmount = Math.round((basePrice * MEMBER_DISCOUNT_PERCENT) / 100)
    const finalPrice = basePrice - discountAmount

    return {
      originalPrice: basePrice,
      discountPercent: MEMBER_DISCOUNT_PERCENT,
      discountAmount,
      finalPrice,
      discountLabel: `Member discount (${MEMBER_DISCOUNT_PERCENT}%)`,
    }
  } catch (err) {
    logger.error('[discountService.calculateMemberDiscount] Error calculating discount', err)
    return noDiscount
  }
}

/**
 * Check if a user is an active member.
 *
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export const isMember = async (userId: string): Promise<boolean> => {
  try {
    const user = await User.findById(userId)
    return !!user?.isMember
  } catch (err) {
    logger.error('[discountService.isMember] Error checking membership', err)
    return false
  }
}

/**
 * Get the current member discount percentage.
 *
 * @returns {number}
 */
export const getMemberDiscountPercent = (): number => MEMBER_DISCOUNT_PERCENT
