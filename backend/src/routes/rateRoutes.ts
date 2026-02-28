import express from 'express'
import routeNames from '../config/rateRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as rateController from '../controllers/rateController'

const routes = express.Router()

// Seasons CRUD
routes.route(routeNames.getSeasons).get(authJwt.verifyToken, authJwt.authAgency, rateController.getSeasons)
routes.route(routeNames.createSeason).post(authJwt.verifyToken, authJwt.authAgency, rateController.createSeason)
routes.route(routeNames.updateSeason).put(authJwt.verifyToken, authJwt.authAgency, rateController.updateSeason)
routes.route(routeNames.deleteSeason).delete(authJwt.verifyToken, authJwt.authAgency, rateController.deleteSeason)

// Discounts CRUD
routes.route(routeNames.getDiscounts).get(authJwt.verifyToken, authJwt.authAgency, rateController.getDiscounts)
routes.route(routeNames.createDiscount).post(authJwt.verifyToken, authJwt.authAgency, rateController.createDiscount)
routes.route(routeNames.updateDiscount).put(authJwt.verifyToken, authJwt.authAgency, rateController.updateDiscount)
routes.route(routeNames.deleteDiscount).delete(authJwt.verifyToken, authJwt.authAgency, rateController.deleteDiscount)

// Price calculation (accessible by any authenticated user)
routes.route(routeNames.calculateStayPrice).post(authJwt.verifyToken, rateController.calculateStayPrice)

// Channex sync (admin/agency only)
routes.route(routeNames.syncRatesToChannex).post(authJwt.verifyToken, authJwt.authAgency, rateController.syncRatesToChannex)

export default routes
