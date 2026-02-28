import express from 'express'
import routeNames from '../config/ownerRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as ownerController from '../controllers/ownerController'

const routes = express.Router()

routes.route(routeNames.dashboard).get(authJwt.verifyToken, authJwt.authAgency, ownerController.getDashboard)
routes.route(routeNames.revenue).get(authJwt.verifyToken, authJwt.authAgency, ownerController.getRevenue)
routes.route(routeNames.calendar).get(authJwt.verifyToken, authJwt.authAgency, ownerController.getCalendar)
routes.route(routeNames.occupancyTrend).get(authJwt.verifyToken, authJwt.authAgency, ownerController.getOccupancyTrend)
routes.route(routeNames.revenueTrend).get(authJwt.verifyToken, authJwt.authAgency, ownerController.getRevenueTrend)

export default routes
