import express from 'express'
import routeNames from '../config/messageRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as messageController from '../controllers/messageController'

const routes = express.Router()

// Static paths must be registered before parameterized :bookingId routes
routes.route(routeNames.unreadCount).get(authJwt.verifyToken, authJwt.authAgency, messageController.getUnreadCount)
routes.route(routeNames.markRead).put(authJwt.verifyToken, authJwt.authAgency, messageController.markAsRead)
routes.route(routeNames.thread).get(authJwt.verifyToken, authJwt.authAgency, messageController.getThread)
routes.route(routeNames.reply).post(authJwt.verifyToken, authJwt.authAgency, messageController.sendReply)

export default routes
