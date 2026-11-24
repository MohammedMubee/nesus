import mongoose, { Schema, Document, Types } from 'mongoose';
import { LeadStatus } from '../types/index.js';

export interface ILead extends Document {
  id: string;
  name: string;
  email: string;
  source?: string;
  status: LeadStatus;
  title?: string;
  companyName?: string;
  convertedAt?: Date | null;
  convertedContactId?: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    source: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(LeadStatus),
      default: LeadStatus.NEW
    },
    title: { type: String, trim: true },
    companyName: { type: String, trim: true },
    convertedAt: { type: Date, default: null },
    convertedContactId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (ret.convertedContactId && typeof ret.convertedContactId === 'object' && ret.convertedContactId._id) {
          ret.convertedContactId = ret.convertedContactId._id.toString();
        } else if (ret.convertedContactId) {
          ret.convertedContactId = ret.convertedContactId.toString();
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

leadSchema.virtual('convertedContact', {
  ref: 'Contact',
  localField: 'convertedContactId',
  foreignField: '_id',
  justOne: true
});

export const Lead = mongoose.model<ILead>('Lead', leadSchema, 'leads');
