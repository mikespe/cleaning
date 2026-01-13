"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Mail,
  Phone,
  Shield,
  Loader2,
  LogOut,
  Key,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types/database";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
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
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name || null,
        phone: formData.phone || null,
      })
      .eq("id", profile.id);

    if (error) {
      setMessage({ type: "error", text: "Failed to save changes" });
    } else {
      setProfile({ ...profile, ...formData });
      setMessage({ type: "success", text: "Changes saved successfully" });
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-4 text-sm text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600/20">
            <User className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100">Profile</h2>
            <p className="text-sm text-slate-400">Your personal information</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Full Name
            </Label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              Email
            </Label>
            <Input value={profile?.email || ""} disabled className="opacity-50" />
            <p className="text-xs text-slate-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-500" />
              Phone
            </Label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="(555) 555-5555"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-500" />
              Role
            </Label>
            <div className="rounded-lg bg-slate-800/50 px-4 py-3">
              <span className="text-orange-500">
                {profile?.role === "admin" ? "Administrator" : "Team Member"}
              </span>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
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
      </div>

      {/* Account Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
            <Key className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100">Account</h2>
            <p className="text-sm text-slate-400">Manage your account</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-red-400"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center text-xs text-slate-600">
        <p>Garden State Cleaning v0.1.0</p>
        <p className="mt-1">Construction cleaning management system</p>
      </div>
    </div>
  );
}
