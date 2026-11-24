import { z } from 'zod';

const sanitizeId = z.preprocess((val) => {
  if (typeof val !== 'string' || val.trim() === '' || val === 'null' || val === 'undefined') {
    return undefined;
  }
  return val.trim();
}, z.string().optional());

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  dueDate: z.string().optional(),
  contactId: sanitizeId,
  dealId: sanitizeId,
  done: z.boolean().optional()
});

export const updateTaskSchema = createTaskSchema.partial();
