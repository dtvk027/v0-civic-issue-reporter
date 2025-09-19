"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, User, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Issue } from "@/lib/types"

interface RecentIssuesTableProps {
  issues: Issue[]
}

export function RecentIssuesTable({ issues }: RecentIssuesTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pothole":
        return "🕳️"
      case "streetlight":
        return "💡"
      case "traffic_signal":
        return "🚦"
      case "sidewalk":
        return "🚶"
      case "graffiti":
        return "🎨"
      case "garbage":
        return "🗑️"
      case "water_leak":
        return "💧"
      default:
        return "⚠️"
    }
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent issues found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <span className="text-2xl">{getCategoryIcon(issue.category)}</span>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-foreground line-clamp-1">{issue.title}</h3>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(issue.status)}>{issue.status.replace("_", " ")}</Badge>
                <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                  {issue.priority}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{issue.description}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              {issue.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{issue.address}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(issue.created_at).toLocaleDateString()}</span>
              </div>
              {issue.reporter && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>By {issue.reporter.full_name || "Anonymous"}</span>
                </div>
              )}
            </div>

            {issue.assigned_staff && (
              <div className="text-sm mb-2">
                <span className="text-muted-foreground">Assigned to: </span>
                <span className="font-medium">{issue.assigned_staff.full_name}</span>
              </div>
            )}
          </div>

          <Link href={`/admin/issues/${issue.id}`}>
            <Button variant="outline" size="sm" className="bg-transparent">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ))}

      <div className="text-center pt-4">
        <Link href="/admin/issues">
          <Button variant="outline" className="bg-transparent">
            View All Issues
          </Button>
        </Link>
      </div>
    </div>
  )
}
