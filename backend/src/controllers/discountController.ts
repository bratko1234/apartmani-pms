import { Request, Response } from 'express'
import i18n from '../lang/i18n'
import Property from '../models/Property'
import * as discountService from '../services/discountService'
import * as logger from '../utils/logger'

/**
 * Calculate the number of days between two dates.
 */
const daysBetween = (from: Date, to: Date): number => {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.ceil((to.getTime() - from.getTime()) / msPerDay)
}

/**
 * Calculate member discount for a property booking.
 *
 * GET /api/discount/calculate?propertyId=&from=&to=&userId=
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const calculate = async (req: Request, res: Response) => {
  try {
    const { propertyId, from, to, userId } = req.query

    if (!propertyId || !from || !to) {
      res.status(400).send('Missing required parameters: propertyId, from, to')
      return
    }

    const property = await Property.findById(propertyId as string)
    if (!property) {
      res.status(404).send('Property not found')
      return
    }

    const fromDate = new Date(from as string)
    const toDate = new Date(to as string)

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      res.status(400).send('Invalid date format')
      return
    }

    const nights = daysBetween(fromDate, toDate)
    const basePrice = property.price * nights

    const discount = await discountService.calculateMemberDiscount(
      basePrice,
      userId as string | undefined,
      'direct',
    )

    res.json(discount)
  } catch (err) {
    logger.error(`[discount.calculate] ${i18n.t('ERROR')}`, err)
    res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Get the current member discount percentage (public).
 *
 * GET /api/discount/percent
 *
 * @export
 * @async
 * @param {Request} _req
 * @param {Response} res
 * @returns {unknown}
 */
export const getDiscountPercent = async (_req: Request, res: Response) => {
  try {
    const percent = discountService.getMemberDiscountPercent()
    res.json({ percent })
  } catch (err) {
    logger.error(`[discount.getDiscountPercent] ${i18n.t('ERROR')}`, err)
    res.status(400).send(i18n.t('ERROR') + err)
  }
}
