"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, TrendingUp, CheckCircle } from "lucide-react"
import { realtimeManager } from "@/lib/realtime"

interface LiveStatsProps {
  initialStats: {
    total: number
    pending: number
    inProgress: number
    resolved: number
  }
}

export function LiveStats({ initialStats }: LiveStatsProps) {
  const [stats, setStats] = useState(initialStats)

  useEffect(() => {
    // Subscribe to real-time issue changes
    const channel = realtimeManager.subscribeToIssues((payload) => {
      console.log("[v0] Issue stats update:", payload)

      // Update stats based on the change
      if (payload.eventType === "INSERT") {
        const newIssue = payload.new
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          pending: newIssue.status === "pending" ? prev.pending + 1 : prev.pending,
          inProgress: newIssue.status === "in_progress" ? prev.inProgress + 1 : prev.inProgress,
          resolved: newIssue.status === "resolved" ? prev.resolved + 1 : prev.resolved,
        }))
      } else if (payload.eventType === "UPDATE") {
        const oldIssue = payload.old
        const newIssue = payload.new

        if (oldIssue.status !== newIssue.status) {
          setStats((prev) => {
            const newStats = { ...prev }

            // Decrease old status count
            if (oldIssue.status === "pending") newStats.pending--
            else if (oldIssue.status === "in_progress") newStats.inProgress--
            else if (oldIssue.status === "resolved") newStats.resolved--

            // Increase new status count
            if (newIssue.status === "pending") newStats.pending++
            else if (newIssue.status === "in_progress") newStats.inProgress++
            else if (newIssue.status === "resolved") newStats.resolved++

            return newStats
          })
        }
      } else if (payload.eventType === "DELETE") {
        const deletedIssue = payload.old
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          pending: deletedIssue.status === "pending" ? prev.pending - 1 : prev.pending,
          inProgress: deletedIssue.status === "in_progress" ? prev.inProgress - 1 : prev.inProgress,
          resolved: deletedIssue.status === "resolved" ? prev.resolved - 1 : prev.resolved,
        }))
      }
    })

    return () => {
      realtimeManager.unsubscribe("issues")
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">All time reports</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">Awaiting assignment</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <p className="text-xs text-muted-foreground">Being worked on</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% resolution rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
