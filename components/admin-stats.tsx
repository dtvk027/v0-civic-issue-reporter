"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp } from "lucide-react"

interface AdminStatsProps {
  totalIssues: number
  resolvedCount: number
  pendingCount: number
  inProgressCount: number
}

export function AdminStats({ totalIssues, resolvedCount, pendingCount, inProgressCount }: AdminStatsProps) {
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0
  const activeIssues = pendingCount + inProgressCount
  const workloadPercentage = totalIssues > 0 ? Math.round((activeIssues / totalIssues) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Resolution Rate</span>
            <span className="text-sm text-muted-foreground">{resolutionRate}%</span>
          </div>
          <Progress value={resolutionRate} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {resolvedCount} of {totalIssues} issues resolved
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Active Workload</span>
            <span className="text-sm text-muted-foreground">{workloadPercentage}%</span>
          </div>
          <Progress value={workloadPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{activeIssues} issues need attention</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{inProgressCount}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
