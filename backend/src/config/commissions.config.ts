import * as movininTypes from ':movinin-types'

/**
 * OTA commission rates - the percentage that each OTA takes from the gross revenue.
 * These are deducted before calculating the management fee.
 */
export const OTA_COMMISSION_RATES: Record<movininTypes.BookingSource, number> = {
  [movininTypes.BookingSource.Airbnb]: 0.155,
  [movininTypes.BookingSource.BookingCom]: 0.15,
  [movininTypes.BookingSource.Expedia]: 0.15,
  [movininTypes.BookingSource.Direct]: 0,
  [movininTypes.BookingSource.Other]: 0,
}

/**
 * Management fee rate - applied to gross revenue for OTA bookings,
 * and represents our commission on direct bookings.
 */
export const MANAGEMENT_FEE_RATE = 0.12

/**
 * Default cleaning fee per booking (EUR).
 * Can be overridden per property in the future.
 */
export const DEFAULT_CLEANING_FEE = 0
