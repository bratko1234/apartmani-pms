import { Schema, model } from 'mongoose'
import * as movininTypes from ':movinin-types'
import * as env from '../config/env.config'

export const BOOKING_EXPIRE_AT_INDEX_NAME = 'expireAt'

const bookingSchema = new Schema<env.Booking>(
  {
    agency: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'User',
      index: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Location',
    },
    property: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Property',
    },
    renter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    from: {
      type: Date,
      required: [true, "can't be blank"],
    },
    to: {
      type: Date,
      required: [true, "can't be blank"],
    },
    status: {
      type: String,
      enum: [
        movininTypes.BookingStatus.Void,
        movininTypes.BookingStatus.Pending,
        movininTypes.BookingStatus.Deposit,
        movininTypes.BookingStatus.Paid,
        movininTypes.BookingStatus.Reserved,
        movininTypes.BookingStatus.Cancelled,
      ],
      required: [true, "can't be blank"],
    },
    cancellation: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, "can't be blank"],
    },
    cancelRequest: {
      type: Boolean,
      default: false,
    },
    sessionId: {
      type: String,
      index: true,
    },
    paymentIntentId: {
      type: String,
    },
    customerId: {
      type: String,
    },
    paypalOrderId: {
      type: String,
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
      default: movininTypes.BookingSource.Direct,
    },
    channexBookingId: {
      type: String,
      index: true,
    },
    channexReservationId: {
      type: String,
    },
    externalGuestName: {
      type: String,
    },
    externalGuestEmail: {
      type: String,
      maxlength: 254,
    },
    externalGuestPhone: {
      type: String,
      maxlength: 30,
    },
    externalGuestCountry: {
      type: String,
      maxlength: 3,
    },
    externalGuestAddress: {
      type: String,
      maxlength: 500,
    },
    externalGuestCity: {
      type: String,
      maxlength: 200,
    },
    externalGuestZip: {
      type: String,
      maxlength: 20,
    },
    externalGuestLanguage: {
      type: String,
      maxlength: 10,
    },
    expireAt: {
      //
      // Bookings created from checkout with Stripe are temporary and
      // are automatically deleted if the payment checkout session expires.
      //
      type: Date,
      index: { name: BOOKING_EXPIRE_AT_INDEX_NAME, expireAfterSeconds: env.BOOKING_EXPIRE_AT, background: true },
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'Booking',
  },
)

const Booking = model<env.Booking>('Booking', bookingSchema)

export default Booking
