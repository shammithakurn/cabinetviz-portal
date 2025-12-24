// lib/validations.ts
// Zod validation schemas for forms and API requests

import { z } from 'zod'

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  company: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// ============================================
// JOB SCHEMAS
// ============================================

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().nullable().transform(v => v || undefined),
  projectType: z.enum([
    'KITCHEN',
    'WARDROBE',
    'BATHROOM_VANITY',
    'ENTERTAINMENT_UNIT',
    'HOME_OFFICE',
    'LAUNDRY',
    'CUSTOM',
  ]),
  roomType: z.string().optional().nullable().transform(v => {
    if (!v || v === '') return undefined
    return v as 'L_SHAPED' | 'U_SHAPED' | 'GALLEY' | 'SINGLE_WALL' | 'ISLAND' | 'WALK_IN' | 'REACH_IN' | 'CUSTOM'
  }),

  // Dimensions - allow null values from form
  roomWidth: z.number().positive().optional().nullable().transform(v => v ?? undefined),
  roomLength: z.number().positive().optional().nullable().transform(v => v ?? undefined),
  roomHeight: z.number().positive().optional().nullable().transform(v => v ?? undefined),
  dimensionUnit: z.enum(['mm', 'cm', 'm', 'inches', 'feet']).default('mm'),

  // Style - allow empty strings and null
  cabinetStyle: z.string().optional().nullable().transform(v => v || undefined),
  materialType: z.string().optional().nullable().transform(v => v || undefined),
  colorScheme: z.string().optional().nullable().transform(v => v || undefined),
  handleStyle: z.string().optional().nullable().transform(v => v || undefined),

  // Other
  budget: z.number().positive().optional().nullable().transform(v => v ?? undefined),
  deadline: z.string().optional().nullable().transform(v => v || undefined),
  notes: z.string().optional().nullable().transform(v => v || undefined),
  package: z.enum(['BASIC', 'PROFESSIONAL', 'PARTNER']).default('PROFESSIONAL'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
})

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum([
    'PENDING',
    'QUOTED',
    'IN_PROGRESS',
    'REVIEW',
    'REVISION',
    'COMPLETED',
    'CANCELLED',
  ]).optional(),
  progress: z.number().min(0).max(100).optional(),
  quotedPrice: z.number().positive().optional(),
})

// ============================================
// COMMENT SCHEMA
// ============================================

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  isInternal: z.boolean().default(false),
})

// ============================================
// FILE UPLOAD SCHEMA
// ============================================

export const fileUploadSchema = z.object({
  jobId: z.string().cuid(),
  category: z.enum([
    'MEASUREMENT',
    'SKETCH',
    'REFERENCE',
    'PHOTO',
    'FLOOR_PLAN',
    'RENDER_3D',
    'DRAWING_2D',
    'CUT_LIST',
    'OTHER',
  ]),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
