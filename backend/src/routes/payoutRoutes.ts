import express from 'express'
import routeNames from '../config/payoutRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as payoutController from '../controllers/payoutController'

const routes = express.Router()

routes.route(routeNames.generate).post(authJwt.verifyToken, authJwt.authAdmin, payoutController.generate)
routes.route(routeNames.generateAll).post(authJwt.verifyToken, authJwt.authAdmin, payoutController.generateAll)
routes.route(routeNames.approve).put(authJwt.verifyToken, authJwt.authAdmin, payoutController.approve)
routes.route(routeNames.markPaid).put(authJwt.verifyToken, authJwt.authAdmin, payoutController.markPaid)
routes.route(routeNames.listByOwner).get(authJwt.verifyToken, authJwt.authAgency, payoutController.listByOwner)
routes.route(routeNames.list).get(authJwt.verifyToken, authJwt.authAgency, payoutController.list)
routes.route(routeNames.detail).get(authJwt.verifyToken, authJwt.authAgency, payoutController.detail)

export default routes
