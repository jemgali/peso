"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Bell, Loader2, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NotificationItem, NotificationType } from "@/lib/validations/application-review";

const NOTIFICATION_ICONS: Record<NotificationType, { icon: string; color: string }> = {
  application_approved: { icon: "🎉", color: "text-green-600" },
  application_revision: { icon: "⚠️", color: "text-orange-600" },
  application_rejected: { icon: "❌", color: "text-red-600" },
};

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
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
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }

    if (notification.link) {
      router.push(notification.link);
    }

    setIsOpen(false);
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    await Promise.all(
      unreadNotifications.map((n) =>
        fetch(`/api/notifications/${n.notificationId}`, { method: "PATCH" })
      )
    );

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 md:w-96 max-h-96 overflow-hidden shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-72">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 10).map((notification) => {
                  const config = NOTIFICATION_ICONS[notification.type];
                  return (
                    <button
                      key={notification.notificationId}
                      className={cn(
                        "w-full p-3 text-left hover:bg-muted/50 transition-colors flex gap-3 border-b last:border-b-0",
                        !notification.isRead && "bg-blue-50 dark:bg-blue-950/20"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span className="text-xl shrink-0">{config?.icon || "📬"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              !notification.isRead && "font-semibold"
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="text-xs">
                View all notifications
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default NotificationBell;
