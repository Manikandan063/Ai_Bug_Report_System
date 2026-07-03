import { z } from 'zod';

export const generateBugReportSchema = z.object({
  bugDescription: z.string().min(1, 'Bug description is required'),
});