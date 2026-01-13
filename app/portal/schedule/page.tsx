"use client";

import { useEffect, useState } from "react";
import { format, parseISO, isToday, isTomorrow, addDays, startOfWeek, endOfWeek } from "date-fns";
import {
  MapPin,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn, formatTime, formatPhase, getStatusColor, formatStatus } from "@/lib/utils";
import type { Project, Assignment } from "@/types/database";

type ScheduleAssignment = Assignment & {
  project: Project;
};

type GroupedAssignments = {
  [date: string]: ScheduleAssignment[];
};

export default function SchedulePage() {
  const [assignments, setAssignments] = useState<ScheduleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  useEffect(() => {
    fetchSchedule();
  }, [weekStart]);

  const fetchSchedule = async () => {
    setIsLoading(true);
    const supabase = createClient();

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
      .gte("scheduled_date", format(weekStart, "yyyy-MM-dd"))
      .lte("scheduled_date", format(weekEnd, "yyyy-MM-dd"))
      .order("scheduled_date", { ascending: true })
      .order("start_time", { ascending: true });

    setAssignments((data as ScheduleAssignment[]) || []);
    setIsLoading(false);
  };

  // Group assignments by date
  const groupedAssignments: GroupedAssignments = assignments.reduce(
    (acc, assignment) => {
      const date = assignment.scheduled_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(assignment);
      return acc;
    },
    {} as GroupedAssignments
  );

  // Generate all days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const formatDayLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-slate-100">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h1>
          <p className="text-sm text-slate-400">
            {assignments.length} job{assignments.length !== 1 ? "s" : ""} this week
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Week View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="mt-4 text-sm text-slate-400">Loading schedule...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {weekDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayAssignments = groupedAssignments[dateKey] || [];
            const hasJobs = dayAssignments.length > 0;

            return (
              <div
                key={dateKey}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-colors",
                  hasJobs
                    ? "border-slate-800 bg-slate-900/50"
                    : "border-slate-800/50 bg-slate-900/20",
                  isToday(day) && "ring-1 ring-orange-500/50"
                )}
              >
                {/* Day Header */}
                <div
                  className={cn(
                    "flex items-center justify-between border-b p-4",
                    hasJobs ? "border-slate-800" : "border-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 flex-col items-center justify-center rounded-xl",
                        isToday(day)
                          ? "bg-orange-600 text-white"
                          : hasJobs
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-800/50 text-slate-500"
                      )}
                    >
                      <span className="text-[10px] font-medium uppercase">
                        {format(day, "EEE")}
                      </span>
                      <span className="text-lg font-bold">{format(day, "d")}</span>
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "font-medium",
                          hasJobs ? "text-slate-100" : "text-slate-500"
                        )}
                      >
                        {formatDayLabel(day)}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {hasJobs
                          ? `${dayAssignments.length} job${
                              dayAssignments.length !== 1 ? "s" : ""
                            }`
                          : "No jobs scheduled"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Jobs for this day */}
                {hasJobs && (
                  <div className="divide-y divide-slate-800/50">
                    {dayAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-start gap-4 p-4"
                      >
                        {/* Time */}
                        <div className="flex w-20 flex-shrink-0 flex-col items-center text-center">
                          <span className="font-mono text-sm font-medium text-slate-300">
                            {formatTime(assignment.start_time)}
                          </span>
                          <span className="text-[10px] text-slate-500">to</span>
                          <span className="font-mono text-xs text-slate-500">
                            {formatTime(assignment.end_time)}
                          </span>
                        </div>

                        {/* Vertical line */}
                        <div className="relative">
                          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-800" />
                          <div
                            className={cn(
                              "relative z-10 h-3 w-3 rounded-full",
                              assignment.status === "completed"
                                ? "bg-green-500"
                                : assignment.status === "in_progress"
                                ? "bg-orange-500"
                                : "bg-slate-600"
                            )}
                          />
                        </div>

                        {/* Job Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-slate-100">
                              {assignment.project?.name}
                            </h4>
                            <span
                              className={cn(
                                "flex-shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                                getStatusColor(assignment.status)
                              )}
                            >
                              {formatStatus(assignment.status)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {assignment.project?.address},{" "}
                              {assignment.project?.city}
                            </span>
                          </div>
                          {assignment.project?.phase && (
                            <span className="mt-2 inline-block rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                              {formatPhase(assignment.project.phase)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
