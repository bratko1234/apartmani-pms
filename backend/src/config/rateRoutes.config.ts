const routes = {
  getSeasons: '/api/rate/seasons/:propertyId',
  createSeason: '/api/rate/seasons',
  updateSeason: '/api/rate/seasons/:id',
  deleteSeason: '/api/rate/seasons/:id',
  getDiscounts: '/api/rate/discounts/:propertyId',
  createDiscount: '/api/rate/discounts',
  updateDiscount: '/api/rate/discounts/:id',
  deleteDiscount: '/api/rate/discounts/:id',
  calculateStayPrice: '/api/rate/calculate',
  syncRatesToChannex: '/api/rate/sync-channex/:propertyId',
}

export default routes
