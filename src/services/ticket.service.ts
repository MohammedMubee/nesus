import mongoose from 'mongoose';
import { Ticket, Activity } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ActivityType, TicketPriority, TicketStatus } from '../types/index.js';

export class TicketService {
  static async getAll() {
    return Ticket.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'contact',
        select: 'id name companyId',
        populate: { path: 'company', select: 'id name' }
      });
  }

  static async create(data: {
    subject: string;
    priority?: TicketPriority;
    status?: TicketStatus;
    contactId?: string;
  }) {
    const validContactId = (data.contactId && mongoose.isValidObjectId(data.contactId)) ? data.contactId : null;

    const ticket = await Ticket.create({
      subject: data.subject,
      priority: data.priority || TicketPriority.MEDIUM,
      status: data.status || TicketStatus.OPEN,
      contactId: validContactId
    });

    if (ticket.contactId) {
      await Activity.create({
        type: ActivityType.NOTE,
        summary: `Support ticket opened: "${ticket.subject}" [Priority: ${ticket.priority}].`,
        contactId: ticket.contactId,
        timestamp: new Date()
      });
    }

    return Ticket.findById(ticket._id).populate('contact');
  }

  static async updateStatus(id: string, status: TicketStatus) {
    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('contact');

    if (!ticket) {
      throw ApiError.notFound('Ticket not found.');
    }

    if (ticket.contactId) {
      await Activity.create({
        type: ActivityType.NOTE,
        summary: `Support ticket "${ticket.subject}" status changed to ${status}.`,
        contactId: ticket.contactId,
        timestamp: new Date()
      });
    }

    return ticket;
  }

  static async delete(id: string) {
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) {
      throw ApiError.notFound('Ticket not found.');
    }

    return ticket;
  }
}
