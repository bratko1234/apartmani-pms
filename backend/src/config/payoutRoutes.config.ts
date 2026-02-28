const routes = {
  generate: '/api/payouts/generate/:ownerId/:year/:month',
  generateAll: '/api/payouts/generate-all/:year/:month',
  list: '/api/payouts',
  listByOwner: '/api/payouts/owner/:ownerId',
  detail: '/api/payouts/:payoutId',
  approve: '/api/payouts/approve',
  markPaid: '/api/payouts/mark-paid',
}

export default routes
