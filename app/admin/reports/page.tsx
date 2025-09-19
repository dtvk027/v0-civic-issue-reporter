import { requireStaffAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, Calendar, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default async function ReportsPage() {
  await requireStaffAuth()
  const supabase = await createClient()

  // Get data for reports
  const [{ data: allIssues }, { data: monthlyIssues }, { data: weeklyIssues }, { data: staffMembers }] =
    await Promise.all([
      supabase.from("issues").select("*"),
      supabase
        .from("issues")
        .select("*")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("issues")
        .select("*")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("profiles").select("*").in("role", ["staff", "admin"]),
    ])

  const reports = [
    {
      id: "weekly-summary",
      title: "Weekly Summary Report",
      description: "Overview of issues reported and resolved in the past 7 days",
      icon: Calendar,
      data: {
        total: weeklyIssues?.length || 0,
        resolved: weeklyIssues?.filter((i) => i.status === "resolved").length || 0,
        pending: weeklyIssues?.filter((i) => i.status === "pending").length || 0,
      },
      period: "Last 7 days",
    },
    {
      id: "monthly-performance",
      title: "Monthly Performance Report",
      description: "Detailed analysis of issue resolution and staff performance",
      icon: TrendingUp,
      data: {
        total: monthlyIssues?.length || 0,
        resolved: monthlyIssues?.filter((i) => i.status === "resolved").length || 0,
        pending: monthlyIssues?.filter((i) => i.status === "pending").length || 0,
      },
      period: "Last 30 days",
    },
    {
      id: "staff-productivity",
      title: "Staff Productivity Report",
      description: "Individual staff member performance and workload analysis",
      icon: Users,
      data: {
        total: staffMembers?.length || 0,
        active: staffMembers?.filter((s) => s.role === "staff").length || 0,
        admins: staffMembers?.filter((s) => s.role === "admin").length || 0,
      },
      period: "Current period",
    },
    {
      id: "comprehensive-audit",
      title: "Comprehensive Audit Report",
      description: "Complete system overview with all metrics and trends",
      icon: FileText,
      data: {
        total: allIssues?.length || 0,
        resolved: allIssues?.filter((i) => i.status === "resolved").length || 0,
        pending: allIssues?.filter((i) => i.status === "pending").length || 0,
      },
      period: "All time",
    },
  ]

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
              <h1 className="text-3xl font-bold text-foreground">Reports</h1>
              <p className="text-muted-foreground">Generate and download comprehensive reports</p>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const Icon = report.icon
            const resolutionRate =
              report.data.total > 0 ? Math.round((report.data.resolved / report.data.total) * 100) : 0

            return (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="mt-1">{report.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Period:</span>
                    <Badge variant="outline">{report.period}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{report.data.total}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{report.data.resolved}</div>
                      <div className="text-xs text-muted-foreground">Resolved</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">{report.data.pending}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                  </div>

                  {report.id !== "staff-productivity" && (
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Resolution Rate</div>
                      <div className="text-xl font-bold text-primary">{resolutionRate}%</div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Report Generation Statistics</CardTitle>
              <CardDescription>Overview of available data for reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{allIssues?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {allIssues?.filter((i) => i.status === "resolved").length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Resolved Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{staffMembers?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Staff Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(allIssues?.map((i) => i.category)).size || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Issue Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
