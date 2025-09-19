"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Clock } from "lucide-react"
import { realtimeManager } from "@/lib/realtime"
import type { IssueUpdate, Profile } from "@/lib/types"

interface LiveIssueUpdatesProps {
  issueId: string
  initialUpdates: (IssueUpdate & { user: Profile })[]
}

export function LiveIssueUpdates({ issueId, initialUpdates }: LiveIssueUpdatesProps) {
  const [updates, setUpdates] = useState<(IssueUpdate & { user: Profile })[]>(initialUpdates)

  useEffect(() => {
    // Subscribe to real-time updates for this issue
    const channel = realtimeManager.subscribeToIssueUpdates(issueId, (payload) => {
      console.log("[v0] Issue update received:", payload)

      if (payload.eventType === "INSERT") {
        // For new updates, we need to fetch the user data
        // In a real app, you might want to include user data in the payload
        const newUpdate = payload.new as IssueUpdate

        // Add the new update with placeholder user data
        // In production, you'd fetch the user data or include it in the trigger
        setUpdates((prev) => [
          {
            ...newUpdate,
            user: { full_name: "System", email: "system@example.com" } as Profile,
          },
          ...prev,
        ])
      }
    })

    return () => {
      realtimeManager.unsubscribe(`issue-updates-${issueId}`)
    }
  }, [issueId])

  return (
    <div className="space-y-4">
      {updates.length > 0 ? (
        updates.map((update) => (
          <Card key={update.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{update.user.full_name || "Anonymous"}</span>
                <span className="text-xs text-muted-foreground">{new Date(update.created_at).toLocaleString()}</span>
                {update.status && (
                  <Badge variant="outline" className="text-xs">
                    Status: {update.status.replace("_", " ")}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{update.message}</p>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No updates yet</p>
        </div>
      )}
    </div>
  )
}
