import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30).optional(),
    fullName: z.string().max(100).optional(),
    email: z.string().email('Invalid email format').optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
    phone: z.string().max(20).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Need an uppercase letter')
      .regex(/[a-z]/, 'Need a lowercase letter')
      .regex(/[0-9]/, 'Need a digit')
      .regex(/[!@#$%^&*]/, 'Need a special character'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Password is required to delete account'),
    confirmation: z.literal('DELETE', {
      errorMap: () => ({ message: 'Type DELETE to confirm' }),
    }),
  }),
});