import { Lead, Company, Contact, Activity } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ActivityType, LeadStatus, LifecycleStage } from '../types/index.js';

export class LeadService {
  static async getAll() {
    return Lead.find().sort({ createdAt: -1 });
  }

  static async getById(id: string) {
    const lead = await Lead.findById(id);
    if (!lead) {
      throw ApiError.notFound('Lead not found.');
    }
    return lead;
  }

  static async create(data: {
    name: string;
    email: string;
    source?: string;
    status?: LeadStatus;
    title?: string;
    companyName?: string;
  }) {
    return Lead.create(data);
  }

  static async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      source?: string;
      status?: LeadStatus;
      title?: string;
      companyName?: string;
    }
  ) {
    const lead = await Lead.findByIdAndUpdate(id, data, { new: true });
    if (!lead) {
      throw ApiError.notFound('Lead not found.');
    }

    return lead;
  }

  static async delete(id: string) {
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      throw ApiError.notFound('Lead not found.');
    }

    return lead;
  }

  /**
   * Convert Lead to Company + Contact + Activity
   */
  static async convertLead(leadId: string) {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw ApiError.notFound('Lead not found.');
    }

    if (lead.convertedAt) {
      throw ApiError.badRequest('This lead has already been converted.');
    }

    // 1. Link or create Company
    const targetCompanyName = lead.companyName?.trim() || `${lead.name} Corp`;
    const escapedName = targetCompanyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let company = await Company.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
    });

    if (!company) {
      company = await Company.create({
        name: targetCompanyName,
        industry: 'Enterprise Software',
        website: `https://${targetCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      });
    }

    // 2. Create Contact with Sales Qualified stage
    const contact = await Contact.create({
      name: lead.name,
      title: lead.title || 'Director',
      email: lead.email,
      phone: '+1 (555) 019-2834',
      department: 'Commercial & Sales',
      lifecycleStage: LifecycleStage.SALES_QUALIFIED,
      companyId: company._id
    });

    // 3. Mark Lead as Qualified and Converted
    lead.status = LeadStatus.QUALIFIED;
    lead.convertedAt = new Date();
    lead.convertedContactId = contact._id;
    await lead.save();

    // 4. Log Activity Touchpoint
    const activity = await Activity.create({
      type: ActivityType.NOTE,
      summary: `Lead converted: ${lead.name} (${company.name}) promoted to Sales Qualified contact.`,
      contactId: contact._id,
      timestamp: new Date()
    });

    return {
      lead,
      company,
      contact,
      activity
    };
  }
}
