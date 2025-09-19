import { requireStaffAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, TrendingUp, BarChart3, PieChart, Calendar } from "lucide-react"
import Link from "next/link"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { PerformanceMetrics } from "@/components/performance-metrics"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { TimeSeriesChart } from "@/components/time-series-chart"

interface SearchParams {
  period?: string
  category?: string
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireStaffAuth()
  const params = await searchParams
  const supabase = await createClient()

  // Calculate date range based on period
  const period = params.period || "30d"
  const now = new Date()
  const startDate = new Date()

  switch (period) {
    case "7d":
      startDate.setDate(now.getDate() - 7)
      break
    case "30d":
      startDate.setDate(now.getDate() - 30)
      break
    case "90d":
      startDate.setDate(now.getDate() - 90)
      break
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1)
      break
    default:
      startDate.setDate(now.getDate() - 30)
  }

  // Get analytics data
  const [
    { data: allIssues },
    { data: periodIssues },
    { data: resolvedIssues },
    { data: categoryStats },
    { data: staffPerformance },
    { data: timeSeriesData },
  ] = await Promise.all([
    supabase.from("issues").select("*"),
    supabase.from("issues").select("*").gte("created_at", startDate.toISOString()),
    supabase.from("issues").select("*").eq("status", "resolved").gte("created_at", startDate.toISOString()),
    supabase.from("issues").select("category, status, priority, created_at").gte("created_at", startDate.toISOString()),
    supabase
      .from("issues")
      .select(`
        assigned_to,
        status,
        resolved_at,
        created_at,
        assigned_staff:profiles!assigned_to(full_name)
      `)
      .not("assigned_to", "is", null)
      .gte("created_at", startDate.toISOString()),
    supabase
      .from("issues")
      .select("created_at, status, resolved_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true }),
  ])

  // Calculate metrics
  const totalIssues = allIssues?.length || 0
  const periodIssuesCount = periodIssues?.length || 0
  const resolvedCount = resolvedIssues?.length || 0
  const resolutionRate = periodIssuesCount > 0 ? Math.round((resolvedCount / periodIssuesCount) * 100) : 0

  // Calculate average resolution time
  const resolvedWithTime = resolvedIssues?.filter((issue) => issue.resolved_at) || []
  const avgResolutionTime =
    resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((acc, issue) => {
          const created = new Date(issue.created_at)
          const resolved = new Date(issue.resolved_at!)
          return acc + (resolved.getTime() - created.getTime())
        }, 0) /
        resolvedWithTime.length /
        (1000 * 60 * 60 * 24) // Convert to days
      : 0

  // Process category data
  const categoryBreakdown =
    categoryStats?.reduce(
      (acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Process staff performance
  const staffStats =
    staffPerformance?.reduce(
      (acc, issue) => {
        const staffName = issue.assigned_staff?.full_name || "Unassigned"
        if (!acc[staffName]) {
          acc[staffName] = { total: 0, resolved: 0 }
        }
        acc[staffName].total++
        if (issue.status === "resolved") {
          acc[staffName].resolved++
        }
        return acc
      },
      {} as Record<string, { total: number; resolved: number }>,
    ) || {}

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics & Reporting</h1>
              <p className="text-muted-foreground">Comprehensive insights into civic issue management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue={period}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues Reported</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{periodIssuesCount}</div>
              <p className="text-xs text-muted-foreground">
                {period === "7d"
                  ? "Last 7 days"
                  : period === "30d"
                    ? "Last 30 days"
                    : period === "90d"
                      ? "Last 90 days"
                      : "Last year"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {resolvedCount} of {periodIssuesCount} resolved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {avgResolutionTime > 0 ? `${Math.round(avgResolutionTime)}d` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Average days to resolve</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <PieChart className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalIssues}</div>
              <p className="text-xs text-muted-foreground">All time reports</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Time Series Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Issue Trends Over Time</CardTitle>
              <CardDescription>Daily issue reports and resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={timeSeriesData || []} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Issues by Category</CardTitle>
              <CardDescription>Distribution of issue types</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBreakdown data={categoryBreakdown} />
            </CardContent>
          </Card>

          {/* Staff Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>Resolution rates by staff member</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMetrics data={staffStats} />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="mt-8">
          <AnalyticsCharts issues={periodIssues || []} period={period} />
        </div>
      </div>
    </div>
  )
}
