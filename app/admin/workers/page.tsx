"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Mail,
  Phone,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  Shield,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Profile | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    role: "worker" as Profile["role"],
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching workers:", error);
      alert(`Error loading team members: ${error.message}`);
    }

    setWorkers(data || []);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      full_name: "",
      phone: "",
      role: "worker",
    });
    setEditingWorker(null);
  };

  const handleSubmit = async () => {
    if (!editingWorker) return; // Can only edit existing workers
    setIsSaving(true);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        role: formData.role,
      })
      .eq("id", editingWorker.id);

    fetchWorkers();
    setIsDialogOpen(false);
    resetForm();
    setIsSaving(false);
  };

  const handleEdit = (worker: Profile) => {
    setEditingWorker(worker);
    setFormData({
      email: worker.email,
      full_name: worker.full_name || "",
      phone: worker.phone || "",
      role: worker.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this worker? This will also delete their user account.")) return;
    // Note: Deleting from profiles will cascade to auth.users due to the FK constraint
    const supabase = createClient();
    await supabase.from("profiles").delete().eq("id", id);
    fetchWorkers();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-4 text-sm text-slate-400">Loading workers...</p>
      </div>
    );
  }

  const workersOnly = workers.filter((w) => w.role === "worker");
  const admins = workers.filter((w) => w.role === "admin");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Team</h1>
          <p className="text-sm text-slate-400">
            Manage your workers and admins
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update the team member's information
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} disabled className="opacity-50" />
                <p className="text-xs text-slate-500">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(555) 555-5555"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as Profile["role"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {workers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <Users className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-slate-100">
            No team members yet
          </h3>
          <p className="mb-6 max-w-sm text-sm text-slate-400">
            Workers can sign up at the /signup page. Share the link with your
            team to get them onboarded.
          </p>
          <div className="rounded-lg bg-slate-800 px-4 py-2 font-mono text-sm text-orange-400">
            {typeof window !== "undefined" ? window.location.origin : ""}/signup
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Admins Section */}
          {admins.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400">
                <Shield className="h-4 w-4" />
                Administrators ({admins.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {admins.map((admin) => (
                  <WorkerCard
                    key={admin.id}
                    worker={admin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Workers Section */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400">
              <UserCheck className="h-4 w-4" />
              Workers ({workersOnly.length})
            </h2>
            {workersOnly.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
                <p className="text-sm text-slate-500">
                  No workers yet. Share the signup link with your team.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workersOnly.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkerCard({
  worker,
  onEdit,
  onDelete,
}: {
  worker: Profile;
  onEdit: (worker: Profile) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
              worker.role === "admin"
                ? "bg-orange-600/20 text-orange-500"
                : "bg-slate-700 text-slate-300"
            )}
          >
            {worker.full_name?.charAt(0) || worker.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">
              {worker.full_name || "Unnamed"}
            </h3>
            <span
              className={cn(
                "text-xs",
                worker.role === "admin" ? "text-orange-500" : "text-slate-500"
              )}
            >
              {worker.role === "admin" ? "Administrator" : "Team Member"}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(worker)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(worker.id)}
              className="text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3" />
          <span className="truncate">{worker.email}</span>
        </div>
        {worker.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            {worker.phone}
          </div>
        )}
      </div>
    </div>
  );
}
