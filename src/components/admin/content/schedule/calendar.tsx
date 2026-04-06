"use client"

import React from "react"
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
  Calendar as CalendarIcon,
} from "lucide-react"
import { Button } from "@/ui/button"
import { cn } from "@/lib/utils"
import {
  type ScheduleEventData,
  EVENT_TYPE_COLORS,
  type EventType,
} from "@/lib/validations/schedule-event"
import type { CalendarView } from "./index"

interface CalendarProps {
  events: ScheduleEventData[]
  currentDate: Date
  view: CalendarView
  onDateChange: (date: Date) => void
  onViewChange: (view: CalendarView) => void
  onDateClick: (date: Date) => void
  onEventClick: (event: ScheduleEventData) => void
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function isToday(date: Date) {
  return isSameDay(date, new Date())
}

function getWeekDates(date: Date) {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay())
  
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    dates.push(d)
  }
  return dates
}

function getHoursOfDay() {
  const hours = []
  for (let i = 0; i < 24; i++) {
    hours.push(i)
  }
  return hours
}

function formatHour(hour: number) {
  if (hour === 0) return "12 AM"
  if (hour === 12) return "12 PM"
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

export function Calendar({
  events,
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onDateClick,
  onEventClick,
}: CalendarProps) {
  const navigatePrev = () => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    onDateChange(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = event.endDate ? new Date(event.endDate) : eventStart
      
      const dateStart = new Date(date)
      dateStart.setHours(0, 0, 0, 0)
      const dateEnd = new Date(date)
      dateEnd.setHours(23, 59, 59, 999)
      
      return eventStart <= dateEnd && eventEnd >= dateStart
    })
  }

  const getEventsForHour = (date: Date, hour: number) => {
    return events.filter((event) => {
      if (event.allDay) return false
      const eventStart = new Date(event.startDate)
      return (
        isSameDay(eventStart, date) &&
        eventStart.getHours() === hour
      )
    })
  }

  const getAllDayEventsForDate = (date: Date) => {
    return events.filter((event) => {
      if (!event.allDay) return false
      const eventStart = new Date(event.startDate)
      return isSameDay(eventStart, date)
    })
  }

  const renderMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const daysInPrevMonth = getDaysInMonth(year, month - 1)

    const days = []
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const date = new Date(year, month - 1, day)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, isCurrentMonth: false })
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted">
          {DAYS.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium border-b">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map(({ date, isCurrentMonth }, index) => {
            const dayEvents = getEventsForDate(date)
            return (
              <div
                key={index}
                className={cn(
                  "min-h-24 p-1 border-b border-r cursor-pointer hover:bg-muted/50 transition-colors",
                  !isCurrentMonth && "bg-muted/20 text-muted-foreground"
                )}
                onClick={() => onDateClick(date)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                  isToday(date) && "bg-primary text-primary-foreground"
                )}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer",
                        EVENT_TYPE_COLORS[event.type as EventType]
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-1.5">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate)
    const hours = getHoursOfDay()

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Header with days */}
        <div className="grid grid-cols-8 bg-muted border-b">
          <div className="p-2 text-center text-sm font-medium border-r" />
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={cn(
                "p-2 text-center border-r cursor-pointer hover:bg-muted/80",
                isToday(date) && "bg-primary/10"
              )}
              onClick={() => onDateClick(date)}
            >
              <div className="text-xs text-muted-foreground">{DAYS[index]}</div>
              <div className={cn(
                "text-lg font-medium w-8 h-8 flex items-center justify-center rounded-full mx-auto",
                isToday(date) && "bg-primary text-primary-foreground"
              )}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* All-day events */}
        <div className="grid grid-cols-8 border-b bg-muted/30">
          <div className="p-1 text-xs text-muted-foreground border-r">All day</div>
          {weekDates.map((date, index) => {
            const allDayEvents = getAllDayEventsForDate(date)
            return (
              <div key={index} className="p-1 border-r min-h-8">
                {allDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer mb-0.5",
                      EVENT_TYPE_COLORS[event.type as EventType]
                    )}
                    onClick={() => onEventClick(event)}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Time slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b">
              <div className="p-1 text-xs text-muted-foreground border-r text-right pr-2">
                {formatHour(hour)}
              </div>
              {weekDates.map((date, index) => {
                const hourEvents = getEventsForHour(date, hour)
                return (
                  <div
                    key={index}
                    className="min-h-12 border-r p-0.5 cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      const clickDate = new Date(date)
                      clickDate.setHours(hour)
                      onDateClick(clickDate)
                    }}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer",
                          EVENT_TYPE_COLORS[event.type as EventType]
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const hours = getHoursOfDay()
    const allDayEvents = getAllDayEventsForDate(currentDate)

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted border-b p-3 text-center">
          <div className="text-sm text-muted-foreground">{DAYS[currentDate.getDay()]}</div>
          <div className={cn(
            "text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full mx-auto",
            isToday(currentDate) && "bg-primary text-primary-foreground"
          )}>
            {currentDate.getDate()}
          </div>
        </div>

        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div className="p-2 border-b bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">All day</div>
            <div className="space-y-1">
              {allDayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "text-sm px-2 py-1 rounded text-white cursor-pointer",
                    EVENT_TYPE_COLORS[event.type as EventType]
                  )}
                  onClick={() => onEventClick(event)}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(currentDate, hour)
            return (
              <div
                key={hour}
                className="flex border-b min-h-16 cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  const clickDate = new Date(currentDate)
                  clickDate.setHours(hour)
                  onDateClick(clickDate)
                }}
              >
                <div className="w-20 p-2 text-sm text-muted-foreground border-r text-right pr-3 flex-shrink-0">
                  {formatHour(hour)}
                </div>
                <div className="flex-1 p-1">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-sm px-2 py-1 rounded text-white cursor-pointer mb-1",
                        EVENT_TYPE_COLORS[event.type as EventType]
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-xs opacity-90 truncate">{event.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const getTitle = () => {
    if (view === "month") {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    } else if (view === "week") {
      const weekDates = getWeekDates(currentDate)
      const start = weekDates[0]
      const end = weekDates[6]
      if (start.getMonth() === end.getMonth()) {
        return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`
      }
      return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
    }
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
  }

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <h3 className="text-lg font-semibold ml-2">{getTitle()}</h3>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("month")}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("week")}
          >
            <CalendarRange className="h-4 w-4 mr-1" />
            Week
          </Button>
          <Button
            variant={view === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("day")}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Day
          </Button>
        </div>
      </div>

      {/* Calendar view */}
      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}
    </div>
  )
}
