import { Schema, model } from 'mongoose'
import * as movininTypes from ':movinin-types'

export interface IRateDiscount {
  property: Schema.Types.ObjectId
  type: movininTypes.DiscountType
  discountPercent: number
  daysBeforeCheckin?: number
  minNights?: number
  channelRestriction: movininTypes.DiscountChannel
  active: boolean
}

const rateDiscountSchema = new Schema<IRateDiscount>(
  {
    property: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Property',
      index: true,
    },
    type: {
      type: String,
      enum: [
        movininTypes.DiscountType.LastMinute,
        movininTypes.DiscountType.LongStayWeekly,
        movininTypes.DiscountType.LongStayMonthly,
        movininTypes.DiscountType.Member,
      ],
      required: [true, "can't be blank"],
    },
    discountPercent: {
      type: Number,
      required: [true, "can't be blank"],
      min: 0,
      max: 100,
    },
    daysBeforeCheckin: {
      type: Number,
      min: 1,
    },
    minNights: {
      type: Number,
      min: 1,
    },
    channelRestriction: {
      type: String,
      enum: [
        movininTypes.DiscountChannel.All,
        movininTypes.DiscountChannel.Direct,
      ],
      default: movininTypes.DiscountChannel.All,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'RateDiscount',
  },
)

rateDiscountSchema.index({ property: 1, type: 1 })
rateDiscountSchema.index({ property: 1, active: 1 })

const RateDiscount = model<IRateDiscount>('RateDiscount', rateDiscountSchema)

export default RateDiscount
