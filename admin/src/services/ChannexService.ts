import axiosInstance from './axiosInstance'

export interface ChannexStatus {
  enabled: boolean
  connected: boolean
  propertyCount: number
  syncedCount: number
  lastWebhookAt: string | null
}

export interface ChannexWebhookLogEntry {
  _id: string
  eventType: string
  channexBookingId?: string
  processed: boolean
  processedAt?: string
  error?: string
  createdAt: string
}

export interface ChannexPropertySync {
  _id: string
  name: string
  channexId?: string
  lastSyncedAt?: string
  hasMappings: boolean
}

/**
 * Get Channex integration status.
 */
export const getStatus = (): Promise<ChannexStatus> =>
  axiosInstance
    .get('/api/channex/status', { withCredentials: true })
    .then((res) => res.data)

/**
 * Sync a single property to Channex.
 */
export const syncProperty = (propertyId: string): Promise<{ status: string; propertyId: string }> =>
  axiosInstance
    .post(`/api/channex/sync-property/${propertyId}`, null, { withCredentials: true })
    .then((res) => res.data)

/**
 * Sync all properties to Channex.
 */
export const syncAll = (): Promise<{ synced: number; failed: number }> =>
  axiosInstance
    .post('/api/channex/sync-all', null, { withCredentials: true })
    .then((res) => res.data)

/**
 * Get recent webhook logs.
 */
export const getWebhookLogs = (limit = 20): Promise<ChannexWebhookLogEntry[]> =>
  axiosInstance
    .get('/api/channex/webhook-logs', { params: { limit }, withCredentials: true })
    .then((res) => res.data)

/**
 * Get Channex mapping for a specific property.
 */
export const getMapping = (propertyId: string): Promise<Record<string, unknown> | null> =>
  axiosInstance
    .get(`/api/channex/mapping/${propertyId}`, { withCredentials: true })
    .then((res) => res.data)
    .catch(() => null)
