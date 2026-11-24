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

export const createContactSchema = z.object({
  name: z.string().min(2, 'Contact name is required'),
  title: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().optional(),
  lifecycleStage: normalizeEnum(['LEAD', 'SALES_QUALIFIED', 'CHAMPION', 'CUSTOMER']).optional(),
  companyId: sanitizeId
});

export const updateContactSchema = createContactSchema.partial();

export const updateLifecycleSchema = z.object({
  lifecycleStage: normalizeEnum(['LEAD', 'SALES_QUALIFIED', 'CHAMPION', 'CUSTOMER'])
});
