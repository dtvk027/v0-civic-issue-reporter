import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export class RealtimeManager {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()

  subscribeToIssues(callback: (payload: any) => void) {
    const channel = this.supabase
      .channel("issues-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "issues",
        },
        callback,
      )
      .subscribe()

    this.channels.set("issues", channel)
    return channel
  }

  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    const channel = this.supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        callback,
      )
      .subscribe()

    this.channels.set(`notifications-${userId}`, channel)
    return channel
  }

  subscribeToIssueUpdates(issueId: string, callback: (payload: any) => void) {
    const channel = this.supabase
      .channel(`issue-updates-${issueId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "issue_updates",
          filter: `issue_id=eq.${issueId}`,
        },
        callback,
      )
      .subscribe()

    this.channels.set(`issue-updates-${issueId}`, channel)
    return channel
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel, name) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

export const realtimeManager = new RealtimeManager()
