import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must not exceed 100 characters'),
    description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().max(500).optional(),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'member']).default('member'),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(['admin', 'member']),
  }),
});

export const transferOwnershipSchema = z.object({
  body: z.object({
    newOwnerId: z.string().uuid('Invalid user id'),
  }),
});