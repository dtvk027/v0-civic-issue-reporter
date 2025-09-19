import { requireAuth, getCurrentProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, Clock, Bell } from "lucide-react"
import Link from "next/link"
import { NotificationCenter } from "@/components/notification-center"

export default async function DashboardPage() {
  await requireAuth()
  const profile = await getCurrentProfile()
  const supabase = await createClient()

  // Get user's issues
  const { data: userIssues } = await supabase
    .from("issues")
    .select(`
      *,
      assigned_staff:profiles!assigned_to(full_name)
    `)
    .eq("reporter_id", profile?.id)
    .order("created_at", { ascending: false })

  // Get user's notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile?.id)
    .order("created_at", { ascending: false })
    .limit(10)

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || profile?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter userId={profile?.id || ""} initialNotifications={notifications || []} />
            <Link href="/report">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Report Issue
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userIssues?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {userIssues?.filter((i) => i.status === "in_progress").length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {userIssues?.filter((i) => i.status === "resolved").length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Reports</CardTitle>
                <CardDescription>Track the status of your submitted issues</CardDescription>
              </CardHeader>
              <CardContent>
                {userIssues && userIssues.length > 0 ? (
                  <div className="space-y-4">
                    {userIssues.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-foreground line-clamp-1">{issue.title}</h3>
                            <Badge className={getStatusColor(issue.status)}>{issue.status.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{issue.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't reported any issues yet.</p>
                    <Link href="/report">
                      <Button>Report Your First Issue</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/report" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Report New Issue
                  </Button>
                </Link>
                <Link href="/map" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Issue Map
                  </Button>
                </Link>
                <Link href="/issues" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Clock className="h-4 w-4 mr-2" />
                    Browse All Issues
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
