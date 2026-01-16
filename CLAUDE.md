# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Garden State Cleaning is a construction cleaning business management platform built for a cleaning company run by a former construction superintendent. The app manages projects, workers, assignments, and lead generation for post-construction cleaning services (rough, final, punch, turnover).

**Tech Stack:**
- Next.js 14 App Router (React 18)
- Supabase (PostgreSQL + Auth + RLS)
- TypeScript
- Tailwind CSS + Framer Motion
- React Hook Form + Zod validation
- Resend (optional email notifications)

## Development Commands

```bash
npm run dev       # Start dev server on localhost:3000
npm run build     # Production build (verifies TypeScript)
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Architecture

### Database & Authentication

**Supabase Backend:**
- PostgreSQL with Row Level Security (RLS)
- Schema: `supabase/schema.sql` (single source of truth)
- Four main tables: `profiles`, `projects`, `assignments`, `leads`
- TypeScript types: `types/database.ts` (generated from schema)

**Key Database Concepts:**
- `profiles.role`: `'admin'` or `'worker'` - determines access level
- `projects.phase`: `'rough' | 'final' | 'punch' | 'turnover'` - cleaning phases
- `assignments`: links workers to projects with scheduled dates
- `leads`: inbound requests from website (converts to projects)

**RLS Policies:**
- Admins have full access to all tables
- Workers can only view their own assignments and assigned projects
- Anonymous users can INSERT into `leads` (for website forms)
- Important: RLS is DISABLED on `leads` table for public form submissions

**Database Changes:**
- Always update `supabase/schema.sql` first
- Run SQL in Supabase dashboard to apply changes
- Manually update `types/database.ts` if schema changes

### Supabase Client Architecture

**Two Client Patterns:**
1. **Browser Client** (`lib/supabase/client.ts`): For client components
2. **Server Client** (`lib/supabase/server.ts`): For server components/actions

**Important:** Database generic typing was removed to avoid TypeScript inference issues. Clients are untyped at runtime but work correctly.

**Server Helpers in `lib/supabase/server.ts`:**
```typescript
createServerSupabaseClient()  // Standard server client (async, uses cookies)
createServiceClient()          // Admin client (bypasses RLS)
getSession()                   // Get current session
getCurrentUser()               // Get user + profile
getUserRole()                  // Get user role ('admin' | 'worker')
```

### Authentication & Route Protection

**Middleware** (`middleware.ts`) enforces role-based access:
- **Public:** `/` (landing page), `/login`, `/signup`
- **Admin only:** `/admin/*` routes
- **Worker only:** `/portal/*` routes
- Admins accessing `/portal` → redirect to `/admin`
- Workers accessing `/admin` → redirect to `/portal`
- Unauthenticated → redirect to `/login?redirect={pathname}`

**Auth Flow:**
1. User signs up/logs in via Supabase Auth
2. Profile auto-created in `profiles` table (trigger: `handle_new_user()`)
3. Middleware checks `profiles.role` for route access
4. Admin/worker dashboard rendered based on role

### App Structure

**Route Organization:**
```
app/
├── page.tsx                    # Public landing page (marketing)
├── (auth)/
│   ├── login/page.tsx         # Login form
│   └── signup/page.tsx        # Signup form
├── admin/                      # Admin dashboard (GCs/management)
│   ├── page.tsx               # Calendar + add assignments
│   ├── leads/page.tsx         # Manage incoming leads
│   ├── projects/page.tsx      # Manage projects
│   ├── workers/page.tsx       # Manage worker profiles
│   └── settings/page.tsx      # Admin profile settings
└── portal/                     # Worker dashboard
    ├── page.tsx               # Today's assignments
    ├── schedule/page.tsx      # Worker's calendar
    └── profile/page.tsx       # Worker profile settings
```

**Component Organization:**
```
components/
├── forms/
│   └── lead-form.tsx          # Lead submission form (used on landing page)
├── landing/
│   └── bid-modal.tsx          # Quick bid request modal
└── ui/                         # Radix UI components (shadcn/ui pattern)
```

### Form Handling Pattern

**All forms use React Hook Form + Zod:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  field: z.string().min(1, "Error message")
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

**Server Actions Pattern:**
- Located in `actions/` directory
- Always `'use server'` directive
- Return `ActionResponse<T>` type from `types/index.ts`
- Example: `actions/submit-lead.ts`

### Critical Database Naming Conventions

**Column names use snake_case** (PostgreSQL standard):
```typescript
// Correct:
project_name, sq_footage, gc_email, scheduled_date

// Incorrect (will cause errors):
projectName, sqFootage, gcEmail, scheduledDate
```

**When fixing database mismatches:**
1. Check `supabase/schema.sql` for actual column names
2. Update code to match schema (not vice versa)
3. Common issues: `assigned_date` vs `scheduled_date`, phase enums

### Environment Variables

Required for development (see `.env.example`):
```bash
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=       # Service role key (admin operations)
RESEND_API_KEY=                  # Optional (for email notifications)
NEXT_PUBLIC_APP_URL=             # App URL (localhost:3000 in dev)
ADMIN_EMAIL=                     # Admin email for notifications
```

### Known TypeScript Issues

**Supabase Type Inference:**
- The `Database` type from `types/database.ts` requires a `Relationships` key for each table
- Supabase queries may show `never` types - this is a TypeScript inference issue, not a runtime error
- Workaround: Database generic was removed from client creation to avoid build failures
- The app works correctly at runtime despite TypeScript warnings

**Nullable Phase Fields:**
- `phase` fields are nullable in the database but non-nullable in forms
- Use `value={formData.phase ?? undefined}` for Select components to satisfy TypeScript

### Lead Generation Flow

**Public Form → Database:**
1. User fills form on landing page (`app/page.tsx` or bid modal)
2. Form submits to `actions/submit-lead.ts` server action
3. Lead saved to `leads` table with `status: 'new'`
4. Optional: Email notification sent via Resend (can be disabled)
5. Admin reviews in `/admin/leads` and converts to project

**Lead Status Flow:**
`new` → `contacted` → `quoted` → `won` | `lost`

### UI Components (shadcn/ui Pattern)

All UI components in `components/ui/` follow shadcn/ui conventions:
- Radix UI primitives + Tailwind styling
- `cn()` utility for conditional classes
- Components accept `error` prop for validation states (custom addition)

**Custom Styling:**
- Uses custom Tailwind classes: `card-industrial`, `text-gradient-orange`, `safety` color
- Tailwind config includes custom animations and utilities

## Common Issues & Solutions

**Build Error: "new row violates row-level security policy"**
- Check RLS policies in Supabase dashboard
- Ensure authenticated users can INSERT/UPDATE the table
- For public forms (leads), RLS must be disabled or have public INSERT policy

**Database Column Errors:**
- Always verify column names in `supabase/schema.sql`
- Use snake_case, not camelCase
- Check phase/status enums match exactly: `'rough' | 'final' | 'punch' | 'turnover'`

**Type Errors on Supabase Queries:**
- Remove Database generic from client if seeing `never` types
- Use type assertions (`as any` or explicit types) for insert/update operations
- The app works at runtime even with TypeScript warnings

**useSearchParams() Errors:**
- Must wrap components using `useSearchParams()` in `<Suspense>` boundary
- Next.js App Router requirement for static generation

## Deployment

**Vercel + Supabase:**
1. Push code to GitHub
2. Import repo in Vercel
3. Add all environment variables from `.env.example`
4. Deploy (Next.js auto-detected)
5. Apply database schema in Supabase SQL editor

**Pre-deployment Checklist:**
- `.env.local` is gitignored ✓
- Build passes: `npm run build`
- Database schema applied in Supabase
- RLS policies configured correctly
- Email notifications disabled or Resend API key configured
