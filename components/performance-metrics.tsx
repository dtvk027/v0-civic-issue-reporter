"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface PerformanceMetricsProps {
  data: Record<string, { total: number; resolved: number }>
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const staffData = Object.entries(data)
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      resolved: stats.resolved,
      rate: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.rate - a.rate)

  return (
    <div className="space-y-4">
      {staffData.length > 0 ? (
        staffData.map((staff) => (
          <div key={staff.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{staff.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {staff.resolved}/{staff.total}
                </Badge>
                <span className="text-sm text-muted-foreground">{staff.rate}%</span>
              </div>
            </div>
            <Progress value={staff.rate} className="h-2" />
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No staff performance data available</p>
        </div>
      )}
    </div>
  )
}
