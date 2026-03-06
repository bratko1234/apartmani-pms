import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as movininTypes from ':movinin-types'
import * as logger from '../utils/logger'
import * as channexSync from '../channex/channex.sync'
import * as channexService from '../channex/channex.service'
import * as channexWebhook from '../channex/channex.webhook'
import ChannexWebhookLog from '../models/ChannexWebhookLog'

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id)

/**
 * Handle Channex webhook.
 */
export const webhook = channexWebhook.handleWebhook

/**
 * Sync a single property to Channex.
 */
export const syncProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params
    if (!isValidObjectId(propertyId)) {
      res.status(400).send({ status: 'error', message: 'Invalid property ID' })
      return
    }
    await channexSync.syncProperty(propertyId)
    res.status(200).send({ status: 'ok', propertyId })
  } catch (err) {
    logger.error('[channex.controller] syncProperty error', err)
    res.status(500).send({ status: 'error', message: 'An internal error occurred' })
  }
}

/**
 * Sync availability for a property to Channex.
 */
export const syncAvailability = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params
    if (!isValidObjectId(propertyId)) {
      res.status(400).send({ status: 'error', message: 'Invalid property ID' })
      return
    }
    await channexSync.syncPropertyAvailability(propertyId)
    res.status(200).send({ status: 'ok', propertyId })
  } catch (err) {
    logger.error('[channex.controller] syncAvailability error', err)
    res.status(500).send({ status: 'error', message: 'An internal error occurred' })
  }
}

/**
 * Sync rates for a property to Channex.
 */
export const syncRates = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params
    if (!isValidObjectId(propertyId)) {
      res.status(400).send({ status: 'error', message: 'Invalid property ID' })
      return
    }
    const { rates } = req.body
    if (rates && !Array.isArray(rates)) {
      res.status(400).send({ status: 'error', message: 'rates must be an array' })
      return
    }
    await channexSync.syncPropertyRates(propertyId, rates)
    res.status(200).send({ status: 'ok', propertyId })
  } catch (err) {
    logger.error('[channex.controller] syncRates error', err)
    res.status(500).send({ status: 'error', message: 'An internal error occurred' })
  }
}

/**
 * Get Channex mapping for a property.
 */
export const getMapping = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params
    if (!isValidObjectId(propertyId)) {
      res.status(400).send({ status: 'error', message: 'Invalid property ID' })
      return
    }
    const mapping = await channexService.getMapping(
      propertyId,
      movininTypes.ChannexMappingType.Property,
    )
    if (mapping) {
      res.status(200).send(mapping)
    } else {
      res.status(404).send({ message: 'Mapping not found' })
    }
  } catch (err) {
    logger.error('[channex.controller] getMapping error', err)
    res.status(500).send({ status: 'error', message: 'An internal error occurred' })
  }
}

/**
 * Sync all properties to Channex.
 */
export const syncAll = async (_req: Request, res: Response) => {
  try {
    const result = await channexSync.syncAllProperties()
    res.status(200).send(result)
  } catch (err) {
    logger.error('[channex.controller] syncAll error', err)
    res.status(500).send({ status: 'error', message: 'An internal error occurred' })
  }
}

/**
 * Get recent webhook logs.
 */
export const webhookLogs = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const logs = await ChannexWebhookLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
    res.status(200).send(logs)
  } catch (err) {
    logger.error('[channex.controller] webhookLogs error', err)
    res.status(500).send({ status: 'error', message: 'An internal error occurred' })
  }
}
