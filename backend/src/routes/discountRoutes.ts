import express from 'express'
import * as discountController from '../controllers/discountController'

const routes = express.Router()

routes.route('/api/discount/calculate').get(discountController.calculate)
routes.route('/api/discount/percent').get(discountController.getDiscountPercent)

export default routes
