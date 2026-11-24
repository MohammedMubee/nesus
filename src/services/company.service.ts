import { Company, Contact, Deal } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

export class CompanyService {
  static async getAll() {
    const companies = await Company.find().sort({ createdAt: -1 });
    const [contactCounts, dealCounts] = await Promise.all([
      Contact.aggregate([
        { $match: { companyId: { $ne: null } } },
        { $group: { _id: '$companyId', count: { $sum: 1 } } }
      ]),
      Deal.aggregate([
        { $match: { companyId: { $ne: null } } },
        { $group: { _id: '$companyId', count: { $sum: 1 } } }
      ])
    ]);

    const contactMap = new Map(contactCounts.map((c) => [c._id.toString(), c.count]));
    const dealMap = new Map(dealCounts.map((d) => [d._id.toString(), d.count]));

    return companies.map((comp) => {
      const json = comp.toJSON();
      return {
        ...json,
        _count: {
          contacts: contactMap.get(comp._id.toString()) || 0,
          deals: dealMap.get(comp._id.toString()) || 0
        }
      };
    });
  }

  static async getById(id: string) {
    const company = await Company.findById(id);
    if (!company) {
      throw ApiError.notFound('Company not found.');
    }

    const [contacts, deals] = await Promise.all([
      Contact.find({ companyId: id }),
      Deal.find({ companyId: id }).populate('quotes')
    ]);

    return {
      ...company.toJSON(),
      contacts,
      deals
    };
  }

  static async create(data: { name: string; industry?: string; website?: string }) {
    return Company.create(data);
  }

  static async update(id: string, data: { name?: string; industry?: string; website?: string }) {
    const company = await Company.findByIdAndUpdate(id, data, { new: true });
    if (!company) {
      throw ApiError.notFound('Company not found.');
    }

    return company;
  }

  static async delete(id: string) {
    const company = await Company.findByIdAndDelete(id);
    if (!company) {
      throw ApiError.notFound('Company not found.');
    }

    return company;
  }
}
