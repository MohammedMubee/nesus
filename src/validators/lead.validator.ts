import { z } from 'zod';

const normalizeEnum = (validEnums: string[]) =>
  z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    return val.trim().replace(/\s+/g, '_').toUpperCase();
  }, z.enum(validEnums as [string, ...string[]]));

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Lead name is required'),
  email: z.string().email('Invalid email address'),
  source: z.string().optional(),
  status: normalizeEnum(['NEW', 'QUALIFIED', 'DISQUALIFIED']).optional(),
  title: z.string().optional(),
  companyName: z.string().optional()
});

export const updateLeadSchema = createLeadSchema.partial();
