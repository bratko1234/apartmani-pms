import express from 'express'
import routeNames from '../config/channexRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as channexController from '../controllers/channexController'
import { verifySignature } from '../channex/channex.webhook'

const routes = express.Router()

routes.route(routeNames.webhook).post(verifySignature, channexController.webhook)
routes.route(routeNames.syncProperty).post(authJwt.verifyToken, authJwt.authAgency, channexController.syncProperty)
routes.route(routeNames.syncAvailability).post(authJwt.verifyToken, authJwt.authAgency, channexController.syncAvailability)
routes.route(routeNames.syncRates).post(authJwt.verifyToken, authJwt.authAgency, channexController.syncRates)
routes.route(routeNames.getMapping).get(authJwt.verifyToken, authJwt.authAgency, channexController.getMapping)
routes.route(routeNames.syncAll).post(authJwt.verifyToken, authJwt.authAdmin, channexController.syncAll)

export default routes
