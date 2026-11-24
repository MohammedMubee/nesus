import mongoose from 'mongoose';
import { Deal, Contact, Quote, Activity } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ActivityType, DealStage, QuoteStatus } from '../types/index.js';

export class DealService {
  static async getAll() {
    return Deal.find()
      .sort({ createdAt: -1 })
      .populate('contact', 'id name email')
      .populate('company', 'id name')
      .populate('quotes');
  }

  static async getById(id: string) {
    const deal = await Deal.findById(id)
      .populate('contact')
      .populate('company')
      .populate('quotes')
      .populate({ path: 'tasks', options: { sort: { createdAt: -1 } } })
      .populate({ path: 'activities', options: { sort: { timestamp: -1 } } });

    if (!deal) {
      throw ApiError.notFound('Deal not found.');
    }

    return deal;
  }

  static async create(data: {
    title: string;
    value: number;
    stage?: DealStage;
    contactId?: string;
    companyId?: string;
    expectedCloseDate?: string;
  }) {
    let targetCompanyId = (data.companyId && mongoose.isValidObjectId(data.companyId)) ? data.companyId : undefined;
    const validContactId = (data.contactId && mongoose.isValidObjectId(data.contactId)) ? data.contactId : null;

    if (!targetCompanyId && validContactId) {
      const contact = await Contact.findById(validContactId);
      if (contact?.companyId) {
        targetCompanyId = contact.companyId.toString();
      }
    }

    const deal = await Deal.create({
      title: data.title,
      value: data.value,
      stage: data.stage || DealStage.NEW,
      contactId: validContactId,
      companyId: targetCompanyId || null,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null
    });

    await Activity.create({
      type: ActivityType.NOTE,
      summary: `New deal initiated: "${deal.title}" with pipeline value of $${deal.value.toLocaleString()}.`,
      contactId: deal.contactId || null,
      dealId: deal._id,
      timestamp: new Date()
    });

    return Deal.findById(deal._id)
      .populate('contact')
      .populate('company')
      .populate('quotes');
  }

  static async update(
    id: string,
    data: {
      title?: string;
      value?: number;
      stage?: DealStage;
      contactId?: string;
      companyId?: string;
      expectedCloseDate?: string;
    }
  ) {
    const updateData: Record<string, any> = { ...data };
    if (data.expectedCloseDate !== undefined) {
      updateData.expectedCloseDate = data.expectedCloseDate ? new Date(data.expectedCloseDate) : null;
    }

    const deal = await Deal.findByIdAndUpdate(id, updateData, { new: true })
      .populate('contact')
      .populate('company')
      .populate('quotes');

    if (!deal) {
      throw ApiError.notFound('Deal not found.');
    }

    return deal;
  }

  static async updateStage(id: string, newStage: DealStage) {
    const deal = await Deal.findById(id).populate('quotes').populate('contact');

    if (!deal) {
      throw ApiError.notFound('Deal not found.');
    }

    const oldStage = deal.stage;
    deal.stage = newStage;
    await deal.save();

    let generatedQuote = null;
    const existingQuotes = await Quote.find({ dealId: deal._id });
    if (newStage === DealStage.PROPOSAL && existingQuotes.length === 0) {
      generatedQuote = await Quote.create({
        dealId: deal._id,
        amount: deal.value,
        status: QuoteStatus.DRAFT
      });
    }

    await Activity.create({
      type: ActivityType.NOTE,
      summary: `Deal stage advanced: "${deal.title}" moved from ${oldStage} to ${newStage}.${generatedQuote ? ' Automatic draft proposal quote generated.' : ''}`,
      contactId: deal.contactId || null,
      dealId: deal._id,
      timestamp: new Date()
    });

    const updatedDeal = await Deal.findById(id)
      .populate('quotes')
      .populate('contact')
      .populate('company');

    return {
      deal: updatedDeal,
      generatedQuote
    };
  }

  static async delete(id: string) {
    const deal = await Deal.findByIdAndDelete(id);
    if (!deal) {
      throw ApiError.notFound('Deal not found.');
    }

    return deal;
  }
}
