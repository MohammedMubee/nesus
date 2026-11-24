import { Quote, Deal, Contact, Activity } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ActivityType, DealStage, LifecycleStage, QuoteStatus } from '../types/index.js';

export class QuoteService {
  static async getAll() {
    return Quote.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'deal',
        populate: [
          { path: 'contact', select: 'id name email' },
          { path: 'company', select: 'id name' }
        ]
      });
  }

  static async getById(id: string) {
    const quote = await Quote.findById(id).populate({
      path: 'deal',
      populate: [
        { path: 'contact' },
        { path: 'company' }
      ]
    });

    if (!quote) {
      throw ApiError.notFound('Quote not found.');
    }

    return quote;
  }

  static async create(data: { dealId: string; amount: number; status?: QuoteStatus }) {
    const deal = await Deal.findById(data.dealId);
    if (!deal) {
      throw ApiError.notFound('Deal not found to attach quote to.');
    }

    const quote = await Quote.create({
      dealId: data.dealId,
      amount: data.amount,
      status: data.status || QuoteStatus.DRAFT
    });

    return Quote.findById(quote._id).populate('deal');
  }

  static async updateStatus(id: string, status: QuoteStatus) {
    if (status === QuoteStatus.ACCEPTED) {
      return this.acceptQuote(id);
    }

    const quote = await Quote.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('deal');

    if (!quote) {
      throw ApiError.notFound('Quote not found.');
    }

    return quote;
  }

  /**
   * Accept Quote -> Mark Deal WON -> Upgrade Contact to CUSTOMER -> Log Activity
   */
  static async acceptQuote(quoteId: string) {
    const quote = await Quote.findById(quoteId).populate<{ deal: any }>('deal');

    if (!quote) {
      throw ApiError.notFound('Quote not found.');
    }

    // 1. Update Quote status
    quote.status = QuoteStatus.ACCEPTED;
    await quote.save();

    // 2. Mark Deal as WON
    const deal = await Deal.findById(quote.dealId);
    if (deal) {
      deal.stage = DealStage.WON;
      await deal.save();
    }

    // 3. Upgrade Contact to CUSTOMER if attached
    let updatedContact = null;
    if (deal?.contactId) {
      updatedContact = await Contact.findByIdAndUpdate(
        deal.contactId,
        { lifecycleStage: LifecycleStage.CUSTOMER },
        { new: true }
      );
    }

    // 4. Log Activity touchpoint
    const contact = deal?.contactId ? await Contact.findById(deal.contactId) : null;
    const contactName = contact?.name || 'Contact';
    await Activity.create({
      type: ActivityType.NOTE,
      summary: `Quote accepted ($${quote.amount.toLocaleString()})! Deal "${deal?.title || ''}" WON -> ${contactName} promoted to Customer.`,
      contactId: deal?.contactId || null,
      dealId: quote.dealId,
      timestamp: new Date()
    });

    return {
      quote,
      deal,
      contact: updatedContact
    };
  }

  static async delete(id: string) {
    const quote = await Quote.findByIdAndDelete(id);
    if (!quote) {
      throw ApiError.notFound('Quote not found.');
    }

    return quote;
  }
}
