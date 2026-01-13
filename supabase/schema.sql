-- =====================================================
-- GARDEN STATE CLEANING - DATABASE SCHEMA
-- Supabase PostgreSQL with Row Level Security
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- Extended user data linked to Supabase Auth
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('admin', 'worker')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast role lookups
CREATE INDEX idx_profiles_role ON profiles(role);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PROJECTS TABLE
-- Construction cleaning jobs/sites
-- =====================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Newark',
    state TEXT NOT NULL DEFAULT 'NJ',
    zip_code TEXT,
    sq_footage INTEGER,
    phase TEXT CHECK (phase IN ('rough', 'final', 'punch', 'turnover')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    gc_name TEXT, -- General Contractor
    gc_email TEXT,
    gc_phone TEXT,
    gate_code TEXT,
    site_notes TEXT,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    price DECIMAL(10,2),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_phase ON projects(phase);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ASSIGNMENTS TABLE
-- Worker <-> Project scheduling
-- =====================================================
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'no_show')),
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent double-booking same worker on same date/project
    UNIQUE(project_id, worker_id, scheduled_date)
);

-- Indexes for calendar views and worker lookups
CREATE INDEX idx_assignments_date ON assignments(scheduled_date);
CREATE INDEX idx_assignments_worker ON assignments(worker_id);
CREATE INDEX idx_assignments_project ON assignments(project_id);
CREATE INDEX idx_assignments_status ON assignments(status);

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- LEADS TABLE
-- Inbound inquiries from landing page
-- =====================================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name TEXT NOT NULL,
    sq_footage INTEGER,
    phase TEXT CHECK (phase IN ('rough', 'final', 'punch', 'touchup')),
    estimated_start_date DATE,
    gc_name TEXT,
    gc_email TEXT NOT NULL,
    gc_phone TEXT,
    company_name TEXT,
    address TEXT,
    message TEXT,
    source TEXT DEFAULT 'website',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
    converted_project_id UUID REFERENCES projects(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (auth.user_role() = 'admin');

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (auth.user_role() = 'admin');

-- Allow profile creation during signup
CREATE POLICY "Enable insert for authenticated users only"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- PROJECTS POLICIES
-- =====================================================

-- Admins have full access to projects
CREATE POLICY "Admins have full access to projects"
    ON projects FOR ALL
    USING (auth.user_role() = 'admin');

-- Workers can view projects they're assigned to
CREATE POLICY "Workers can view assigned projects"
    ON projects FOR SELECT
    USING (
        auth.user_role() = 'worker' AND
        EXISTS (
            SELECT 1 FROM assignments
            WHERE assignments.project_id = projects.id
            AND assignments.worker_id = auth.uid()
        )
    );

-- =====================================================
-- ASSIGNMENTS POLICIES
-- =====================================================

-- Admins have full access to assignments
CREATE POLICY "Admins have full access to assignments"
    ON assignments FOR ALL
    USING (auth.user_role() = 'admin');

-- Workers can view their own assignments
CREATE POLICY "Workers can view own assignments"
    ON assignments FOR SELECT
    USING (worker_id = auth.uid());

-- Workers can update their own assignments (for check-in/out)
CREATE POLICY "Workers can update own assignments"
    ON assignments FOR UPDATE
    USING (worker_id = auth.uid())
    WITH CHECK (worker_id = auth.uid());

-- =====================================================
-- LEADS POLICIES
-- =====================================================

-- Only admins can access leads
CREATE POLICY "Only admins can view leads"
    ON leads FOR SELECT
    USING (auth.user_role() = 'admin');

CREATE POLICY "Only admins can insert leads"
    ON leads FOR INSERT
    WITH CHECK (true); -- Allow anonymous inserts from landing page

CREATE POLICY "Only admins can update leads"
    ON leads FOR UPDATE
    USING (auth.user_role() = 'admin');

CREATE POLICY "Only admins can delete leads"
    ON leads FOR DELETE
    USING (auth.user_role() = 'admin');

-- =====================================================
-- FUNCTIONS FOR DASHBOARD VIEWS
-- =====================================================

-- Get today's assignments for a worker
CREATE OR REPLACE FUNCTION get_todays_assignments(worker_uuid UUID)
RETURNS TABLE (
    assignment_id UUID,
    project_name TEXT,
    address TEXT,
    city TEXT,
    gate_code TEXT,
    phase TEXT,
    start_time TIME,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        p.name,
        p.address,
        p.city,
        p.gate_code,
        p.phase,
        a.start_time,
        a.status
    FROM assignments a
    JOIN projects p ON a.project_id = p.id
    WHERE a.worker_id = worker_uuid
    AND a.scheduled_date = CURRENT_DATE
    ORDER BY a.start_time ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get assignment calendar data for admin
CREATE OR REPLACE FUNCTION get_calendar_assignments(start_date DATE, end_date DATE)
RETURNS TABLE (
    assignment_id UUID,
    project_id UUID,
    project_name TEXT,
    worker_id UUID,
    worker_name TEXT,
    scheduled_date DATE,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        p.id,
        p.name,
        pr.id,
        pr.full_name,
        a.scheduled_date,
        a.status
    FROM assignments a
    JOIN projects p ON a.project_id = p.id
    JOIN profiles pr ON a.worker_id = pr.id
    WHERE a.scheduled_date BETWEEN start_date AND end_date
    ORDER BY a.scheduled_date, a.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'worker')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
