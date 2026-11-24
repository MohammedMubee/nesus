import { z } from 'zod';

const normalizeEnum = (validEnums: string[]) =>
  z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    return val.trim().replace(/\s+/g, '_').toUpperCase();
  }, z.enum(validEnums as [string, ...string[]]));

const sanitizeId = z.preprocess((val) => {
  if (typeof val !== 'string' || val.trim() === '' || val === 'null' || val === 'undefined') {
    return undefined;
  }
  return val.trim();
}, z.string().optional());

export const createTicketSchema = z.object({
  subject: z.string().min(2, 'Subject is required'),
  priority: normalizeEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: normalizeEnum(['OPEN', 'CLOSED']).optional(),
  contactId: sanitizeId
});

export const updateTicketSchema = createTicketSchema.partial();
