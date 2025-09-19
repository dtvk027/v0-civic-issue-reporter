"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Clock, User, X, Info, ExternalLink } from "lucide-react"
import type { Issue } from "@/lib/types"

interface SimpleMapProps {
  issues: Issue[]
}

export function SimpleMap({ issues }: SimpleMapProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [sortBy, setSortBy] = useState<"date" | "status" | "category">("date")

  const issuesWithLocation = issues.filter((issue) => issue.location_lat && issue.location_lng)
  const issuesWithoutLocation = issues.filter((issue) => !issue.location_lat || !issue.location_lng)

  const sortedIssues = [...issuesWithLocation].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "status":
        return a.status.localeCompare(b.status)
      case "category":
        return a.category.localeCompare(b.category)
      default:
        return 0
    }
  })

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

  const openInMaps = (lat: number, lng: number, title: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(title)}`
    window.open(url, "_blank")
  }

  return (
    <div className="h-full w-full space-y-4">
      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <div className="space-y-2">
            <p className="font-medium">Location-Based Issue Browser</p>
            <p className="text-sm">
              This simplified map view shows issues by location without requiring external map services. Click on any
              issue to view details or open in Google Maps.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by:</span>
          <div className="flex gap-1">
            {(["date", "status", "category"] as const).map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">{issuesWithLocation.length} issues with location</div>
      </div>

      {/* Issues Grid */}
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {sortedIssues.map((issue) => (
          <Card
            key={issue.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedIssue(issue)}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm line-clamp-2">{issue.title}</h4>
                  <Badge className={`text-xs ${getStatusColor(issue.status)} flex-shrink-0`}>
                    {issue.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{issue.description}</p>

                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {issue.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{issue.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {issue.location_lat && issue.location_lng && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 text-xs bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      openInMaps(issue.location_lat!, issue.location_lng!, issue.title)
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open in Maps
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Issues without location */}
      {issuesWithoutLocation.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-sm mb-2 text-muted-foreground">
            Issues without location ({issuesWithoutLocation.length})
          </h3>
          <div className="grid gap-2">
            {issuesWithoutLocation.slice(0, 5).map((issue) => (
              <Card key={issue.id} className="p-3 opacity-75">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{issue.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                        {issue.status.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">No location data</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-96 overflow-y-auto">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getCategoryIcon(selectedIssue.category)}</span>
                  <div>
                    <CardTitle className="text-lg line-clamp-2">{selectedIssue.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(selectedIssue.status)}>
                        {selectedIssue.status.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-muted-foreground capitalize">
                        {selectedIssue.category.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIssue(null)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{selectedIssue.description}</p>

              {selectedIssue.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedIssue.address}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Reported {new Date(selectedIssue.created_at).toLocaleDateString()}</span>
              </div>

              {selectedIssue.reporter && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>By {selectedIssue.reporter.full_name || "Anonymous"}</span>
                </div>
              )}

              {selectedIssue.assigned_staff && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Assigned to: </span>
                  <span className="font-medium">{selectedIssue.assigned_staff.full_name}</span>
                </div>
              )}

              {selectedIssue.location_lat && selectedIssue.location_lng && (
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() =>
                    openInMaps(selectedIssue.location_lat!, selectedIssue.location_lng!, selectedIssue.title)
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View in Google Maps
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
