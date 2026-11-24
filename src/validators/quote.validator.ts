import { z } from 'zod';

const normalizeEnum = (validEnums: string[]) =>
  z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    return val.trim().replace(/\s+/g, '_').toUpperCase();
  }, z.enum(validEnums as [string, ...string[]]));

export const createQuoteSchema = z.object({
  dealId: z.string().min(1, 'dealId is required'),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  status: normalizeEnum(['DRAFT', 'SENT', 'ACCEPTED']).optional()
});

export const updateQuoteStatusSchema = z.object({
  status: normalizeEnum(['DRAFT', 'SENT', 'ACCEPTED'])
});
