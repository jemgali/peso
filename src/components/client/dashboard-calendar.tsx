"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduleEventData } from "@/lib/validations/schedule-event";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_TYPE_COLORS: Record<string, string> = {
  announcement: "bg-blue-500",
  schedule: "bg-green-500",
  deadline: "bg-red-500",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  announcement: "Announcement",
  schedule: "Schedule",
  deadline: "Deadline",
};

interface ScheduleEventApiRecord
  extends Omit<ScheduleEventData, "startDate" | "endDate" | "createdAt" | "updatedAt"> {
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthGrid(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const grid: Array<{ date: Date; currentMonth: boolean }> = [];

  for (let i = first - 1; i >= 0; i--) {
    grid.push({ date: new Date(year, month - 1, daysInPrevMonth - i), currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({ date: new Date(year, month, d), currentMonth: true });
  }
  while (grid.length < 42) {
    const d = grid.length - (first + daysInMonth) + 1;
    grid.push({ date: new Date(year, month + 1, d), currentMonth: false });
  }
  return grid;
}

const DashboardCalendar: React.FC = () => {
  const [announcements, setAnnouncements] = useState<ScheduleEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ScheduleEventData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/client/announcements");
        const data = await response.json();
        if (data.announcements) {
          setAnnouncements(
            (data.announcements as ScheduleEventApiRecord[]).map((a) => ({
              ...a,
              startDate: new Date(a.startDate),
              endDate: a.endDate ? new Date(a.endDate) : null,
              createdAt: new Date(a.createdAt),
              updatedAt: new Date(a.updatedAt),
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const monthGrid = useMemo(() => getMonthGrid(currentDate), [currentDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduleEventData[]>();
    announcements.forEach((event) => {
      const key = event.startDate.toISOString().split("T")[0];
      map.set(key, [...(map.get(key) || []), event]);
    });
    return map;
  }, [announcements]);

  const selectedEvents = useMemo(() => {
    const key = selectedDate.toISOString().split("T")[0];
    return eventsByDate.get(key) || [];
  }, [selectedDate, eventsByDate]);

  const navigateMonth = (offset: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  return (
    <Card className="min-h-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Calendar & Announcements</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </div>
              <p className="text-sm font-semibold">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <div className="grid grid-cols-7 bg-muted">
                {DAYS.map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-medium">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthGrid.map(({ date, currentMonth }, idx) => {
                  const key = date.toISOString().split("T")[0];
                  const dayEvents = eventsByDate.get(key) || [];
                  const isSelected = isSameDay(date, selectedDate);
                  const today = isSameDay(date, new Date());

                  return (
                    <button
                      key={`${key}-${idx}`}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "min-h-20 border-b border-r p-1 text-left transition-colors hover:bg-muted/40",
                        !currentMonth && "bg-muted/20 text-muted-foreground",
                        isSelected && "bg-primary/10"
                      )}
                    >
                      <div
                        className={cn(
                          "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                          today && "bg-primary text-primary-foreground"
                        )}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "truncate rounded px-1 py-0.5 text-[10px] text-white",
                              EVENT_TYPE_COLORS[event.type] || "bg-gray-500"
                            )}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements for this date.</p>
              ) : (
                selectedEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className="w-full rounded-lg border p-3 text-left hover:bg-muted/40"
                    onClick={() => {
                      setSelectedAnnouncement(event);
                      setDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", EVENT_TYPE_COLORS[event.type] || "bg-gray-500")} />
                      <p className="text-sm font-medium">{event.title}</p>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {EVENT_TYPE_LABELS[event.type] || event.type}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <Badge variant="secondary">
                {EVENT_TYPE_LABELS[selectedAnnouncement.type] || selectedAnnouncement.type}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {selectedAnnouncement.startDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {selectedAnnouncement.description || "No additional details provided."}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DashboardCalendar;
