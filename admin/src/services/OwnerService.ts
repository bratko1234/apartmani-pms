import * as movininTypes from ':movinin-types'
import axiosInstance from './axiosInstance'

/**
 * Get owner dashboard data.
 */
export const getDashboard = (): Promise<movininTypes.OwnerDashboardData> =>
  axiosInstance
    .get('/api/owner/dashboard', { withCredentials: true })
    .then((res) => res.data)

/**
 * Get revenue breakdown for a specific month.
 */
export const getRevenue = (year: number, month: number): Promise<movininTypes.OwnerRevenueRow[]> =>
  axiosInstance
    .get(`/api/owner/revenue/${year}/${month}`, { withCredentials: true })
    .then((res) => res.data)

/**
 * Get calendar data for a property in a specific month.
 */
export const getCalendar = (propertyId: string, year: number, month: number): Promise<movininTypes.OwnerCalendarDay[]> =>
  axiosInstance
    .get(`/api/owner/calendar/${propertyId}/${year}/${month}`, { withCredentials: true })
    .then((res) => res.data)

/**
 * Get occupancy trend for the past N months.
 */
export const getOccupancyTrend = (months?: number): Promise<movininTypes.OccupancyTrendPoint[]> =>
  axiosInstance
    .get('/api/owner/occupancy-trend', {
      withCredentials: true,
      params: months ? { months } : undefined,
    })
    .then((res) => res.data)

/**
 * Get revenue trend for the past N months, broken down by source.
 */
export const getRevenueTrend = (months?: number): Promise<movininTypes.RevenueTrendPoint[]> =>
  axiosInstance
    .get('/api/owner/revenue-trend', {
      withCredentials: true,
      params: months ? { months } : undefined,
    })
    .then((res) => res.data)
