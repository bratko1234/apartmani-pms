import { Schema, model, Document } from 'mongoose'
import * as movininTypes from ':movinin-types'

export interface ChannexMappingDocument extends Document {
  internalId: string
  internalType: movininTypes.ChannexMappingType
  channexId: string
  channexType: string
  metadata?: Record<string, unknown>
  lastSyncedAt?: Date
}

const channexMappingSchema = new Schema<ChannexMappingDocument>(
  {
    internalId: {
      type: String,
      required: [true, "can't be blank"],
    },
    internalType: {
      type: String,
      enum: [
        movininTypes.ChannexMappingType.Property,
        movininTypes.ChannexMappingType.RoomType,
        movininTypes.ChannexMappingType.RatePlan,
      ],
      required: [true, "can't be blank"],
    },
    channexId: {
      type: String,
      required: [true, "can't be blank"],
    },
    channexType: {
      type: String,
      required: [true, "can't be blank"],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    lastSyncedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'ChannexMapping',
  },
)

channexMappingSchema.index({ internalId: 1, internalType: 1 })
channexMappingSchema.index({ channexId: 1, channexType: 1 })

const ChannexMapping = model<ChannexMappingDocument>('ChannexMapping', channexMappingSchema)

export default ChannexMapping
