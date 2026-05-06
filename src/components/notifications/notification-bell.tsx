"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import {
  Bell,
  Loader2,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Mail,
  MoreHorizontal,
  Clock,
  ArrowRight,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type {
  NotificationItem,
  NotificationType,
} from "@/lib/validations/application-review";

const NOTIFICATION_ICONS: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }> }
> = {
  application_approved: { icon: CheckCircle2 },
  application_revision: { icon: AlertCircle },
  application_rejected: { icon: XCircle },
  batch_available: { icon: FileText },
};

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=10");
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }

    if (notification.link) {
      router.push(notification.link);
    }

    setIsOpen(false);
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      await Promise.all(
        unreadNotifications.map((n) =>
          fetch(`/api/notifications/${n.notificationId}`, { method: "PATCH" }),
        ),
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const isClientArea = pathname.startsWith("/protected/client");

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative size-9 rounded-full transition-all",
          isOpen && "bg-muted",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="size-[1.2rem]" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full z-50 mt-2 w-80 md:w-[360px] overflow-hidden border-none shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
            <h3 className="text-sm font-bold">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] font-semibold"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="mr-1.5 size-3" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 rounded-full bg-muted p-3">
                  <Bell className="size-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No notifications yet
                </p>
                <p className="text-xs text-muted-foreground/60">
                  We'll notify you when something happens.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.slice(0, 10).map((notification) => {
                  const config = NOTIFICATION_ICONS[notification.type];
                  const Icon = config?.icon || Mail;

                  return (
                    <button
                      key={notification.notificationId}
                      className={cn(
                        "group relative flex w-full gap-4 px-4 py-4 text-left transition-all hover:bg-muted/50",
                        !notification.isRead && "bg-primary/2",
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-full border bg-background text-foreground transition-colors group-hover:border-primary/20 group-hover:text-primary",
                          !notification.isRead &&
                            "border-primary/10 text-primary bg-primary/5",
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm font-bold leading-none",
                              !notification.isRead
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="size-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                          <Clock className="size-3" />
                          {new Date(notification.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {isClientArea && notifications.length > 0 && (
            <div className="border-t bg-muted/10 p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/protected/client/announcements");
                }}
              >
                View all activities
                <ArrowRight className="ml-2 size-3" />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default NotificationBell;
