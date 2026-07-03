import { z } from 'zod';

export const createProjectSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  deploymentUrl: z.string().url('Project Deploy Link must be a valid URL'),
  testingTeamMembers: z.array(z.number()).min(1, 'At least one Testing Team Member should be assigned'),
  developerTeamMembers: z.array(z.number()).min(1, 'At least one Developer Team Member should be assigned'),
});

export const updateProjectSchema = z.object({
  projectName: z.string().min(3).optional(),
  description: z.string().optional(),
  deploymentUrl: z.string().url('Project Deploy Link must be a valid URL').optional(),
  status: z.string().optional(),
  testingTeamMembers: z.array(z.number()).min(1, 'At least one Testing Team Member should be assigned').optional(),
  developerTeamMembers: z.array(z.number()).min(1, 'At least one Developer Team Member should be assigned').optional(),
});

export const assignUserSchema = z.object({
  userId: z.number().int().positive(),
  roleInProject: z.enum(['TESTER', 'DEVELOPER']),
});