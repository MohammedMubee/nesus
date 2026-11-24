import mongoose from 'mongoose';
import { Contact, Deal, Task, Ticket, Activity } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { LifecycleStage } from '../types/index.js';

export class ContactService {
  static async getAll() {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .populate('company', 'id name industry')
      .populate('deals', 'id title value stage');

    const [taskCounts, ticketCounts, activityCounts] = await Promise.all([
      Task.aggregate([
        { $match: { contactId: { $ne: null } } },
        { $group: { _id: '$contactId', count: { $sum: 1 } } }
      ]),
      Ticket.aggregate([
        { $match: { contactId: { $ne: null } } },
        { $group: { _id: '$contactId', count: { $sum: 1 } } }
      ]),
      Activity.aggregate([
        { $match: { contactId: { $ne: null } } },
        { $group: { _id: '$contactId', count: { $sum: 1 } } }
      ])
    ]);

    const taskMap = new Map(taskCounts.map((t) => [t._id.toString(), t.count]));
    const ticketMap = new Map(ticketCounts.map((t) => [t._id.toString(), t.count]));
    const actMap = new Map(activityCounts.map((a) => [a._id.toString(), a.count]));

    return contacts.map((c) => {
      const json = c.toJSON();
      const idStr = c._id.toString();
      const dealsCount = Array.isArray((c as any).deals) ? (c as any).deals.length : 0;
      return {
        ...json,
        _count: {
          deals: dealsCount,
          tasks: taskMap.get(idStr) || 0,
          tickets: ticketMap.get(idStr) || 0,
          activities: actMap.get(idStr) || 0
        }
      };
    });
  }

  static async getById(id: string) {
    const contact = await Contact.findById(id).populate('company');
    if (!contact) {
      throw ApiError.notFound('Contact not found.');
    }

    const [deals, tasks, tickets, activities] = await Promise.all([
      Deal.find({ contactId: id }).populate('quotes'),
      Task.find({ contactId: id }).sort({ createdAt: -1 }),
      Ticket.find({ contactId: id }).sort({ createdAt: -1 }),
      Activity.find({ contactId: id }).sort({ timestamp: -1 })
    ]);

    return {
      ...contact.toJSON(),
      deals,
      tasks,
      tickets,
      activities
    };
  }

  static async create(data: {
    name: string;
    title?: string;
    email: string;
    phone?: string;
    department?: string;
    lifecycleStage?: LifecycleStage;
    companyId?: string;
  }) {
    const validCompanyId = (data.companyId && mongoose.isValidObjectId(data.companyId)) ? data.companyId : null;
    const contact = await Contact.create({
      ...data,
      companyId: validCompanyId
    });

    return Contact.findById(contact._id).populate('company');
  }

  static async update(
    id: string,
    data: {
      name?: string;
      title?: string;
      email?: string;
      phone?: string;
      department?: string;
      lifecycleStage?: LifecycleStage;
      companyId?: string;
    }
  ) {
    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        ...data,
        ...(data.companyId !== undefined ? { companyId: data.companyId || null } : {})
      },
      { new: true }
    ).populate('company');

    if (!contact) {
      throw ApiError.notFound('Contact not found.');
    }

    return contact;
  }

  static async updateLifecycleStage(id: string, stage: LifecycleStage) {
    const contact = await Contact.findByIdAndUpdate(
      id,
      { lifecycleStage: stage },
      { new: true }
    ).populate('company');

    if (!contact) {
      throw ApiError.notFound('Contact not found.');
    }

    return contact;
  }

  static async delete(id: string) {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      throw ApiError.notFound('Contact not found.');
    }

    return contact;
  }
}
