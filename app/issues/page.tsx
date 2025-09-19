import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, User, Search } from "lucide-react"
import Link from "next/link"
import { IssueFilters } from "@/components/issue-filters"

interface SearchParams {
  search?: string
  category?: string
  status?: string
  priority?: string
}

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query based on search params
  let query = supabase.from("issues").select(`
      *,
      reporter:profiles!reporter_id(full_name),
      assigned_staff:profiles!assigned_to(full_name)
    `)

  // Apply filters
  if (params.category) {
    query = query.eq("category", params.category)
  }
  if (params.status) {
    query = query.eq("status", params.status)
  }
  if (params.priority) {
    query = query.eq("priority", params.priority)
  }
  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,description.ilike.%${params.search}%,address.ilike.%${params.search}%`,
    )
  }

  const { data: issues } = await query.order("created_at", { ascending: false })

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">All Issues</h1>
            <p className="text-muted-foreground">Browse and search through all reported civic issues</p>
          </div>
          <div className="flex gap-2">
            <Link href="/map">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <MapPin className="h-4 w-4" />
                View Map
              </Button>
            </Link>
            <Link href="/report">
              <Button className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Report Issue
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <IssueFilters />

        {/* Results */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{issues?.length || 0} issues found</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues?.map((issue) => (
              <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                      <div>
                        <CardTitle className="text-lg line-clamp-1">{issue.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(issue.status)}>{issue.status.replace("_", " ")}</Badge>
                          <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>

                  {issue.address && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{issue.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>

                  {issue.reporter && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>By {issue.reporter.full_name || "Anonymous"}</span>
                    </div>
                  )}

                  {issue.assigned_staff && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Assigned to: </span>
                      <span className="font-medium">{issue.assigned_staff.full_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {(!issues || issues.length === 0) && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No issues found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
              <Link href="/report">
                <Button>Report the First Issue</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
