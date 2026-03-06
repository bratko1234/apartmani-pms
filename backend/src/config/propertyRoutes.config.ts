const routes = {
  create: '/api/create-property',
  update: '/api/update-property',
  delete: '/api/delete-property/:id',
  uploadImage: '/api/upload-property-image',
  deleteTempImage: '/api/delete-temp-property-image/:fileName',
  deleteImage: '/api/delete-property-image/:property/:image',
  getProperty: '/api/property/:id/:language',
  getProperties: '/api/properties/:page/:size',
  getBookingProperties: '/api/booking-properties/:page/:size',
  getFrontendProperties: '/api/frontend-properties/:page/:size',
  getFeaturedProperties: '/api/featured-properties/:page/:size/:language',
  checkProperty: '/api/check-property/:id',
  getRoomTypes: '/api/property-room-types/:id',
  getBuildings: '/api/buildings',
  getBuildingsWithOccupancy: '/api/buildings-with-occupancy',
}

export default routes
