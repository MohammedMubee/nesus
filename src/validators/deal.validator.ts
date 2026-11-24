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

export const createDealSchema = z.object({
  title: z.string().min(2, 'Deal title is required'),
  value: z.coerce.number().min(0, 'Value must be positive'),
  stage: normalizeEnum(['NEW', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).optional(),
  contactId: sanitizeId,
  companyId: sanitizeId,
  expectedCloseDate: z.string().optional()
});

export const updateDealSchema = createDealSchema.partial();

export const updateDealStageSchema = z.object({
  stage: normalizeEnum(['NEW', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'])
});
