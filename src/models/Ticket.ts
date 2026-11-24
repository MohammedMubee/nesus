import mongoose, { Schema, Document, Types } from 'mongoose';
import { TicketPriority, TicketStatus } from '../types/index.js';

export interface ITicket extends Document {
  id: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  contactId?: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    subject: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      default: TicketPriority.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN
    },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null }
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

ticketSchema.virtual('contact', {
  ref: 'Contact',
  localField: 'contactId',
  foreignField: '_id',
  justOne: true
});

export const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema, 'tickets');
