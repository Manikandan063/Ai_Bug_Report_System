import { z } from 'zod';

export const createBugReportSchema = z.object({
  projectId: z.number().int().positive(),
  moduleName: z.string().min(1, 'Module Name is required'),
  bugDescription: z.string().min(1, 'Bug Description is required'),
  testDescription: z.string(),
  actualResult: z.string(),
  expectedResult: z.string(),
  severity: z.enum(['High', 'Medium', 'Low']),
});

export const updateBugReportSchema = z.object({
  status: z.string().optional(),
  remarks: z.string().optional(),
});