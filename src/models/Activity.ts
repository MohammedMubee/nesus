import mongoose, { Schema, Document, Types } from 'mongoose';
import { ActivityType } from '../types/index.js';

export interface IActivity extends Document {
  id: string;
  type: ActivityType;
  summary: string;
  contactId?: Types.ObjectId | string | null;
  dealId?: Types.ObjectId | string | null;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      enum: Object.values(ActivityType),
      default: ActivityType.NOTE
    },
    summary: { type: String, required: true, trim: true },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', default: null },
    timestamp: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (ret.contactId && typeof ret.contactId === 'object' && ret.contactId._id) {
          ret.contactId = ret.contactId._id.toString();
        } else if (ret.contactId) {
          ret.contactId = ret.contactId.toString();
        }
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

activitySchema.virtual('contact', {
  ref: 'Contact',
  localField: 'contactId',
  foreignField: '_id',
  justOne: true
});

activitySchema.virtual('deal', {
  ref: 'Deal',
  localField: 'dealId',
  foreignField: '_id',
  justOne: true
});

export const Activity = mongoose.model<IActivity>('Activity', activitySchema, 'activities');
