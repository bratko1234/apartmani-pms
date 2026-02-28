import * as movininTypes from ':movinin-types'
import axiosInstance from './axiosInstance'

/**
 * Get message thread for a booking.
 */
export const getThread = (bookingId: string): Promise<movininTypes.Message[]> =>
  axiosInstance
    .get(`/api/messages/${bookingId}`, { withCredentials: true })
    .then((res) => res.data)

/**
 * Send a reply to a booking message thread.
 */
export const sendReply = (bookingId: string, content: string): Promise<movininTypes.Message> =>
  axiosInstance
    .post(`/api/messages/${bookingId}/reply`, { content }, { withCredentials: true })
    .then((res) => res.data)

/**
 * Mark messages as read.
 */
export const markAsRead = (ids: string[], readerType: 'owner' | 'admin'): Promise<{ modifiedCount: number }> =>
  axiosInstance
    .put('/api/messages/mark-read', { ids, readerType }, { withCredentials: true })
    .then((res) => res.data)

/**
 * Get unread message count for the current agency.
 */
export const getUnreadCount = (): Promise<movininTypes.MessageUnreadCount> =>
  axiosInstance
    .get('/api/messages/unread-count', { withCredentials: true })
    .then((res) => res.data)
