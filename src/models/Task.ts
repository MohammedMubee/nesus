import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  id: string;
  title: string;
  dueDate?: Date | null;
  done: boolean;
  contactId?: Types.ObjectId | string | null;
  dealId?: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, default: null },
    done: { type: Boolean, default: false },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', default: null }
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

taskSchema.virtual('contact', {
  ref: 'Contact',
  localField: 'contactId',
  foreignField: '_id',
  justOne: true
});

taskSchema.virtual('deal', {
  ref: 'Deal',
  localField: 'dealId',
  foreignField: '_id',
  justOne: true
});

export const Task = mongoose.model<ITask>('Task', taskSchema, 'tasks');
