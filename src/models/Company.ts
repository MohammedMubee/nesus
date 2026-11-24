import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    industry: { type: String, trim: true },
    website: { type: String, trim: true }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
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

companySchema.virtual('contacts', {
  ref: 'Contact',
  localField: '_id',
  foreignField: 'companyId'
});

companySchema.virtual('deals', {
  ref: 'Deal',
  localField: '_id',
  foreignField: 'companyId'
});

export const Company = mongoose.model<ICompany>('Company', companySchema, 'companies');
