"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, parseISO } from "date-fns";
import {
  Plus,
  MapPin,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
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
import { cn, formatPhase, getStatusColor, formatStatus } from "@/lib/utils";
import type { Project, Assignment, Profile } from "@/types/database";

type AssignmentWithDetails = Assignment & {
  project: Project;
  worker: Profile;
};

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New assignment form state
  const [newAssignment, setNewAssignment] = useState({
    projectId: "",
    workerIds: [] as string[],
    startTime: "08:00",
    endTime: "17:00",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();

    // Fetch assignments with project and worker details
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from("assignments")
      .select(
        `
        *,
        project:projects(*),
        worker:profiles(*)
      `
      )
      .order("scheduled_date", { ascending: true });

    if (assignmentsError) {
      console.error("Error fetching assignments:", assignmentsError);
    }

    // Fetch all projects
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .in("status", ["pending", "scheduled", "in_progress"])
      .order("name");

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
    }

    // Fetch only workers (not admins)
    const { data: workersData, error: workersError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "worker")
      .order("full_name");

    if (workersError) {
      console.error("Error fetching workers:", workersError);
    }

    setAssignments((assignmentsData as AssignmentWithDetails[]) || []);
    setProjects(projectsData || []);
    setWorkers(workersData || []);
    setIsLoading(false);
  };

  const handleAddAssignment = async () => {
    if (!newAssignment.projectId || newAssignment.workerIds.length === 0) return;

    const supabase = createClient();

    // Create an assignment for each selected worker
    const assignmentsToInsert = newAssignment.workerIds.map((workerId) => ({
      project_id: newAssignment.projectId,
      worker_id: workerId,
      scheduled_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: newAssignment.startTime,
      end_time: newAssignment.endTime,
      status: "scheduled",
    }));

    const { error } = await supabase.from("assignments").insert(assignmentsToInsert);

    if (error) {
      console.error("Error creating assignments:", error);
      alert(`Error creating assignments: ${error.message}`);
      return;
    }

    fetchData();
    setIsDialogOpen(false);
    setNewAssignment({
      projectId: "",
      workerIds: [],
      startTime: "08:00",
      endTime: "17:00",
    });
  };

  const toggleWorkerSelection = (workerId: string) => {
    setNewAssignment((prev) => ({
      ...prev,
      workerIds: prev.workerIds.includes(workerId)
        ? prev.workerIds.filter((id) => id !== workerId)
        : [...prev.workerIds, workerId],
    }));
  };

  // Get assignments for selected date
  const dayAssignments = assignments.filter((a) =>
    isSameDay(parseISO(a.scheduled_date), selectedDate)
  );

  // Get dates that have assignments
  const datesWithAssignments = assignments.map((a) => parseISO(a.scheduled_date));

  return (
    <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
      {/* Calendar Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          modifiers={{
            hasAssignment: datesWithAssignments,
          }}
          modifiersStyles={{
            hasAssignment: {
              fontWeight: "bold",
            },
          }}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
          classNames={{
            months: "flex flex-col",
            month: "space-y-4",
            caption: "flex justify-center relative items-center h-10",
            caption_label: "text-sm font-semibold text-slate-100",
            nav: "flex items-center gap-1",
            nav_button:
              "h-8 w-8 bg-transparent p-0 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell:
              "text-slate-500 rounded-md w-10 font-normal text-[0.75rem] uppercase",
            row: "flex w-full mt-2",
            cell: "relative p-0 text-center text-sm focus-within:relative",
            day: cn(
              "h-10 w-10 p-0 font-normal rounded-lg transition-colors",
              "hover:bg-slate-800 focus:bg-slate-800",
              "text-slate-300"
            ),
            day_selected:
              "bg-orange-600 text-white hover:bg-orange-500 focus:bg-orange-500",
            day_today: "bg-slate-800 text-orange-500 font-semibold",
            day_outside: "text-slate-600 opacity-50",
            day_disabled: "text-slate-600",
            day_hidden: "invisible",
          }}
        />

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-orange-600" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-slate-800" />
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Day Detail Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              {format(selectedDate, "EEEE, MMMM d")}
            </h2>
            <p className="text-sm text-slate-400">
              {dayAssignments.length} assignment
              {dayAssignments.length !== 1 ? "s" : ""} scheduled
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Assignment</DialogTitle>
                <DialogDescription>
                  Schedule a worker for {format(selectedDate, "MMMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={newAssignment.projectId}
                    onValueChange={(value) =>
                      setNewAssignment((prev) => ({ ...prev, projectId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Workers</Label>
                  <Select
                    value={newAssignment.workerIds[0] || ""}
                    onValueChange={(value) =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        workerIds: prev.workerIds.includes(value)
                          ? prev.workerIds
                          : [...prev.workerIds, value],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        newAssignment.workerIds.length > 0
                          ? `${newAssignment.workerIds.length} worker(s) selected`
                          : "Select workers"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-slate-500">
                          No workers found. Check that workers have role="worker" in the database.
                        </div>
                      ) : (
                        workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={newAssignment.workerIds.includes(worker.id)}
                                readOnly
                                className="h-3 w-3"
                              />
                              {worker.full_name || worker.email}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {newAssignment.workerIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {newAssignment.workerIds.map((id) => {
                        const worker = workers.find((w) => w.id === id);
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 rounded-full bg-orange-600/20 px-2 py-1 text-xs text-orange-400"
                          >
                            {worker?.full_name || worker?.email || "Unknown"}
                            <button
                              type="button"
                              onClick={() => toggleWorkerSelection(id)}
                              className="ml-1 hover:text-orange-200"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newAssignment.startTime}
                      onChange={(e) =>
                        setNewAssignment((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={newAssignment.endTime}
                      onChange={(e) =>
                        setNewAssignment((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddAssignment}
                  disabled={!newAssignment.projectId || newAssignment.workerIds.length === 0}
                >
                  Add Assignment{newAssignment.workerIds.length > 1 ? "s" : ""} ({newAssignment.workerIds.length})
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Assignment List */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            </div>
          ) : dayAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                <Clock className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="mb-1 font-medium text-slate-300">No assignments</h3>
              <p className="text-sm text-slate-500">
                Click "Add Assignment" to schedule work for this day.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-700"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-100">
                        {assignment.project?.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="h-4 w-4" />
                        {assignment.project?.address}, {assignment.project?.city}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        getStatusColor(assignment.status)
                      )}
                    >
                      {formatStatus(assignment.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {assignment.worker?.full_name || "Unassigned"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {assignment.start_time?.slice(0, 5)} -{" "}
                      {assignment.end_time?.slice(0, 5)}
                    </div>
                    {assignment.project?.phase && (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-xs">
                        {formatPhase(assignment.project.phase)}
                      </span>
                    )}
                  </div>
                  {assignment.project?.gate_code && (
                    <div className="mt-2 text-xs text-slate-500">
                      Gate Code: {assignment.project.gate_code}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
