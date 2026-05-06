"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  CircleX,
  ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { NotificationListSkeleton } from "@/components/ui/skeletons";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/lib/validations/application-review";

const CLIENT_DASHBOARD_ROUTE = "/protected/client";
const CLIENT_STATUS_ROUTE = "/protected/client/application/status";

function formatNotificationDate(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNotificationIcon(type: string) {
  if (type.includes("approved")) return CircleCheck;
  if (type.includes("rejected")) return CircleX;
  if (type.includes("revision")) return CircleAlert;
  if (type.includes("schedule")) return CalendarDays;
  if (type.includes("batch")) return ClipboardList;
  return Bell;
}

function resolveNotificationTarget(notification: NotificationItem): string {
  const type = notification.type.toLowerCase();
  const message = notification.message.toLowerCase();
  const isSchedule = type.includes("schedule") || message.includes("schedule");

  // On the announcements page, clicking a scheduled event notification should take you to the dashboard
  if (isSchedule) return CLIENT_DASHBOARD_ROUTE;

  if (notification.link) return notification.link;
  return CLIENT_STATUS_ROUTE;
}

export default function DashboardNotifications() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead,
    );

    if (unreadNotifications.length === 0) {
      return;
    }

    await Promise.all(
      unreadNotifications.map((notification) =>
        fetch(`/api/notifications/${notification.notificationId}`, {
          method: "PATCH",
        }),
      ),
    );

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }

    router.push(resolveNotificationTarget(notification));
  };

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
          <NotificationListSkeleton />
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
          <div className="flex flex-col gap-2">
            {sortedNotifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification.notificationId}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all duration-200",
                    !notification.isRead
                      ? "border-primary/20 bg-primary/2 shadow-sm ring-1 ring-primary/5"
                      : "bg-background hover:bg-muted/30",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm border transition-colors",
                      !notification.isRead
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border",
                    )}
                  >
                    <NotificationIcon className="size-6" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-0.5">
                        <p
                          className={cn(
                            "text-base font-bold tracking-tight",
                            !notification.isRead
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          <CalendarDays className="size-3" />
                          <span>
                            {formatNotificationDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!notification.isRead && (
                          <Badge
                            variant="default"
                            className="h-5 px-1.5 text-[10px] font-black uppercase"
                          >
                            New
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full hover:bg-primary/10 hover:text-primary"
                          onClick={() =>
                            handleNotificationClick(notification)
                          }
                        >
                          <ArrowUpRight className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pr-4">
                        {notification.message}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs font-bold text-primary hover:no-underline group"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        View Details
                        <ArrowUpRight className="ml-1 size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Button>
                      {!notification.isRead && (
                        <>
                          <div className="size-1 rounded-full bg-muted-foreground/30" />
                          <Button
                            variant="link"
                            className="h-auto p-0 text-xs font-bold text-muted-foreground hover:text-foreground hover:no-underline"
                            onClick={() =>
                              markAsRead(notification.notificationId)
                            }
                          >
                            Mark as read
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
