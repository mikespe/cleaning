import { z } from 'zod'

/**
 * Lead form validation schema
 */
export const leadFormSchema = z.object({
  project_name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be less than 100 characters'),
  sq_footage: z
    .number()
    .min(100, 'Square footage must be at least 100')
    .max(10000000, 'Square footage seems too large')
    .nullable()
    .optional(),
  phase: z.enum(['rough', 'final', 'punch', 'turnover'], {
    required_error: 'Please select a cleaning phase',
  }),
  estimated_start: z.date().nullable().optional(),
  gc_email: z.string().email('Please enter a valid email address'),
  gc_name: z.string().max(100).optional(),
  gc_phone: z
    .string()
    .regex(/^[\d\s\-\(\)\+]*$/, 'Please enter a valid phone number')
    .optional(),
  message: z.string().max(1000, 'Message must be less than 1000 characters').optional(),
})

export type LeadFormSchema = z.infer<typeof leadFormSchema>

// Alias for backwards compatibility with components
export const leadSchema = leadFormSchema
export type LeadFormData = LeadFormSchema

/**
 * Project form validation schema
 */
export const projectFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be less than 100 characters'),
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'Please enter a city'),
  state: z.string().length(2, 'Please use 2-letter state code'),
  zip_code: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code')
    .optional(),
  sq_footage: z.number().min(100).max(10000000).optional(),
  phase: z.enum(['rough', 'final', 'punch', 'turnover']),
  gc_name: z.string().max(100).optional(),
  gc_email: z.string().email().optional().or(z.literal('')),
  gc_phone: z
    .string()
    .regex(/^[\d\s\-\(\)\+]*$/)
    .optional(),
  gate_code: z.string().max(50).optional(),
  site_notes: z.string().max(2000).optional(),
  estimated_hours: z.number().min(0.5).max(1000).optional(),
  price: z.number().min(0).max(10000000).optional(),
})

export type ProjectFormSchema = z.infer<typeof projectFormSchema>

/**
 * Assignment form validation schema
 */
export const assignmentFormSchema = z.object({
  project_id: z.string().uuid('Please select a project'),
  worker_id: z.string().uuid('Please select a worker'),
  scheduled_date: z.date({
    required_error: 'Please select a date',
  }),
  start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format')
    .optional(),
  end_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format')
    .optional(),
  notes: z.string().max(500).optional(),
})

export type AssignmentFormSchema = z.infer<typeof assignmentFormSchema>

/**
 * Login form validation schema
 */
export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormSchema = z.infer<typeof loginFormSchema>

/**
 * Signup form validation schema
 */
export const signupFormSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    full_name: z.string().min(2, 'Please enter your full name'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignupFormSchema = z.infer<typeof signupFormSchema>
