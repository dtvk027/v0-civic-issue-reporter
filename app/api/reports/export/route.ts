import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type")
    const format = searchParams.get("format") || "json"

    // Verify user has staff/admin access
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["staff", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Get report data based on type
    let reportData: any = {}
    const now = new Date()

    switch (reportType) {
      case "weekly":
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const { data: weeklyIssues } = await supabase
          .from("issues")
          .select(`
            *,
            reporter:profiles!reporter_id(full_name, email),
            assigned_staff:profiles!assigned_to(full_name, email)
          `)
          .gte("created_at", weekStart.toISOString())

        reportData = {
          title: "Weekly Summary Report",
          period: `${weekStart.toLocaleDateString()} - ${now.toLocaleDateString()}`,
          issues: weeklyIssues,
          summary: {
            total: weeklyIssues?.length || 0,
            resolved: weeklyIssues?.filter((i) => i.status === "resolved").length || 0,
            pending: weeklyIssues?.filter((i) => i.status === "pending").length || 0,
            inProgress: weeklyIssues?.filter((i) => i.status === "in_progress").length || 0,
          },
        }
        break

      case "monthly":
        const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const { data: monthlyIssues } = await supabase
          .from("issues")
          .select(`
            *,
            reporter:profiles!reporter_id(full_name, email),
            assigned_staff:profiles!assigned_to(full_name, email)
          `)
          .gte("created_at", monthStart.toISOString())

        reportData = {
          title: "Monthly Performance Report",
          period: `${monthStart.toLocaleDateString()} - ${now.toLocaleDateString()}`,
          issues: monthlyIssues,
          summary: {
            total: monthlyIssues?.length || 0,
            resolved: monthlyIssues?.filter((i) => i.status === "resolved").length || 0,
            pending: monthlyIssues?.filter((i) => i.status === "pending").length || 0,
            inProgress: monthlyIssues?.filter((i) => i.status === "in_progress").length || 0,
          },
        }
        break

      case "comprehensive":
        const { data: allIssues } = await supabase.from("issues").select(`
            *,
            reporter:profiles!reporter_id(full_name, email),
            assigned_staff:profiles!assigned_to(full_name, email)
          `)

        reportData = {
          title: "Comprehensive Audit Report",
          period: "All Time",
          issues: allIssues,
          summary: {
            total: allIssues?.length || 0,
            resolved: allIssues?.filter((i) => i.status === "resolved").length || 0,
            pending: allIssues?.filter((i) => i.status === "pending").length || 0,
            inProgress: allIssues?.filter((i) => i.status === "in_progress").length || 0,
          },
        }
        break

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Return data in requested format
    if (format === "csv") {
      const csv = convertToCSV(reportData.issues)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${reportType}-report.csv"`,
        },
      })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return ""

  const headers = [
    "ID",
    "Title",
    "Description",
    "Category",
    "Priority",
    "Status",
    "Reporter",
    "Assigned Staff",
    "Address",
    "Created At",
    "Resolved At",
  ]

  const rows = data.map((issue) => [
    issue.id,
    `"${issue.title}"`,
    `"${issue.description}"`,
    issue.category,
    issue.priority,
    issue.status,
    issue.reporter?.full_name || "Anonymous",
    issue.assigned_staff?.full_name || "Unassigned",
    `"${issue.address || ""}"`,
    issue.created_at,
    issue.resolved_at || "",
  ])

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}
