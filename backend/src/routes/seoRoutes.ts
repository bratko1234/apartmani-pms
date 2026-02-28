import express from 'express'
import * as seoController from '../controllers/seoController'

const routes = express.Router()

// Public routes - no authentication required
routes.route('/api/sitemap.xml').get(seoController.getSitemap)
routes.route('/api/robots.txt').get(seoController.getRobots)

export default routes
