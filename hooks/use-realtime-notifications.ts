"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { realtimeManager } from "@/lib/realtime"
import { toast } from "@/hooks/use-toast"
import type { Notification } from "@/lib/types"

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const loadNotifications = async () => {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20)

        if (error) throw error

        setNotifications(data || [])
        setUnreadCount(data?.filter((n) => !n.read).length || 0)
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()

    // Subscribe to real-time updates
    const channel = realtimeManager.subscribeToNotifications(userId, (payload) => {
      if (payload.eventType === "INSERT") {
        const newNotification = payload.new as Notification
        setNotifications((prev) => [newNotification, ...prev.slice(0, 19)])
        setUnreadCount((prev) => prev + 1)

        // Show toast notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
        })
      } else if (payload.eventType === "UPDATE") {
        const updatedNotification = payload.new as Notification
        setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))

        if (updatedNotification.read && !payload.old.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      } else if (payload.eventType === "DELETE") {
        const deletedNotification = payload.old as Notification
        setNotifications((prev) => prev.filter((n) => n.id !== deletedNotification.id))

        if (!deletedNotification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      }
    })

    return () => {
      realtimeManager.unsubscribe(`notifications-${userId}`)
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

      if (error) throw error
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  const markAllAsRead = async () => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) throw error
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  }

  const deleteNotification = async (notificationId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw error
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
