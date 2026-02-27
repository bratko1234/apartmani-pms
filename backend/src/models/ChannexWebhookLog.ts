import { Schema, model, Document } from 'mongoose'

export interface ChannexWebhookLogDocument extends Document {
  eventType: string
  channexBookingId?: string
  payload: Record<string, unknown>
  processed: boolean
  processedAt?: Date
  error?: string
}

const channexWebhookLogSchema = new Schema<ChannexWebhookLogDocument>(
  {
    eventType: {
      type: String,
      required: [true, "can't be blank"],
    },
    channexBookingId: {
      type: String,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: [true, "can't be blank"],
    },
    processed: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'ChannexWebhookLog',
  },
)

const ChannexWebhookLog = model<ChannexWebhookLogDocument>('ChannexWebhookLog', channexWebhookLogSchema)

export default ChannexWebhookLog
