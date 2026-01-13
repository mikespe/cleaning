"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  MapPin,
  Clock,
  Key,
  CheckCircle2,
  Circle,
  Navigation,
  Clipboard,
  ChevronRight,
  AlertCircle,
  Loader2,
  Sun,
  Coffee,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  cn,
  formatTime,
  getGoogleMapsUrl,
  formatPhase,
  getStatusColor,
  formatStatus,
} from "@/lib/utils";
import type { Project, Assignment } from "@/types/database";

type TodayAssignment = Assignment & {
  project: Project;
};

export default function WorkerPortal() {
  const [assignments, setAssignments] = useState<TodayAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTodaysJobs();
  }, []);

  const fetchTodaysJobs = async () => {
    const supabase = createClient();
    const today = format(new Date(), "yyyy-MM-dd");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("assignments")
      .select(
        `
        *,
        project:projects(*)
      `
      )
      .eq("worker_id", user.id)
      .eq("scheduled_date", today)
      .order("start_time", { ascending: true });

    setAssignments((data as TodayAssignment[]) || []);
    setIsLoading(false);
  };

  const handleCheckIn = async (assignmentId: string) => {
    setUpdatingId(assignmentId);
    const supabase = createClient();

    const { error } = await supabase
      .from("assignments")
      .update({
        status: "in_progress",
        check_in_time: new Date().toISOString(),
      })
      .eq("id", assignmentId);

    if (!error) {
      fetchTodaysJobs();
    }
    setUpdatingId(null);
  };

  const handleCheckOut = async (assignmentId: string) => {
    setUpdatingId(assignmentId);
    const supabase = createClient();

    const { error } = await supabase
      .from("assignments")
      .update({
        status: "completed",
        check_out_time: new Date().toISOString(),
      })
      .eq("id", assignmentId);

    if (!error) {
      fetchTodaysJobs();
    }
    setUpdatingId(null);
  };

  const handleToggleComplete = async (
    assignmentId: string,
    currentStatus: string
  ) => {
    setUpdatingId(assignmentId);
    const supabase = createClient();

    const newStatus =
      currentStatus === "completed" ? "in_progress" : "completed";
    const updates: Record<string, string | null> = { status: newStatus };

    if (newStatus === "completed") {
      updates.check_out_time = new Date().toISOString();
    } else {
      updates.check_out_time = null;
    }

    const { error } = await supabase
      .from("assignments")
      .update(updates)
      .eq("id", assignmentId);

    if (!error) {
      fetchTodaysJobs();
    }
    setUpdatingId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: Coffee };
    if (hour < 17) return { text: "Good afternoon", icon: Sun };
    return { text: "Good evening", icon: Sun };
  };

  const greeting = getGreeting();
  const completedCount = assignments.filter(
    (a) => a.status === "completed"
  ).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 p-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
          <greeting.icon className="h-4 w-4" />
          {greeting.text}
        </div>
        <h1 className="mb-1 text-2xl font-bold text-slate-100">
          Today&apos;s Jobs
        </h1>
        <p className="text-sm text-slate-400">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>

        {/* Progress */}
        {assignments.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Progress</span>
              <span className="font-medium text-orange-500">
                {completedCount} of {assignments.length} complete
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-500 transition-all duration-500"
                style={{
                  width: `${(completedCount / assignments.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Job Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="mt-4 text-sm text-slate-400">Loading your jobs...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-slate-100">
            No jobs today
          </h3>
          <p className="text-sm text-slate-400">
            Enjoy your day off! Check back tomorrow.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <div
              key={assignment.id}
              className={cn(
                "group overflow-hidden rounded-2xl border bg-slate-900/50 transition-all duration-300",
                assignment.status === "completed"
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-slate-800 hover:border-slate-700"
              )}
            >
              {/* Job Header */}
              <div className="border-b border-slate-800/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Job number indicator */}
                    <div
                      className={cn(
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                        assignment.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : assignment.status === "in_progress"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-slate-800 text-slate-400"
                      )}
                    >
                      {assignment.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-100">
                        {assignment.project?.name}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-medium",
                            getStatusColor(assignment.status)
                          )}
                        >
                          {formatStatus(assignment.status)}
                        </span>
                        {assignment.project?.phase && (
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                            {formatPhase(assignment.project.phase)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Complete Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Done</span>
                    <Switch
                      checked={assignment.status === "completed"}
                      onCheckedChange={() =>
                        handleToggleComplete(assignment.id, assignment.status)
                      }
                      disabled={updatingId === assignment.id}
                    />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="p-4">
                {/* Time */}
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-300">
                  <Clock className="h-4 w-4 text-slate-500" />
                  {formatTime(assignment.start_time)} -{" "}
                  {formatTime(assignment.end_time)}
                </div>

                {/* Address with Google Maps link */}
                <a
                  href={getGoogleMapsUrl(
                    assignment.project?.address || "",
                    assignment.project?.city || "",
                    assignment.project?.state || "NJ"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/50 p-3 transition-colors hover:border-orange-500/50 hover:bg-slate-800"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-600/20">
                    <Navigation className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-100">
                      {assignment.project?.address}
                    </p>
                    <p className="text-sm text-slate-400">
                      {assignment.project?.city}, {assignment.project?.state}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                </a>

                {/* Gate Code */}
                {assignment.project?.gate_code && (
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/50 p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-700">
                      <Key className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Gate Code</p>
                      <p className="font-mono text-lg font-bold text-slate-100">
                        {assignment.project.gate_code}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(assignment.project.gate_code || "")
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-100"
                    >
                      <Clipboard className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Site Notes */}
                {assignment.project?.site_notes && (
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      Site Notes
                    </div>
                    <p className="text-sm text-slate-300">
                      {assignment.project.site_notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {assignment.status !== "completed" && (
                  <div className="mt-4">
                    {assignment.status === "scheduled" ? (
                      <Button
                        className="w-full"
                        onClick={() => handleCheckIn(assignment.id)}
                        disabled={updatingId === assignment.id}
                      >
                        {updatingId === assignment.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Check In
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-500"
                        onClick={() => handleCheckOut(assignment.id)}
                        disabled={updatingId === assignment.id}
                      >
                        {updatingId === assignment.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Mark Complete
                      </Button>
                    )}
                  </div>
                )}

                {/* Completed info */}
                {assignment.status === "completed" && assignment.check_out_time && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed at{" "}
                    {format(new Date(assignment.check_out_time), "h:mm a")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
