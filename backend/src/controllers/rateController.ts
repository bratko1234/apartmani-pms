import { Request, Response } from 'express'
import * as movininTypes from ':movinin-types'
import * as rateService from '../services/rateService'
import * as logger from '../utils/logger'
import * as helper from '../utils/helper'

/**
 * Get all seasons for a property.
 */
export const getSeasons = async (req: Request, res: Response) => {
  const { propertyId } = req.params

  try {
    if (!helper.isValidObjectId(propertyId)) {
      res.status(400).send('Invalid property ID')
      return
    }

    const seasons = await rateService.getSeasons(propertyId)
    res.json(seasons)
  } catch (err) {
    logger.error('[rateController.getSeasons]', err)
    res.status(500).send('Internal server error')
  }
}

/**
 * Create a new season.
 */
export const createSeason = async (req: Request, res: Response) => {
  const { body }: { body: movininTypes.CreateRateSeasonPayload } = req

  try {
    if (!body.property || !helper.isValidObjectId(body.property)) {
      res.status(400).send('Invalid property ID')
      return
    }
    if (!body.name || !body.startDate || !body.endDate || body.nightlyRate == null) {
      res.status(400).send('Missing required fields: name, startDate, endDate, nightlyRate')
      return
    }

    const season = await rateService.createSeason(body)
    res.status(201).json(season)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.includes('Overlaps') || message.includes('End date')) {
      res.status(400).send(message)
      return
    }
    logger.error('[rateController.createSeason]', err)
    res.status(500).send('Internal server error')
  }
}

/**
 * Update an existing season.
 */
export const updateSeason = async (req: Request, res: Response) => {
  const { id } = req.params
  const { body }: { body: movininTypes.UpdateRateSeasonPayload } = req

  try {
    if (!helper.isValidObjectId(id)) {
      res.status(400).send('Invalid season ID')
      return
    }

    const updated = await rateService.updateSeason(id, body)
    if (!updated) {
      res.status(404).send('Season not found')
      return
    }

    res.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.includes('Overlaps') || message.includes('End date')) {
      res.status(400).send(message)
      return
    }
    logger.error('[rateController.updateSeason]', err)
    res.status(500).send('Internal server error')
  }
}

/**
 * Delete a season.
 */
export const deleteSeason = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    if (!helper.isValidObjectId(id)) {
      res.status(400).send('Invalid season ID')
      return
    }

    const deleted = await rateService.deleteSeason(id)
    if (!deleted) {
      res.status(404).send('Season not found')
      return
    }

    res.sendStatus(204)
  } catch (err) {
    logger.error('[rateController.deleteSeason]', err)
    res.status(500).send('Internal server error')
  }
}

/**
 * Get all discounts for a property.
 */
export const getDiscounts = async (req: Request, res: Response) => {
  const { propertyId } = req.params

  try {
    if (!helper.isValidObjectId(propertyId)) {
      res.status(400).send('Invalid property ID')
      return
    }

    const discounts = await rateService.getDiscounts(propertyId)
    res.json(discounts)
  } catch (err) {
    logger.error('[rateController.getDiscounts]', err)
    res.status(500).send('Internal server error')
  }
}

/**
 * Create a new discount.
 */
export const createDiscount = async (req: Request, res: Response) => {
  const { body }: { body: movininTypes.CreateRateDiscountPayload } = req

  try {
    if (!body.property || !helper.isValidObjectId(body.property)) {
      res.status(400).send('Invalid property ID')
      return
    }
    if (!body.type || body.discountPercent == null) {
      res.status(400).send('Missing required fields: type, discountPercent')
      return
    }

    const discount = await rateService.createDiscount(body)
    res.status(201).json(discount)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.includes('Discount percent')) {
      res.status(400).send(message)
      return
    }
    logger.error('[rateController.createDiscount]', err)
    res.status(500).send('Internal server error')
  }
}

/**
 * Update an existing discount.
 */
export const updateDiscount = async (req: Request, res: Response) => {
  const { id } = req.params
  const { body }: { body: movininTypes.UpdateRateDiscountPayload } = req

  try {
    if (!helper.isValidObjectId(id)) {
      res.status(400).send('Invalid discount ID')
      return
    }

    const updated = await rateService.updateDiscount(id, body)
    if (!updated) {
      res.status(404).send('Discount not found')
      return
    }

    res.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.includes('Discount percent')) {
      res.status(400).send(message)
      return
    }
    logger.error('[rateController.updateDiscount]', err)
    res.status(500).send('Internal server error')
  }
}

/**
 * Delete a discount.
 */
export const deleteDiscount = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    if (!helper.isValidObjectId(id)) {
      res.status(400).send('Invalid discount ID')
      return
    }

    const deleted = await rateService.deleteDiscount(id)
    if (!deleted) {
      res.status(404).send('Discount not found')
      return
    }

    res.sendStatus(204)
  } catch (err) {
    logger.error('[rateController.deleteDiscount]', err)
    res.status(500).send('Internal server error')
  }
}

/**
 * Calculate stay price for a property and date range.
 */
export const calculateStayPrice = async (req: Request, res: Response) => {
  const { body }: { body: movininTypes.CalculateStayPricePayload } = req

  try {
    if (!body.propertyId || !helper.isValidObjectId(body.propertyId)) {
      res.status(400).send('Invalid property ID')
      return
    }
    if (!body.from || !body.to) {
      res.status(400).send('Missing required fields: from, to')
      return
    }

    const from = new Date(body.from)
    const to = new Date(body.to)

    if (to <= from) {
      res.status(400).send('to must be after from')
      return
    }

    const result = await rateService.calculateStayPrice(
      body.propertyId,
      from,
      to,
      body.channel,
      body.isMember,
    )

    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    if (message.includes('not found') || message.includes('at least')) {
      res.status(400).send(message)
      return
    }
    logger.error('[rateController.calculateStayPrice]', err)
    res.status(500).send('Internal server error')
  }
}

/**
 * Sync rates for a property to Channex using the rate schedule.
 */
export const syncRatesToChannex = async (req: Request, res: Response) => {
  const { propertyId } = req.params

  try {
    if (!helper.isValidObjectId(propertyId)) {
      res.status(400).send('Invalid property ID')
      return
    }

    const now = new Date()
    const oneYearLater = new Date()
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

    const schedule = await rateService.getRateSchedule(
      propertyId,
      now,
      oneYearLater,
      movininTypes.RateChannel.All,
    )

    const rates = schedule.map((day) => ({
      date: day.date,
      rate: day.rate,
      minStay: day.minStay,
    }))

    const channexSync = await import('../channex/channex.sync')
    await channexSync.syncPropertyRates(propertyId, rates)

    res.json({ synced: rates.length })
  } catch (err) {
    logger.error('[rateController.syncRatesToChannex]', err)
    res.status(500).send('Internal server error')
  }
}
