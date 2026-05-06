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
import { formatDateKeyInManila, MANILA_TIME_ZONE } from "@/lib/manila-datetime";

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
            (data.announcements as ScheduleEventApiRecord[])
              .filter((a) => a.type !== "announcement")
              .map((a) => ({
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
      const key = formatDateKeyInManila(event.startDate);
      map.set(key, [...(map.get(key) || []), event]);
    });
    return map;
  }, [announcements]);

  const selectedEvents = useMemo(() => {
    const key = formatDateKeyInManila(selectedDate);
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
          <CardTitle className="text-base">Calendar</CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <div className="min-w-[140px] text-right">
            <p className="text-sm font-bold">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
                timeZone: MANILA_TIME_ZONE,
              })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : (
          <>

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
                  const key = formatDateKeyInManila(date);
                  const dayEvents = eventsByDate.get(key) || [];
                  const isSelected = isSameDay(date, selectedDate);
                  const today = isSameDay(date, new Date());

                    return (
                      <div
                        key={`${key}-${idx}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedDate(date)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedDate(date);
                          }
                        }}
                        className={cn(
                          "min-h-20 cursor-pointer border-b border-r p-1 text-left transition-colors hover:bg-muted/40",
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
                        <div className="flex flex-col gap-1">
                          {dayEvents.slice(0, 2).map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation();
                              setSelectedDate(date);
                              setSelectedAnnouncement(event);
                              setDialogOpen(true);
                            }}
                            className={cn(
                              "truncate rounded px-1 py-0.5 text-left text-[10px] text-white",
                              EVENT_TYPE_COLORS[event.type] || "bg-gray-500"
                            )}
                          >
                            {event.title}
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                      </div>
                    );
                  })}
                </div>
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
                  timeZone: MANILA_TIME_ZONE,
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
