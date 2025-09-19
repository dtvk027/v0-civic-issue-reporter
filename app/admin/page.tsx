import { requireStaffAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, AlertTriangle, Clock, TrendingUp, MapPin, Settings } from "lucide-react"
import Link from "next/link"
import { AdminStats } from "@/components/admin-stats"
import { RecentIssuesTable } from "@/components/recent-issues-table"
import { LiveStats } from "@/components/live-stats"
import { NotificationCenter } from "@/components/notification-center"

export default async function AdminDashboard() {
  const profile = await requireStaffAuth()
  const supabase = await createClient()

  // Get dashboard statistics
  const [
    { data: allIssues },
    { data: pendingIssues },
    { data: inProgressIssues },
    { data: resolvedIssues },
    { data: recentIssues },
    { data: staffMembers },
    { data: notifications },
  ] = await Promise.all([
    supabase.from("issues").select("*"),
    supabase.from("issues").select("*").eq("status", "pending"),
    supabase.from("issues").select("*").eq("status", "in_progress"),
    supabase.from("issues").select("*").eq("status", "resolved"),
    supabase
      .from("issues")
      .select(`
      *,
      reporter:profiles!reporter_id(full_name),
      assigned_staff:profiles!assigned_to(full_name)
    `)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("profiles").select("*").in("role", ["staff", "admin"]),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  // Calculate statistics
  const totalIssues = allIssues?.length || 0
  const pendingCount = pendingIssues?.length || 0
  const inProgressCount = inProgressIssues?.length || 0
  const resolvedCount = resolvedIssues?.length || 0
  const staffCount = staffMembers?.length || 0

  // Calculate resolution rate
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile.full_name || profile.email} • {profile.department || "Municipal Staff"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter userId={profile.id} initialNotifications={notifications || []} />
            <Link href="/admin/issues">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <AlertTriangle className="h-4 w-4" />
                Manage Issues
              </Button>
            </Link>
            <Link href="/admin/staff">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Users className="h-4 w-4" />
                Staff Management
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <LiveStats
            initialStats={{
              total: totalIssues,
              pending: pendingCount,
              inProgress: inProgressCount,
              resolved: resolvedCount,
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
                <CardDescription>Latest reports requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentIssuesTable issues={recentIssues || []} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/admin/issues?status=pending">
                    <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Review Pending</div>
                          <div className="text-sm text-muted-foreground">{pendingCount} issues</div>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/admin/issues?status=in_progress">
                    <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Track Progress</div>
                          <div className="text-sm text-muted-foreground">{inProgressCount} active</div>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/map">
                    <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">View Map</div>
                          <div className="text-sm text-muted-foreground">Geographic view</div>
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/admin/staff">
                    <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Manage Staff</div>
                          <div className="text-sm text-muted-foreground">{staffCount} members</div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <AdminStats
              totalIssues={totalIssues}
              resolvedCount={resolvedCount}
              pendingCount={pendingCount}
              inProgressCount={inProgressCount}
            />

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notifications</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Map Services</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Connected</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
