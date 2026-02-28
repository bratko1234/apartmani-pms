import { Schema, model } from 'mongoose'
import * as movininTypes from ':movinin-types'

const payoutBookingLineSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Booking',
    },
    source: {
      type: String,
      enum: [
        movininTypes.BookingSource.Direct,
        movininTypes.BookingSource.Airbnb,
        movininTypes.BookingSource.BookingCom,
        movininTypes.BookingSource.Expedia,
        movininTypes.BookingSource.Other,
      ],
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    checkIn: {
      type: String,
      required: true,
    },
    checkOut: {
      type: String,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
    },
    grossRevenue: {
      type: Number,
      required: true,
    },
    otaCommission: {
      type: Number,
      required: true,
    },
    managementFee: {
      type: Number,
      required: true,
    },
    cleaningFee: {
      type: Number,
      default: 0,
    },
    netToOwner: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
)

const payoutPropertyLineSchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Property',
    },
    propertyName: {
      type: String,
      required: true,
    },
    bookings: {
      type: [payoutBookingLineSchema],
      default: [],
    },
    totalGross: {
      type: Number,
      required: true,
    },
    totalOtaCommission: {
      type: Number,
      required: true,
    },
    totalManagementFee: {
      type: Number,
      required: true,
    },
    totalCleaningFee: {
      type: Number,
      default: 0,
    },
    totalNetToOwner: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
)

const ownerPayoutSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
      index: true,
    },
    period: {
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        required: true,
      },
    },
    properties: {
      type: [payoutPropertyLineSchema],
      default: [],
    },
    totalPayout: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        movininTypes.PayoutStatus.Draft,
        movininTypes.PayoutStatus.Approved,
        movininTypes.PayoutStatus.Paid,
      ],
      default: movininTypes.PayoutStatus.Draft,
      required: true,
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'OwnerPayout',
  },
)

ownerPayoutSchema.index({ ownerId: 1, 'period.year': 1, 'period.month': 1 }, { unique: true })

const OwnerPayout = model('OwnerPayout', ownerPayoutSchema)

export default OwnerPayout
