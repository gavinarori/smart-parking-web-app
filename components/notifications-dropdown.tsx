"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Notification } from "@/lib/types"
import { Bell, Clock, MapPin, CreditCard, Settings, Check } from "lucide-react"

interface NotificationsDropdownProps {
  userId: string
}

export function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load notifications from localStorage (in real app, this would be API call)
    const storedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const userNotifications = storedNotifications
      .filter((n: Notification) => n.userId === userId)
      .map((n: Notification) => ({
        ...n,
        createdAt: new Date(n.createdAt),
      }))
      .sort((a: Notification, b: Notification) => b.createdAt.getTime() - a.createdAt.getTime())

    setNotifications(userNotifications)
    setUnreadCount(userNotifications.filter((n: Notification) => !n.read).length)

    // Generate some mock notifications if none exist
    if (userNotifications.length === 0) {
      const mockNotifications: Notification[] = [
        {
          id: "notif-1",
          userId,
          type: "reservation_reminder",
          title: "Reservation Reminder",
          message: "Your parking reservation at Downtown Plaza starts in 30 minutes",
          read: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        },
        {
          id: "notif-2",
          userId,
          type: "slot_available",
          title: "Parking Available",
          message: "A parking spot just became available at Shopping Center",
          read: false,
          createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        },
        {
          id: "notif-3",
          userId,
          type: "payment_due",
          title: "Payment Confirmation",
          message: "Payment of $12.50 processed successfully for your reservation",
          read: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
      ]

      localStorage.setItem("notifications", JSON.stringify(mockNotifications))
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter((n) => !n.read).length)
    }
  }, [userId])

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    setNotifications(updatedNotifications)
    setUnreadCount(updatedNotifications.filter((n) => !n.read).length)

    // Update localStorage
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const updatedAllNotifications = allNotifications.map((n: Notification) =>
      n.id === notificationId ? { ...n, read: true } : n,
    )
    localStorage.setItem("notifications", JSON.stringify(updatedAllNotifications))
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updatedNotifications)
    setUnreadCount(0)

    // Update localStorage
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const updatedAllNotifications = allNotifications.map((n: Notification) =>
      n.userId === userId ? { ...n, read: true } : n,
    )
    localStorage.setItem("notifications", JSON.stringify(updatedAllNotifications))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reservation_reminder":
        return <Clock className="h-4 w-4 text-primary" />
      case "slot_available":
        return <MapPin className="h-4 w-4 text-secondary" />
      case "payment_due":
        return <CreditCard className="h-4 w-4 text-accent" />
      case "system_update":
        return <Settings className="h-4 w-4 text-muted-foreground" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-0 focus:bg-transparent"
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div
                  className={`w-full p-3 rounded-sm ${
                    !notification.read ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.title}</p>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
