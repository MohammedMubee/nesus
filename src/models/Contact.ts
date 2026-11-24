import mongoose, { Schema, Document, Types } from 'mongoose';
import { LifecycleStage } from '../types/index.js';

export interface IContact extends Document {
  id: string;
  name: string;
  title?: string;
  email: string;
  phone?: string;
  department?: string;
  lifecycleStage: LifecycleStage;
  companyId?: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    lifecycleStage: {
      type: String,
      enum: Object.values(LifecycleStage),
      default: LifecycleStage.LEAD
    },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', default: null }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
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

contactSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true
});

contactSchema.virtual('deals', {
  ref: 'Deal',
  localField: '_id',
  foreignField: 'contactId'
});

contactSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'contactId'
});

contactSchema.virtual('tickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'contactId'
});

contactSchema.virtual('activities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'contactId'
});

export const Contact = mongoose.model<IContact>('Contact', contactSchema, 'contacts');
