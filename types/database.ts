export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: "admin" | "worker";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "admin" | "worker";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "admin" | "worker";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          state: string;
          zip_code: string | null;
          sq_footage: number | null;
          phase: "rough" | "final" | "punch" | "turnover" | null;
          status: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
          gc_name: string | null;
          gc_email: string | null;
          gc_phone: string | null;
          gate_code: string | null;
          site_notes: string | null;
          estimated_hours: number | null;
          actual_hours: number | null;
          price: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city?: string;
          state?: string;
          zip_code?: string | null;
          sq_footage?: number | null;
          phase?: "rough" | "final" | "punch" | "turnover" | null;
          status?: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
          gc_name?: string | null;
          gc_email?: string | null;
          gc_phone?: string | null;
          gate_code?: string | null;
          site_notes?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          price?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string | null;
          sq_footage?: number | null;
          phase?: "rough" | "final" | "punch" | "turnover" | null;
          status?: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
          gc_name?: string | null;
          gc_email?: string | null;
          gc_phone?: string | null;
          gate_code?: string | null;
          site_notes?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          price?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          project_id: string;
          worker_id: string;
          scheduled_date: string;
          start_time: string | null;
          end_time: string | null;
          status: "scheduled" | "in_progress" | "completed" | "no_show";
          check_in_time: string | null;
          check_out_time: string | null;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          worker_id: string;
          scheduled_date: string;
          start_time?: string | null;
          end_time?: string | null;
          status?: "scheduled" | "in_progress" | "completed" | "no_show";
          check_in_time?: string | null;
          check_out_time?: string | null;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          worker_id?: string;
          scheduled_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          status?: "scheduled" | "in_progress" | "completed" | "no_show";
          check_in_time?: string | null;
          check_out_time?: string | null;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          project_name: string;
          sq_footage: number | null;
          phase: "rough" | "final" | "punch" | "turnover" | null;
          estimated_start_date: string | null;
          gc_name: string | null;
          gc_email: string;
          gc_phone: string | null;
          company_name: string | null;
          address: string | null;
          message: string | null;
          source: string;
          status: "new" | "contacted" | "quoted" | "won" | "lost";
          converted_project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_name: string;
          sq_footage?: number | null;
          phase?: "rough" | "final" | "punch" | "turnover" | null;
          estimated_start_date?: string | null;
          gc_name?: string | null;
          gc_email: string;
          gc_phone?: string | null;
          company_name?: string | null;
          address?: string | null;
          message?: string | null;
          source?: string;
          status?: "new" | "contacted" | "quoted" | "won" | "lost";
          converted_project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_name?: string;
          sq_footage?: number | null;
          phase?: "rough" | "final" | "punch" | "turnover" | null;
          estimated_start_date?: string | null;
          gc_name?: string | null;
          gc_email?: string;
          gc_phone?: string | null;
          company_name?: string | null;
          address?: string | null;
          message?: string | null;
          source?: string;
          status?: "new" | "contacted" | "quoted" | "won" | "lost";
          converted_project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];

export type ProjectWithAssignments = Project & {
  assignments: (Assignment & { worker: Profile })[];
};

export type AssignmentWithProject = Assignment & {
  project: Project;
};
