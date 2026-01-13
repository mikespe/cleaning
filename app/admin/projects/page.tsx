"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  FolderKanban,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
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
import { cn, formatPhase, getStatusColor, formatStatus } from "@/lib/utils";
import type { Project } from "@/types/database";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "Newark",
    state: "NJ",
    zip_code: "",
    sq_footage: "",
    phase: "" as Project["phase"] | "",
    status: "pending" as Project["status"],
    gc_name: "",
    gc_email: "",
    gc_phone: "",
    gate_code: "",
    site_notes: "",
    price: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      alert(`Error loading projects: ${error.message}`);
    }

    setProjects(data || []);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "Newark",
      state: "NJ",
      zip_code: "",
      sq_footage: "",
      phase: "",
      status: "pending",
      gc_name: "",
      gc_email: "",
      gc_phone: "",
      gate_code: "",
      site_notes: "",
      price: "",
    });
    setEditingProject(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) return;
    setIsSaving(true);

    const supabase = createClient();
    const projectData = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code || null,
      sq_footage: formData.sq_footage ? parseInt(formData.sq_footage) : null,
      phase: formData.phase || null,
      status: formData.status,
      gc_name: formData.gc_name || null,
      gc_email: formData.gc_email || null,
      gc_phone: formData.gc_phone || null,
      gate_code: formData.gate_code || null,
      site_notes: formData.site_notes || null,
      price: formData.price ? parseFloat(formData.price) : null,
    };

    let error;
    if (editingProject) {
      const result = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", editingProject.id);
      error = result.error;
    } else {
      const result = await supabase.from("projects").insert(projectData);
      error = result.error;
    }

    if (error) {
      console.error("Error saving project:", error);
      alert(`Error saving project: ${error.message}`);
      setIsSaving(false);
      return;
    }

    fetchProjects();
    setIsDialogOpen(false);
    resetForm();
    setIsSaving(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      address: project.address,
      city: project.city,
      state: project.state,
      zip_code: project.zip_code || "",
      sq_footage: project.sq_footage?.toString() || "",
      phase: project.phase || "",
      status: project.status,
      gc_name: project.gc_name || "",
      gc_email: project.gc_email || "",
      gc_phone: project.gc_phone || "",
      gate_code: project.gate_code || "",
      site_notes: project.site_notes || "",
      price: project.price?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", id);
    fetchProjects();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-4 text-sm text-slate-400">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-sm text-slate-400">
            Manage your construction cleaning jobs
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Add New Project"}
              </DialogTitle>
              <DialogDescription>
                {editingProject
                  ? "Update the project details below"
                  : "Enter the details for the new project"}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Project Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Newark Tower Phase 1"
                />
              </div>

              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="e.g., 100 Broad Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  <Input
                    value={formData.zip_code}
                    onChange={(e) =>
                      setFormData({ ...formData, zip_code: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Square Footage</Label>
                  <Input
                    type="number"
                    value={formData.sq_footage}
                    onChange={(e) =>
                      setFormData({ ...formData, sq_footage: e.target.value })
                    }
                    placeholder="e.g., 25000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phase</Label>
                  <Select
                    value={formData.phase}
                    onValueChange={(value) =>
                      setFormData({ ...formData, phase: value as Project["phase"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rough">Rough Clean</SelectItem>
                      <SelectItem value="final">Final Clean</SelectItem>
                      <SelectItem value="punch">Punch Clean</SelectItem>
                      <SelectItem value="turnover">Turnover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as Project["status"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gate Code</Label>
                <Input
                  value={formData.gate_code}
                  onChange={(e) =>
                    setFormData({ ...formData, gate_code: e.target.value })
                  }
                  placeholder="e.g., 1234"
                />
              </div>

              <div className="border-t border-slate-800 pt-4">
                <p className="mb-3 text-sm font-medium text-slate-300">
                  General Contractor Info
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>GC Name</Label>
                    <Input
                      value={formData.gc_name}
                      onChange={(e) =>
                        setFormData({ ...formData, gc_name: e.target.value })
                      }
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>GC Email</Label>
                      <Input
                        type="email"
                        value={formData.gc_email}
                        onChange={(e) =>
                          setFormData({ ...formData, gc_email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GC Phone</Label>
                      <Input
                        value={formData.gc_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, gc_phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Site Notes</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={formData.site_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, site_notes: e.target.value })
                  }
                  placeholder="Any special instructions or notes..."
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSaving || !formData.name || !formData.address}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingProject ? (
                  "Update Project"
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List or Empty State */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <FolderKanban className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-slate-100">
            No projects yet
          </h3>
          <p className="mb-6 max-w-sm text-sm text-slate-400">
            Create your first project to start scheduling workers and tracking
            jobs.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-100">{project.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                    <MapPin className="h-3 w-3" />
                    {project.city}, {project.state}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(project)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(project.id)}
                      className="text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-medium",
                    getStatusColor(project.status)
                  )}
                >
                  {formatStatus(project.status)}
                </span>
                {project.phase && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                    {formatPhase(project.phase)}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm text-slate-400">
                {project.sq_footage && (
                  <p>{project.sq_footage.toLocaleString()} sq ft</p>
                )}
                {project.price && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {project.price.toLocaleString()}
                  </div>
                )}
                {project.gc_name && <p>GC: {project.gc_name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
