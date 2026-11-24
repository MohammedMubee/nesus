import { z } from 'zod';

export const createActivitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE']),
  summary: z.string().min(2, 'Summary is required'),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  timestamp: z.string().optional()
});

