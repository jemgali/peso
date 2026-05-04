"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  CircleX,
  ClipboardList,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { NotificationItem } from "@/lib/validations/application-review"

const CLIENT_DASHBOARD_ROUTE = "/protected/client"
const CLIENT_STATUS_ROUTE = "/protected/client/application/status"

function formatNotificationDate(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getNotificationIcon(type: string) {
  if (type.includes("approved")) return CircleCheck
  if (type.includes("rejected")) return CircleX
  if (type.includes("revision")) return CircleAlert
  if (type.includes("schedule")) return CalendarDays
  if (type.includes("batch")) return ClipboardList
  return Bell
}

function resolveNotificationTarget(notification: NotificationItem): string {
  if (notification.link) return notification.link

  const type = notification.type.toLowerCase()
  if (type.includes("schedule")) return CLIENT_DASHBOARD_ROUTE

  const message = notification.message.toLowerCase()
  if (message.includes("schedule")) return CLIENT_DASHBOARD_ROUTE

  return CLIENT_STATUS_ROUTE
}

export default function DashboardNotifications() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  )

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      const data = await response.json()
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: "PATCH" })
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead
    )

    if (unreadNotifications.length === 0) {
      return
    }

    await Promise.all(
      unreadNotifications.map((notification) =>
        fetch(`/api/notifications/${notification.notificationId}`, {
          method: "PATCH",
        })
      )
    )

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    )
    setUnreadCount(0)
  }

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification.notificationId)
    }

    router.push(resolveNotificationTarget(notification))
  }

  return (
    <Card className="min-h-0">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-muted-foreground" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              All updates from PESO. Open item to view related page.
            </CardDescription>
          </div>
        </div>
        <CardAction className="flex items-center gap-2">
          <Badge variant="secondary">{unreadCount} unread</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck data-icon="inline-start" />
            Mark all read
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : sortedNotifications.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bell />
              </EmptyMedia>
              <EmptyTitle>No notifications yet</EmptyTitle>
              <EmptyDescription>
                New announcements and updates will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="max-h-[65vh]">
            <div className="flex flex-col gap-2 pr-3">
              {sortedNotifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(notification.type)

                return (
                  <button
                    key={notification.notificationId}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40",
                      !notification.isRead && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <NotificationIcon className="size-4" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex items-start gap-2">
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            !notification.isRead && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="shrink-0">
                            New
                          </Badge>
                        )}
                        <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
                      </div>

                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        <span>{formatNotificationDate(notification.createdAt)}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
