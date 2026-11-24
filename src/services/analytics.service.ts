import { Lead, Contact, Company, Deal, Ticket, Task } from '../models/index.js';
import { DealStage, TicketStatus } from '../types/index.js';

export class AnalyticsService {
  static async getOverview() {
    const [
      leadsCount,
      contactsCount,
      companiesCount,
      deals,
      ticketsCount,
      openTicketsCount,
      tasksDueCount,
      leads
    ] = await Promise.all([
      Lead.countDocuments(),
      Contact.countDocuments(),
      Company.countDocuments(),
      Deal.find({}, { value: 1, stage: 1 }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: TicketStatus.OPEN }),
      Task.countDocuments({ done: false }),
      Lead.find({}, { source: 1, status: 1 })
    ]);

    // Calculate pipeline value and won revenue
    let totalPipelineValue = 0;
    let totalRevenueWon = 0;
    const stageBreakdown: Record<string, { count: number; totalValue: number }> = {
      NEW: { count: 0, totalValue: 0 },
      PROPOSAL: { count: 0, totalValue: 0 },
      NEGOTIATION: { count: 0, totalValue: 0 },
      WON: { count: 0, totalValue: 0 },
      LOST: { count: 0, totalValue: 0 }
    };

    for (const deal of deals) {
      if (deal.stage === DealStage.WON) {
        totalRevenueWon += deal.value;
      }
      if (deal.stage !== DealStage.LOST) {
        totalPipelineValue += deal.value;
      }

      if (stageBreakdown[deal.stage]) {
        stageBreakdown[deal.stage].count += 1;
        stageBreakdown[deal.stage].totalValue += deal.value;
      }
    }

    // Lead source distribution
    const sourceBreakdown: Record<string, number> = {};
    for (const lead of leads) {
      const src = lead.source || 'Other';
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    }

    return {
      metrics: {
        totalPipelineValue,
        totalRevenueWon,
        activeDealsCount: deals.filter((d) => d.stage !== DealStage.LOST && d.stage !== DealStage.WON).length,
        leadsCount,
        contactsCount,
        companiesCount,
        openTicketsCount,
        totalTicketsCount: ticketsCount,
        tasksDueCount
      },
      stageBreakdown,
      sourceBreakdown
    };
  }
}
