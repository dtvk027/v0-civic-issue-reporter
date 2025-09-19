"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { Issue } from "@/lib/types"

interface TimeSeriesChartProps {
  data: Issue[]
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  // Process data for time series
  const processedData = data.reduce(
    (acc, issue) => {
      const date = new Date(issue.created_at).toLocaleDateString()

      if (!acc[date]) {
        acc[date] = {
          date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          reported: 0,
          resolved: 0,
        }
      }

      acc[date].reported++

      if (issue.status === "resolved" && issue.resolved_at) {
        const resolvedDate = new Date(issue.resolved_at).toLocaleDateString()
        if (acc[resolvedDate]) {
          acc[resolvedDate].resolved++
        }
      }

      return acc
    },
    {} as Record<string, { date: string; reported: number; resolved: number }>,
  )

  const chartData = Object.values(processedData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="reported" stroke="#3b82f6" strokeWidth={2} name="Issues Reported" />
        <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="Issues Resolved" />
      </LineChart>
    </ResponsiveContainer>
  )
}
