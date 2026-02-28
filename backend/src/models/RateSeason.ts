import { Schema, model } from 'mongoose'
import * as movininTypes from ':movinin-types'

export interface IRateSeason {
  property: Schema.Types.ObjectId
  name: string
  startDate: Date
  endDate: Date
  nightlyRate: number
  minStay: number
  maxStay?: number
  channel: movininTypes.RateChannel
  active: boolean
}

const rateSeasonSchema = new Schema<IRateSeason>(
  {
    property: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Property',
      index: true,
    },
    name: {
      type: String,
      required: [true, "can't be blank"],
    },
    startDate: {
      type: Date,
      required: [true, "can't be blank"],
    },
    endDate: {
      type: Date,
      required: [true, "can't be blank"],
    },
    nightlyRate: {
      type: Number,
      required: [true, "can't be blank"],
      min: 0,
    },
    minStay: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxStay: {
      type: Number,
      min: 1,
    },
    channel: {
      type: String,
      enum: [
        movininTypes.RateChannel.All,
        movininTypes.RateChannel.Direct,
        movininTypes.RateChannel.Ota,
      ],
      default: movininTypes.RateChannel.All,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'RateSeason',
  },
)

rateSeasonSchema.index({ property: 1, startDate: 1, endDate: 1 })
rateSeasonSchema.index({ property: 1, active: 1, startDate: 1 })

const RateSeason = model<IRateSeason>('RateSeason', rateSeasonSchema)

export default RateSeason
