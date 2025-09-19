"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, User, MessageSquare, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { LiveIssueUpdates } from "@/components/live-issue-updates"
import type { Issue, IssueUpdate, Profile } from "@/lib/types"

interface IssueDetailViewProps {
  issue: Issue & {
    reporter: Profile
    assigned_staff?: Profile
  }
  updates: (IssueUpdate & { user: Profile })[]
  staffMembers: Profile[]
}

export function IssueDetailView({ issue, updates, staffMembers }: IssueDetailViewProps) {
  const [status, setStatus] = useState(issue.status)
  const [assignedTo, setAssignedTo] = useState(issue.assigned_to || "unassigned")
  const [newUpdate, setNewUpdate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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

  const handleUpdateIssue = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Update issue
      const updateData: any = {
        status,
        assigned_to: assignedTo || null,
        updated_at: new Date().toISOString(),
      }

      if (status === "resolved" && issue.status !== "resolved") {
        updateData.resolved_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase.from("issues").update(updateData).eq("id", issue.id)

      if (updateError) throw updateError

      // Add update if there's a message
      if (newUpdate.trim()) {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { error: updateInsertError } = await supabase.from("issue_updates").insert({
            issue_id: issue.id,
            user_id: user.id,
            message: newUpdate.trim(),
            status: status !== issue.status ? status : undefined,
          })

          if (updateInsertError) throw updateInsertError
        }
      }

      toast({
        title: "Issue updated successfully",
        description: "The issue has been updated and notifications sent.",
      })

      setNewUpdate("")
      router.refresh()
    } catch (error) {
      console.error("Error updating issue:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update issue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/issues">
          <Button variant="outline" size="sm" className="bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
          <h1 className="text-2xl font-bold text-foreground">{issue.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>Issue Details</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(issue.status)}>{issue.status.replace("_", " ")}</Badge>
                  <Badge variant="outline">{issue.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{issue.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Category</h4>
                  <p className="text-sm text-muted-foreground capitalize">{issue.category.replace("_", " ")}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Priority</h4>
                  <p className="text-sm text-muted-foreground capitalize">{issue.priority}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Reported</h4>
                  <p className="text-sm text-muted-foreground">{new Date(issue.created_at).toLocaleDateString()}</p>
                </div>
                {issue.resolved_at && (
                  <div>
                    <h4 className="font-medium mb-1">Resolved</h4>
                    <p className="text-sm text-muted-foreground">{new Date(issue.resolved_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {issue.address && (
                <div>
                  <h4 className="font-medium mb-1">Location</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{issue.address}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Updates & Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LiveIssueUpdates issueId={issue.id} initialUpdates={updates} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Reporter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">{issue.reporter.full_name || "Anonymous"}</span>
                </div>
                <div className="text-sm text-muted-foreground">{issue.reporter.email}</div>
                {issue.reporter.phone && <div className="text-sm text-muted-foreground">{issue.reporter.phone}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Assign To</label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.full_name || staff.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Add Update</label>
                <Textarea
                  placeholder="Add a comment or update..."
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleUpdateIssue} disabled={isLoading} className="w-full">
                {isLoading ? (
                  "Updating..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Issue
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
