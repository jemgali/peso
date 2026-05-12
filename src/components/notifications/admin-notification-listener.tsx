"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { BellIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface Notification {
  notificationId: string
  title: string
  message: string
  type: string
  link?: string
  isRead: boolean
  createdAt: string
}

export default function AdminNotificationListener() {
  const router = useRouter()
  const lastCheckedRef = useRef<Date>(new Date())

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const response = await fetch("/api/notifications?limit=5")
        const payload = await response.json()

        if (payload.success && payload.data.notifications) {
          const newNotifications = payload.data.notifications.filter(
            (n: Notification) => !n.isRead && new Date(n.createdAt) > lastCheckedRef.current
          )

          newNotifications.forEach((notification: Notification) => {
            const { link } = notification
            toast(notification.title, {
              description: notification.message,
              icon: <BellIcon className="size-4" />,
              action: link
                ? {
                    label: "View",
                    onClick: () => router.push(link),
                  }
                : undefined,
            })
          })

          if (payload.data.notifications.length > 0) {
            lastCheckedRef.current = new Date(payload.data.notifications[0].createdAt)
          }
        }
      } catch (error) {
        // Silent error to avoid annoying admin
      }
    }

    // Poll every 15 seconds
    const interval = setInterval(checkNotifications, 15000)
    return () => clearInterval(interval)
  }, [router])

  return null
}
