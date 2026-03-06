import express from 'express'
import routeNames from '../config/channexRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as channexController from '../controllers/channexController'
import * as openChannelController from '../controllers/openChannelController'
import { verifySignature } from '../channex/channex.webhook'

const routes = express.Router()

// Channex push webhook (signature-verified, no JWT)
routes.route(routeNames.webhook).post(verifySignature, channexController.webhook)

// Admin/Agency sync endpoints (JWT-authenticated)
routes.route(routeNames.syncProperty).post(authJwt.verifyToken, authJwt.authAgency, channexController.syncProperty)
routes.route(routeNames.syncAvailability).post(authJwt.verifyToken, authJwt.authAgency, channexController.syncAvailability)
routes.route(routeNames.syncRates).post(authJwt.verifyToken, authJwt.authAgency, channexController.syncRates)
routes.route(routeNames.getMapping).get(authJwt.verifyToken, authJwt.authAgency, channexController.getMapping)
routes.route(routeNames.syncAll).post(authJwt.verifyToken, authJwt.authAdmin, channexController.syncAll)

// Admin-only status + webhook logs
routes.route(routeNames.status).get(authJwt.verifyToken, authJwt.authAdmin, openChannelController.status)
routes.route(routeNames.webhookLogs).get(authJwt.verifyToken, authJwt.authAdmin, channexController.webhookLogs)

// Open Channel API endpoints (API-key authenticated by Channex)
routes.route(routeNames.openChannelTestConnection).get(openChannelController.testConnection)
routes.route(routeNames.openChannelMappingDetails).get(openChannelController.mappingDetails)
routes.route(routeNames.openChannelChanges).post(openChannelController.changes)

export default routes
