// =====================================================
// DATABASE TYPES
// =====================================================

export type UserRole = 'admin' | 'worker'

export type ProjectPhase = 'rough' | 'final' | 'punch' | 'turnover'

export type ProjectStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export type AssignmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'no_show'

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string | null
  sq_footage: number | null
  phase: ProjectPhase
  status: ProjectStatus
  gc_name: string | null
  gc_email: string | null
  gc_phone: string | null
  gate_code: string | null
  site_notes: string | null
  estimated_hours: number | null
  actual_hours: number | null
  price: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  project_id: string
  worker_id: string
  scheduled_date: string
  start_time: string | null
  end_time: string | null
  status: AssignmentStatus
  check_in_time: string | null
  check_out_time: string | null
  notes: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  // Joined data
  project?: Project
  worker?: Profile
}

export interface Lead {
  id: string
  project_name: string
  sq_footage: number | null
  phase: ProjectPhase
  estimated_start_date: string | null
  gc_email: string
  gc_name: string | null
  gc_phone: string | null
  company_name: string | null
  address: string | null
  message: string | null
  source: string
  status: LeadStatus
  converted_project_id: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// FORM TYPES
// =====================================================

export interface LeadFormData {
  project_name: string
  sq_footage: number | null
  phase: ProjectPhase
  estimated_start: Date | null
  gc_email: string
  gc_name?: string
  gc_phone?: string
  message?: string
}

export interface ProjectFormData {
  name: string
  address: string
  city: string
  state: string
  zip_code?: string
  sq_footage?: number
  phase: ProjectPhase
  gc_name?: string
  gc_email?: string
  gc_phone?: string
  gate_code?: string
  site_notes?: string
  estimated_hours?: number
  price?: number
}

export interface AssignmentFormData {
  project_id: string
  worker_id: string
  scheduled_date: Date
  start_time?: string
  end_time?: string
  notes?: string
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// =====================================================
// CALENDAR TYPES
// =====================================================

export interface CalendarAssignment {
  assignment_id: string
  project_id: string
  project_name: string
  worker_id: string
  worker_name: string
  scheduled_date: string
  status: AssignmentStatus
}

export interface TodayAssignment {
  assignment_id: string
  project_name: string
  address: string
  city: string
  gate_code: string | null
  phase: ProjectPhase
  start_time: string | null
  status: AssignmentStatus
}

// =====================================================
// SUPABASE DATABASE TYPES (for type safety)
// =====================================================

// Re-export the proper Database type from database.ts
export type { Database } from './database'
