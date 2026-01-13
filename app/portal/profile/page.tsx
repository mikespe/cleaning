"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle2,
  Loader2,
  Edit,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

type Stats = {
  totalJobs: number;
  completedJobs: number;
  thisMonth: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ totalJobs: 0, completedJobs: 0, thisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
      });
    }
    setIsLoading(false);
  };

  const fetchStats = async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Total and completed jobs
    const { data: allJobs } = await supabase
      .from("assignments")
      .select("id, status")
      .eq("worker_id", user.id);

    // This month's jobs
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthJobs } = await supabase
      .from("assignments")
      .select("id")
      .eq("worker_id", user.id)
      .gte("scheduled_date", startOfMonth.toISOString().split("T")[0]);

    setStats({
      totalJobs: allJobs?.length || 0,
      completedJobs: allJobs?.filter((j) => j.status === "completed").length || 0,
      thisMonth: monthJobs?.length || 0,
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
      })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-4 text-sm text-slate-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.1),transparent_50%)]" />

        <div className="relative p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-600/20 text-3xl font-bold text-orange-500">
              {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "W"}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-100">
                {profile?.full_name || "Worker"}
              </h1>
              <p className="text-sm text-slate-400">{profile?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-600/20 px-3 py-1 text-xs font-medium text-orange-500">
                  <Shield className="h-3 w-3" />
                  {profile?.role === "admin" ? "Administrator" : "Team Member"}
                </span>
              </div>
            </div>

            {!isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Jobs", value: stats.totalJobs, icon: Calendar },
          { label: "Completed", value: stats.completedJobs, icon: CheckCircle2 },
          { label: "This Month", value: stats.thisMonth, icon: Calendar },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center"
          >
            <stat.icon className="mx-auto mb-2 h-5 w-5 text-slate-500" />
            <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Profile Details / Edit Form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">
          {isEditing ? "Edit Profile" : "Profile Details"}
        </h2>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Full Name
            </Label>
            {isEditing ? (
              <Input
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Your name"
              />
            ) : (
              <p className="rounded-lg bg-slate-800/50 px-4 py-3 text-slate-100">
                {profile?.full_name || "Not set"}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              Email
            </Label>
            <p className="rounded-lg bg-slate-800/50 px-4 py-3 text-slate-400">
              {profile?.email}
            </p>
            {isEditing && (
              <p className="text-xs text-slate-500">
                Email cannot be changed. Contact an admin for help.
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-500" />
              Phone
            </Label>
            {isEditing ? (
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(555) 555-5555"
                type="tel"
              />
            ) : (
              <p className="rounded-lg bg-slate-800/50 px-4 py-3 text-slate-100">
                {profile?.phone || "Not set"}
              </p>
            )}
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    full_name: profile?.full_name || "",
                    phone: profile?.phone || "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
