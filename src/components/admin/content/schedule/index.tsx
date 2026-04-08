"use client"

import React, { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/ui/button"
import { ScheduleCalendarSkeleton } from "@/ui/skeletons"
import { useDialogState } from "@/hooks"
import { Calendar } from "./calendar"
import { EventDialog } from "./event-dialog"
import { EventDetailsDialog } from "./event-details-dialog"
import {
  type ScheduleEventData,
} from "@/lib/validations/schedule-event"

export type CalendarView = "month" | "week" | "day"

export default function Schedule() {
  // Calendar state
  const [events, setEvents] = useState<ScheduleEventData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>("month")
  
  // Dialog state (create/edit via hook, details kept separate)
  const dialog = useDialogState<ScheduleEventData>()
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch events for the current month view (with buffer for week/day views)
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0)

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })

      const response = await fetch(`/api/admin/schedule?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }
      const data = await response.json()
      setEvents(data.events.map((e: ScheduleEventData) => ({
        ...e,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      })))
    } catch (error) {
      console.error("Error fetching events:", error)
      toast.error("Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    dialog.setCreateOpen(true)
  }

  const handleEventClick = (event: ScheduleEventData) => {
    dialog.setSelectedItem(event)
    setDetailsDialogOpen(true)
  }

  const handleEditEvent = () => {
    setDetailsDialogOpen(false)
    dialog.setEditOpen(true)
  }

  const handleEventCreated = (newEvent: ScheduleEventData) => {
    setEvents((prev) => [...prev, newEvent].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ))
    dialog.setCreateOpen(false)
    setSelectedDate(null)
  }

  const handleEventUpdated = (updatedEvent: ScheduleEventData) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    )
    dialog.setEditOpen(false)
    dialog.setSelectedItem(null)
  }

  const handleEventDeleted = (deletedEventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== deletedEventId))
    setDetailsDialogOpen(false)
    dialog.setSelectedItem(null)
  }

  if (isLoading && events.length === 0) {
    return <ScheduleCalendarSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule</h2>
        <Button onClick={() => {
          setSelectedDate(new Date())
          dialog.setCreateOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-1" />
          Add Event
        </Button>
      </div>

      <Calendar
        events={events}
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
      />

      <EventDialog
        open={dialog.createOpen}
        onOpenChange={dialog.setCreateOpen}
        mode="create"
        defaultDate={selectedDate || undefined}
        onEventCreated={handleEventCreated}
      />

      {dialog.selectedItem && (
        <>
          <EventDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            event={dialog.selectedItem}
            onEdit={handleEditEvent}
            onDelete={handleEventDeleted}
          />
          <EventDialog
            open={dialog.editOpen}
            onOpenChange={dialog.setEditOpen}
            mode="edit"
            event={dialog.selectedItem}
            onEventUpdated={handleEventUpdated}
          />
        </>
      )}
    </div>
  )
}
