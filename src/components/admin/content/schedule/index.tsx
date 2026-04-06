"use client"

import React, { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"
import { Calendar } from "./calendar"
import { EventDialog } from "./event-dialog"
import { EventDetailsDialog } from "./event-details-dialog"
import {
  type ScheduleEventData,
} from "@/lib/validations/schedule-event"

export type CalendarView = "month" | "week" | "day"

export default function Schedule() {
  const [events, setEvents] = useState<ScheduleEventData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>("month")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEventData | null>(null)
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
    setCreateDialogOpen(true)
  }

  const handleEventClick = (event: ScheduleEventData) => {
    setSelectedEvent(event)
    setDetailsDialogOpen(true)
  }

  const handleEditEvent = () => {
    setDetailsDialogOpen(false)
    setEditDialogOpen(true)
  }

  const handleEventCreated = (newEvent: ScheduleEventData) => {
    setEvents((prev) => [...prev, newEvent].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ))
    setCreateDialogOpen(false)
    setSelectedDate(null)
  }

  const handleEventUpdated = (updatedEvent: ScheduleEventData) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    )
    setEditDialogOpen(false)
    setSelectedEvent(null)
  }

  const handleEventDeleted = (deletedEventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== deletedEventId))
    setDetailsDialogOpen(false)
    setSelectedEvent(null)
  }

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schedule</h2>
        <Button onClick={() => {
          setSelectedDate(new Date())
          setCreateDialogOpen(true)
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
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        defaultDate={selectedDate || undefined}
        onEventCreated={handleEventCreated}
      />

      {selectedEvent && (
        <>
          <EventDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            event={selectedEvent}
            onEdit={handleEditEvent}
            onDelete={handleEventDeleted}
          />
          <EventDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            mode="edit"
            event={selectedEvent}
            onEventUpdated={handleEventUpdated}
          />
        </>
      )}
    </div>
  )
}
