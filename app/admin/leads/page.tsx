"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Plus,
  FileText,
  Mail,
  Phone,
  Building,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowRight,
  Calendar,
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
import { cn, formatPhase } from "@/lib/utils";
import type { Lead } from "@/types/database";

const statusColors: Record<Lead["status"], string> = {
  new: "border-blue-500/50 bg-blue-500/10 text-blue-400",
  contacted: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
  quoted: "border-purple-500/50 bg-purple-500/10 text-purple-400",
  won: "border-green-500/50 bg-green-500/10 text-green-400",
  lost: "border-red-500/50 bg-red-500/10 text-red-400",
};

const statusLabels: Record<Lead["status"], string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filter, setFilter] = useState<Lead["status"] | "all">("all");

  const [formData, setFormData] = useState({
    project_name: "",
    gc_name: "",
    gc_email: "",
    gc_phone: "",
    company_name: "",
    address: "",
    sq_footage: "",
    phase: "" as Lead["phase"] | "",
    estimated_start_date: "",
    message: "",
    status: "new" as Lead["status"],
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    setLeads(data || []);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      project_name: "",
      gc_name: "",
      gc_email: "",
      gc_phone: "",
      company_name: "",
      address: "",
      sq_footage: "",
      phase: "",
      estimated_start_date: "",
      message: "",
      status: "new",
    });
    setEditingLead(null);
  };

  const handleSubmit = async () => {
    if (!formData.project_name || !formData.gc_email) return;
    setIsSaving(true);

    const supabase = createClient();
    const leadData = {
      project_name: formData.project_name,
      gc_name: formData.gc_name || null,
      gc_email: formData.gc_email,
      gc_phone: formData.gc_phone || null,
      company_name: formData.company_name || null,
      address: formData.address || null,
      sq_footage: formData.sq_footage ? parseInt(formData.sq_footage) : null,
      phase: formData.phase || null,
      estimated_start_date: formData.estimated_start_date || null,
      message: formData.message || null,
      status: formData.status,
    };

    if (editingLead) {
      await supabase.from("leads").update(leadData).eq("id", editingLead.id);
    } else {
      await supabase.from("leads").insert(leadData);
    }

    fetchLeads();
    setIsDialogOpen(false);
    resetForm();
    setIsSaving(false);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      project_name: lead.project_name,
      gc_name: lead.gc_name || "",
      gc_email: lead.gc_email,
      gc_phone: lead.gc_phone || "",
      company_name: lead.company_name || "",
      address: lead.address || "",
      sq_footage: lead.sq_footage?.toString() || "",
      phase: lead.phase || "",
      estimated_start_date: lead.estimated_start_date || "",
      message: lead.message || "",
      status: lead.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const supabase = createClient();
    await supabase.from("leads").delete().eq("id", id);
    fetchLeads();
  };

  const handleStatusChange = async (id: string, status: Lead["status"]) => {
    const supabase = createClient();
    await supabase.from("leads").update({ status }).eq("id", id);
    fetchLeads();
  };

  const filteredLeads = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-4 text-sm text-slate-400">Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Leads</h1>
          <p className="text-sm text-slate-400">
            Track and manage incoming project inquiries
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {editingLead ? "Edit Lead" : "Add New Lead"}
              </DialogTitle>
              <DialogDescription>
                {editingLead
                  ? "Update the lead information"
                  : "Enter the lead details"}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Project Name *</Label>
                <Input
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                  placeholder="e.g., Downtown Office Building"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    value={formData.gc_name}
                    onChange={(e) =>
                      setFormData({ ...formData, gc_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.gc_email}
                    onChange={(e) =>
                      setFormData({ ...formData, gc_email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.gc_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, gc_phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Square Footage</Label>
                  <Input
                    type="number"
                    value={formData.sq_footage}
                    onChange={(e) =>
                      setFormData({ ...formData, sq_footage: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phase</Label>
                  <Select
                    value={formData.phase}
                    onValueChange={(value) =>
                      setFormData({ ...formData, phase: value as Lead["phase"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rough">Rough</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="punch">Punch</SelectItem>
                      <SelectItem value="touchup">Touch-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Est. Start Date</Label>
                  <Input
                    type="date"
                    value={formData.estimated_start_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimated_start_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as Lead["status"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Any additional notes..."
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSaving || !formData.project_name || !formData.gc_email}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingLead ? (
                  "Update Lead"
                ) : (
                  "Create Lead"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      {leads.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({leads.length})
          </Button>
          {(Object.keys(statusLabels) as Lead["status"][]).map((status) => {
            const count = leads.filter((l) => l.status === status).length;
            if (count === 0) return null;
            return (
              <Button
                key={status}
                variant={filter === status ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {statusLabels[status]} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {/* Leads List or Empty State */}
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <FileText className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-slate-100">
            No leads yet
          </h3>
          <p className="mb-6 max-w-sm text-sm text-slate-400">
            Add leads manually or they'll appear here when someone submits an
            inquiry through your website.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Lead
          </Button>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
          <p className="text-sm text-slate-500">
            No leads with status "{statusLabels[filter as Lead["status"]]}"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-100">
                      {lead.project_name}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        statusColors[lead.status]
                      )}
                    >
                      {statusLabels[lead.status]}
                    </span>
                    {lead.phase && (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                        {formatPhase(lead.phase)}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-2 md:grid-cols-3">
                    {lead.gc_name && (
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3" />
                        {lead.gc_name}
                        {lead.company_name && ` (${lead.company_name})`}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {lead.gc_email}
                    </div>
                    {lead.gc_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {lead.gc_phone}
                      </div>
                    )}
                    {lead.sq_footage && (
                      <div>{lead.sq_footage.toLocaleString()} sq ft</div>
                    )}
                    {lead.estimated_start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Est. {format(new Date(lead.estimated_start_date), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>

                  {lead.message && (
                    <p className="mt-3 text-sm text-slate-500">{lead.message}</p>
                  )}

                  <p className="mt-2 text-xs text-slate-600">
                    Added {format(new Date(lead.created_at), "MMM d, yyyy")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={lead.status}
                    onValueChange={(value) =>
                      handleStatusChange(lead.id, value as Lead["status"])
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(lead)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {lead.status === "won" && (
                        <DropdownMenuItem>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Convert to Project
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
