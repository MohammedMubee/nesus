import mongoose, { Schema, Document, Types } from 'mongoose';
import { QuoteStatus } from '../types/index.js';

export interface IQuote extends Document {
  id: string;
  amount: number;
  status: QuoteStatus;
  dealId: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const quoteSchema = new Schema<IQuote>(
  {
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(QuoteStatus),
      default: QuoteStatus.DRAFT
    },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', required: true }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (ret.dealId && typeof ret.dealId === 'object' && ret.dealId._id) {
          ret.dealId = ret.dealId._id.toString();
        } else if (ret.dealId) {
          ret.dealId = ret.dealId.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

quoteSchema.virtual('deal', {
  ref: 'Deal',
  localField: 'dealId',
  foreignField: '_id',
  justOne: true
});

export const Quote = mongoose.model<IQuote>('Quote', quoteSchema, 'quotes');
