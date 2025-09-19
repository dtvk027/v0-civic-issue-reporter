"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import type { Issue } from "@/lib/types"

interface AnalyticsChartsProps {
  issues: Issue[]
  period: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export function AnalyticsCharts({ issues, period }: AnalyticsChartsProps) {
  // Process data for charts
  const statusData = issues.reduce(
    (acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const priorityData = issues.reduce(
    (acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = issues.reduce(
    (acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to chart format
  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    name: status.replace("_", " "),
    value: count,
    fill:
      status === "resolved"
        ? "#22c55e"
        : status === "in_progress"
          ? "#3b82f6"
          : status === "pending"
            ? "#eab308"
            : "#6b7280",
  }))

  const priorityChartData = Object.entries(priorityData).map(([priority, count]) => ({
    name: priority,
    count,
    fill:
      priority === "urgent"
        ? "#ef4444"
        : priority === "high"
          ? "#f97316"
          : priority === "medium"
            ? "#3b82f6"
            : "#6b7280",
  }))

  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category.replace("_", " "),
    count,
  }))

  // Daily trend data
  const dailyData = issues.reduce(
    (acc, issue) => {
      const date = new Date(issue.created_at).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const trendData = Object.entries(dailyData)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      issues: count,
    }))

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current status of all issues</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>Issues by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Category Analysis</CardTitle>
            <CardDescription>Most common issue types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Reporting Trend</CardTitle>
            <CardDescription>Issues reported per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="issues" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Key insights from the data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(categoryData).reduce((a, b) => Math.max(a, b), 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Most Common:{" "}
                {Object.entries(categoryData)
                  .reduce((a, b) => (categoryData[a[0]] > categoryData[b[0]] ? a : b))[0]
                  .replace("_", " ")}
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(((statusData.resolved || 0) / issues.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Resolution Rate</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{statusData.pending || 0}</div>
              <div className="text-sm text-muted-foreground">Pending Issues</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(issues.length / Object.keys(dailyData).length) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg Daily Reports</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
