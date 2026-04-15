"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ScheduleEventData } from "@/lib/validations/schedule-event";

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

const DashboardCalendar: React.FC = () => {
  const [announcements, setAnnouncements] = useState<ScheduleEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ScheduleEventData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/client/announcements");
        const data = await response.json();
        if (data.announcements) {
          setAnnouncements(
            data.announcements.map((a: ScheduleEventData | any) => ({
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

  // Map dates that have announcements
  const announcementDates = useMemo(() => {
    const dateMap = new Map<string, ScheduleEventData[]>();
    announcements.forEach((announcement) => {
      const dateKey = announcement.startDate.toISOString().split("T")[0];
      const existing = dateMap.get(dateKey) || [];
      dateMap.set(dateKey, [...existing, announcement]);
    });
    return dateMap;
  }, [announcements]);

  // Get announcements for selected date
  const selectedDateAnnouncements = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toISOString().split("T")[0];
    return announcementDates.get(dateKey) || [];
  }, [selectedDate, announcementDates]);

  // Modifiers for calendar — highlight dates with announcements
  const announcementModifiers = useMemo(() => {
    return Array.from(announcementDates.keys()).map((dateStr) => new Date(dateStr));
  }, [announcementDates]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const dateKey = day.toISOString().split("T")[0];
    const dayAnnouncements = announcementDates.get(dateKey) || [];
    if (dayAnnouncements.length === 1) {
      // If only one announcement, show popup directly
      setSelectedAnnouncement(dayAnnouncements[0]);
      setDialogOpen(true);
    } else if (dayAnnouncements.length > 1) {
      // Multiple — show in the list below calendar, user can click one
    }
  };

  const handleAnnouncementClick = (announcement: ScheduleEventData) => {
    setSelectedAnnouncement(announcement);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Calendar & Announcements</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calendar */}
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => day && handleDayClick(day)}
                modifiers={{
                  hasAnnouncement: announcementModifiers,
                }}
                modifiersClassNames={{
                  hasAnnouncement: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-blue-500",
                }}
                className="rounded-md border"
              />
            </div>

            {/* Announcements for selected date */}
            {selectedDate && selectedDateAnnouncements.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {selectedDateAnnouncements.map((announcement) => (
                  <button
                    key={announcement.id}
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    onClick={() => handleAnnouncementClick(announcement)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          EVENT_TYPE_COLORS[announcement.type] || "bg-gray-500"
                        )}
                      />
                      <span className="text-sm font-medium truncate">
                        {announcement.title}
                      </span>
                      <Badge variant="secondary" className="text-xs ml-auto shrink-0">
                        {EVENT_TYPE_LABELS[announcement.type] || announcement.type}
                      </Badge>
                    </div>
                    {announcement.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 pl-4">
                        {announcement.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Upcoming announcements when no date selected */}
            {!selectedDate && announcements.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming Announcements
                </p>
                {announcements.slice(0, 3).map((announcement) => (
                  <button
                    key={announcement.id}
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    onClick={() => handleAnnouncementClick(announcement)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          EVENT_TYPE_COLORS[announcement.type] || "bg-gray-500"
                        )}
                      />
                      <span className="text-sm font-medium truncate">
                        {announcement.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 pl-4">
                      {announcement.startDate.toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {announcements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No announcements at this time
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Announcement Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {EVENT_TYPE_LABELS[selectedAnnouncement.type] || selectedAnnouncement.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedAnnouncement.startDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {selectedAnnouncement.endDate && (
                <p className="text-sm text-muted-foreground">
                  Until:{" "}
                  {selectedAnnouncement.endDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
              {selectedAnnouncement.description ? (
                <p className="text-sm whitespace-pre-wrap">{selectedAnnouncement.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No additional details provided.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DashboardCalendar;
