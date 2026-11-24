import mongoose, { Schema, Document, Types } from 'mongoose';
import { DealStage } from '../types/index.js';

export interface IDeal extends Document {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate?: Date | null;
  contactId?: Types.ObjectId | string | null;
  companyId?: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

const dealSchema = new Schema<IDeal>(
  {
    title: { type: String, required: true, trim: true },
    value: { type: Number, default: 0 },
    stage: {
      type: String,
      enum: Object.values(DealStage),
      default: DealStage.NEW
    },
    expectedCloseDate: { type: Date, default: null },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', default: null }
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
        if (ret.companyId && typeof ret.companyId === 'object' && ret.companyId._id) {
          ret.companyId = ret.companyId._id.toString();
        } else if (ret.companyId) {
          ret.companyId = ret.companyId.toString();
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

dealSchema.virtual('contact', {
  ref: 'Contact',
  localField: 'contactId',
  foreignField: '_id',
  justOne: true
});

dealSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true
});

dealSchema.virtual('quotes', {
  ref: 'Quote',
  localField: '_id',
  foreignField: 'dealId'
});

dealSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'dealId'
});

dealSchema.virtual('activities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'dealId'
});

export const Deal = mongoose.model<IDeal>('Deal', dealSchema, 'deals');
