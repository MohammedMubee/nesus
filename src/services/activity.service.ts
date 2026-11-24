import mongoose from 'mongoose';
import { Activity } from '../models/Activity.js';
import { ActivityType } from '../types/index.js';

export class ActivityService {
  static async getAll(filters?: { contactId?: string; dealId?: string }) {
    const query: Record<string, any> = {};
    if (filters?.contactId && mongoose.isValidObjectId(filters.contactId)) query.contactId = filters.contactId;
    if (filters?.dealId && mongoose.isValidObjectId(filters.dealId)) query.dealId = filters.dealId;

    return Activity.find(query)
      .sort({ timestamp: -1 })
      .populate('contact', 'id name')
      .populate('deal', 'id title');
  }

  static async create(data: {
    type: ActivityType;
    summary: string;
    contactId?: string;
    dealId?: string;
    timestamp?: string;
  }) {
    const validContactId = (data.contactId && mongoose.isValidObjectId(data.contactId)) ? data.contactId : null;
    const validDealId = (data.dealId && mongoose.isValidObjectId(data.dealId)) ? data.dealId : null;

    const activity = await Activity.create({
      type: data.type,
      summary: data.summary,
      contactId: validContactId,
      dealId: validDealId,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
    });

    return Activity.findById(activity._id)
      .populate('contact', 'id name')
      .populate('deal', 'id title');
  }
}
