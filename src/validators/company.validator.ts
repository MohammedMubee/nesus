import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url('Must be a valid URL').or(z.string().length(0)).optional()
});

export const updateCompanySchema = createCompanySchema.partial();

