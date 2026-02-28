import { Request, Response } from 'express'
import Property from '../models/Property'
import * as env from '../config/env.config'
import * as logger from '../utils/logger'

/**
 * Generates a URL-friendly slug from a property name.
 * Transliterates Serbian Latin diacritics to ASCII equivalents.
 */
const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[šś]/g, 's')
    .replace(/[žź]/g, 'z')
    .replace(/đ/g, 'dj')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * GET /api/sitemap.xml
 *
 * Generates a dynamic XML sitemap containing static pages and
 * all available (non-hidden) property detail pages.
 *
 * @export
 * @async
 * @param {Request} _req
 * @param {Response} res
 */
export const getSitemap = async (_req: Request, res: Response) => {
  try {
    const baseUrl = env.FRONTEND_HOST.replace(/\/$/, '')

    // Static pages with their change frequency and priority
    const staticPages = [
      { loc: '/', changefreq: 'daily', priority: '1.0' },
      { loc: '/about', changefreq: 'monthly', priority: '0.5' },
      { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
      { loc: '/destinations', changefreq: 'weekly', priority: '0.7' },
      { loc: '/agencies', changefreq: 'weekly', priority: '0.4' },
      { loc: '/tos', changefreq: 'yearly', priority: '0.2' },
      { loc: '/privacy', changefreq: 'yearly', priority: '0.2' },
      { loc: '/cookie-policy', changefreq: 'yearly', priority: '0.2' },
    ]

    // Fetch all available, non-hidden properties
    // timestamps: true on the schema provides updatedAt, but it isn't
    // declared in the TypeScript interface, so we cast the lean result.
    const properties = await Property.find(
      { available: true, hidden: { $ne: true } },
      { _id: 1, name: 1, updatedAt: 1 },
    ).lean() as unknown as Array<{ _id: string; name: string; updatedAt?: Date }>

    const staticEntries = staticPages
      .map(
        (page) => `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
      )
      .join('\n')

    const propertyEntries = properties
      .map((p) => {
        const slug = generateSlug(p.name)
        const lastmod = p.updatedAt
          ? new Date(p.updatedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]

        return `  <url>
    <loc>${baseUrl}/property/${p._id}/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${propertyEntries}
</urlset>`

    res.header('Content-Type', 'application/xml')
    res.header('Cache-Control', 'public, max-age=3600')
    res.status(200).send(xml)
  } catch (err) {
    logger.error(`[seo.getSitemap] ${err}`)
    res.status(500).send('Internal Server Error')
  }
}

/**
 * GET /api/robots.txt
 *
 * Returns the robots.txt content dynamically, including
 * a reference to the sitemap URL.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 */
export const getRobots = async (req: Request, res: Response) => {
  try {
    const apiHost = `${req.protocol}://${req.get('host')}`

    const content = `User-agent: *
Allow: /
Disallow: /sign-in
Disallow: /sign-up
Disallow: /activate
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /checkout
Disallow: /checkout-session/
Disallow: /bookings
Disallow: /booking
Disallow: /settings
Disallow: /notifications
Disallow: /change-password

Sitemap: ${apiHost}/api/sitemap.xml
`

    res.header('Content-Type', 'text/plain')
    res.header('Cache-Control', 'public, max-age=86400')
    res.status(200).send(content)
  } catch (err) {
    logger.error(`[seo.getRobots] ${err}`)
    res.status(500).send('Internal Server Error')
  }
}
