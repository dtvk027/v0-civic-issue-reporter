import { getCurrentProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, AlertTriangle, Clock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const profile = await getCurrentProfile()
  const supabase = await createClient()

  // Get recent issues for the homepage
  const { data: recentIssues } = await supabase
    .from("issues")
    .select(`
      *,
      reporter:profiles!reporter_id(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(6)

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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">CivicReport</h1>
            </div>
            <div className="flex items-center gap-4">
              {profile ? (
                <>
                  <span className="text-sm text-muted-foreground">Welcome, {profile.full_name || profile.email}</span>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  {profile.role === "staff" || profile.role === "admin" ? (
                    <Link href="/admin">
                      <Button size="sm">Admin Portal</Button>
                    </Link>
                  ) : null}
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Report Civic Issues in Your Community</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Help make your city better by reporting potholes, broken streetlights, and other civic issues. Track
            progress and stay updated on fixes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/report">
              <Button size="lg" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Report an Issue
              </Button>
            </Link>
            <Link href="/map">
              <Button variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
                <MapPin className="h-5 w-5" />
                View Issue Map
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Issues */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground">Recent Issues</h3>
            <Link href="/issues">
              <Button variant="outline">View All Issues</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentIssues?.map((issue) => (
              <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                      <div>
                        <CardTitle className="text-lg line-clamp-1">{issue.title}</CardTitle>
                        <CardDescription className="capitalize">{issue.category.replace("_", " ")}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(issue.status)}>{issue.status.replace("_", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{issue.description}</p>
                  {issue.address && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{issue.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{recentIssues?.length || 0}</div>
              <div className="text-muted-foreground">Issues Reported</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {recentIssues?.filter((i) => i.status === "resolved").length || 0}
              </div>
              <div className="text-muted-foreground">Issues Resolved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {recentIssues?.filter((i) => i.status === "in_progress").length || 0}
              </div>
              <div className="text-muted-foreground">In Progress</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2024 CivicReport. Making communities better, one report at a time.</p>
        </div>
      </footer>
    </div>
  )
}
