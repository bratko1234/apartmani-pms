import { Request, Response } from 'express'
import * as movininTypes from ':movinin-types'
import * as logger from '../utils/logger'
import * as payoutService from '../services/payoutService'

/**
 * Generate a monthly payout for a specific owner.
 * POST /api/payouts/generate/:ownerId/:year/:month
 */
export const generate = async (req: Request, res: Response) => {
  try {
    const userType = req.user?.type
    if (userType !== movininTypes.UserType.Admin) {
      res.sendStatus(403)
      return
    }

    const { ownerId } = req.params
    const year = parseInt(req.params.year, 10)
    const month = parseInt(req.params.month, 10)

    if (!ownerId || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400).send({ message: 'Invalid parameters' })
      return
    }

    const payout = await payoutService.generateMonthlyPayout(ownerId, year, month)
    res.status(200).send(payout)
  } catch (err) {
    const message = (err as Error).message
    if (message.includes('cannot be regenerated') || message.includes('No properties found')) {
      res.status(400).send({ message })
      return
    }
    logger.error('[payout.generate]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}

/**
 * Generate payouts for all owners for a specific month.
 * POST /api/payouts/generate-all/:year/:month
 */
export const generateAll = async (req: Request, res: Response) => {
  try {
    const userType = req.user?.type
    if (userType !== movininTypes.UserType.Admin) {
      res.sendStatus(403)
      return
    }

    const year = parseInt(req.params.year, 10)
    const month = parseInt(req.params.month, 10)

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400).send({ message: 'Invalid parameters' })
      return
    }

    const payouts = await payoutService.generateAllPayouts(year, month)
    res.status(200).send(payouts)
  } catch (err) {
    logger.error('[payout.generateAll]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}

/**
 * List payouts with optional filters (query params: year, month, status, ownerId).
 * GET /api/payouts
 */
export const list = async (req: Request, res: Response) => {
  try {
    const userType = req.user?.type
    const userId = req.user?._id

    if (!userId) {
      res.sendStatus(401)
      return
    }

    const query: movininTypes.GetPayoutsQuery = {}

    if (req.query.year) {
      query.year = parseInt(req.query.year as string, 10)
    }
    if (req.query.month) {
      query.month = parseInt(req.query.month as string, 10)
    }
    if (req.query.status) {
      query.status = req.query.status as movininTypes.PayoutStatus
    }
    if (req.query.ownerId) {
      query.ownerId = req.query.ownerId as string
    }

    // Non-admin users can only see their own payouts
    if (userType !== movininTypes.UserType.Admin) {
      query.ownerId = userId
    }

    const payouts = await payoutService.getPayouts(query)
    res.status(200).send(payouts)
  } catch (err) {
    logger.error('[payout.list]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}

/**
 * List payouts for a specific owner.
 * GET /api/payouts/owner/:ownerId
 */
export const listByOwner = async (req: Request, res: Response) => {
  try {
    const userType = req.user?.type
    const userId = req.user?._id
    const { ownerId } = req.params

    if (!userId) {
      res.sendStatus(401)
      return
    }

    // Non-admin users can only see their own payouts
    if (userType !== movininTypes.UserType.Admin && userId !== ownerId) {
      res.sendStatus(403)
      return
    }

    const query: movininTypes.GetPayoutsQuery = { ownerId }

    if (req.query.year) {
      query.year = parseInt(req.query.year as string, 10)
    }
    if (req.query.month) {
      query.month = parseInt(req.query.month as string, 10)
    }
    if (req.query.status) {
      query.status = req.query.status as movininTypes.PayoutStatus
    }

    const payouts = await payoutService.getPayouts(query)
    res.status(200).send(payouts)
  } catch (err) {
    logger.error('[payout.listByOwner]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}

/**
 * Get a single payout detail.
 * GET /api/payouts/:payoutId
 */
export const detail = async (req: Request, res: Response) => {
  try {
    const userType = req.user?.type
    const userId = req.user?._id
    const { payoutId } = req.params

    if (!userId) {
      res.sendStatus(401)
      return
    }

    const payout = await payoutService.getPayoutById(payoutId)
    if (!payout) {
      res.status(404).send({ message: 'Payout not found' })
      return
    }

    // Non-admin users can only see their own payouts
    const payoutOwnerId = typeof payout.ownerId === 'string'
      ? payout.ownerId
      : (payout.ownerId as movininTypes.User)._id

    if (userType !== movininTypes.UserType.Admin && userId !== payoutOwnerId) {
      res.sendStatus(403)
      return
    }

    res.status(200).send(payout)
  } catch (err) {
    logger.error('[payout.detail]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}

/**
 * Approve payouts (Draft -> Approved). Admin only.
 * PUT /api/payouts/approve
 */
export const approve = async (req: Request, res: Response) => {
  try {
    const userType = req.user?.type
    if (userType !== movininTypes.UserType.Admin) {
      res.sendStatus(403)
      return
    }

    const { ids } = req.body as movininTypes.ApprovePayoutsPayload
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).send({ message: 'No payout IDs provided' })
      return
    }

    const modifiedCount = await payoutService.approvePayouts(ids)
    res.status(200).send({ modifiedCount })
  } catch (err) {
    logger.error('[payout.approve]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}

/**
 * Mark payouts as paid (Approved -> Paid). Admin only.
 * PUT /api/payouts/mark-paid
 */
export const markPaid = async (req: Request, res: Response) => {
  try {
    const userType = req.user?.type
    if (userType !== movininTypes.UserType.Admin) {
      res.sendStatus(403)
      return
    }

    const { ids, paymentMethod, notes } = req.body as movininTypes.MarkPayoutsPaidPayload
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).send({ message: 'No payout IDs provided' })
      return
    }

    const modifiedCount = await payoutService.markPayoutsPaid(ids, paymentMethod, notes)
    res.status(200).send({ modifiedCount })
  } catch (err) {
    logger.error('[payout.markPaid]', err)
    res.status(500).send({ message: 'Internal error' })
  }
}
