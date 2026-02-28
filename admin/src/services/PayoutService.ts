import * as movininTypes from ':movinin-types'
import axiosInstance from './axiosInstance'

/**
 * Generate a monthly payout for a specific owner.
 */
export const generate = (
  ownerId: string,
  year: number,
  month: number,
): Promise<movininTypes.OwnerPayout> =>
  axiosInstance
    .post(`/api/payouts/generate/${ownerId}/${year}/${month}`, null, { withCredentials: true })
    .then((res) => res.data)

/**
 * Generate payouts for all owners for a specific month.
 */
export const generateAll = (
  year: number,
  month: number,
): Promise<movininTypes.OwnerPayout[]> =>
  axiosInstance
    .post(`/api/payouts/generate-all/${year}/${month}`, null, { withCredentials: true })
    .then((res) => res.data)

/**
 * List payouts with optional filters.
 */
export const list = (
  query?: movininTypes.GetPayoutsQuery,
): Promise<movininTypes.OwnerPayout[]> =>
  axiosInstance
    .get('/api/payouts', { params: query, withCredentials: true })
    .then((res) => res.data)

/**
 * List payouts for a specific owner.
 */
export const listByOwner = (
  ownerId: string,
  query?: Omit<movininTypes.GetPayoutsQuery, 'ownerId'>,
): Promise<movininTypes.OwnerPayout[]> =>
  axiosInstance
    .get(`/api/payouts/owner/${ownerId}`, { params: query, withCredentials: true })
    .then((res) => res.data)

/**
 * Get a single payout detail.
 */
export const detail = (payoutId: string): Promise<movininTypes.OwnerPayout> =>
  axiosInstance
    .get(`/api/payouts/${payoutId}`, { withCredentials: true })
    .then((res) => res.data)

/**
 * Approve payouts (Draft -> Approved).
 */
export const approve = (ids: string[]): Promise<{ modifiedCount: number }> =>
  axiosInstance
    .put('/api/payouts/approve', { ids }, { withCredentials: true })
    .then((res) => res.data)

/**
 * Mark payouts as paid (Approved -> Paid).
 */
export const markPaid = (
  ids: string[],
  paymentMethod?: string,
  notes?: string,
): Promise<{ modifiedCount: number }> =>
  axiosInstance
    .put('/api/payouts/mark-paid', { ids, paymentMethod, notes }, { withCredentials: true })
    .then((res) => res.data)
