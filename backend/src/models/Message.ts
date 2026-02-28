import { Schema, model, Document, Types } from 'mongoose'
import * as movininTypes from ':movinin-types'

export interface MessageDocument extends Document {
  booking: Types.ObjectId
  property: Types.ObjectId
  sender: movininTypes.MessageSender
  senderName: string
  content: string
  source: movininTypes.BookingSource
  channexMessageId?: string
  readByOwner: boolean
  readByAdmin: boolean
}

const messageSchema = new Schema<MessageDocument>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Booking',
      index: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      required: [true, "can't be blank"],
      ref: 'Property',
    },
    sender: {
      type: String,
      enum: ['guest', 'owner', 'system'],
      required: [true, "can't be blank"],
    },
    senderName: {
      type: String,
      required: [true, "can't be blank"],
    },
    content: {
      type: String,
      required: [true, "can't be blank"],
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
      required: [true, "can't be blank"],
    },
    channexMessageId: {
      type: String,
      index: true,
      sparse: true,
    },
    readByOwner: {
      type: Boolean,
      default: false,
    },
    readByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'Message',
  },
)

messageSchema.index({ booking: 1, createdAt: 1 })
messageSchema.index({ property: 1, readByOwner: 1 })

const Message = model<MessageDocument>('Message', messageSchema)

export default Message
