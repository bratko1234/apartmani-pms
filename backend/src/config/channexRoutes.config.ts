const routes = {
  webhook: '/api/channex/webhook',
  syncProperty: '/api/channex/sync-property/:propertyId',
  syncAvailability: '/api/channex/sync-availability/:propertyId',
  syncRates: '/api/channex/sync-rates/:propertyId',
  getMapping: '/api/channex/mapping/:propertyId',
  syncAll: '/api/channex/sync-all',
  status: '/api/channex/status',
  webhookLogs: '/api/channex/webhook-logs',
  openChannelTestConnection: '/api/channex/open-channel/test_connection',
  openChannelMappingDetails: '/api/channex/open-channel/mapping_details',
  openChannelChanges: '/api/channex/open-channel/changes',
}

export default routes
