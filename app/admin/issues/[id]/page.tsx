import { requireStaffAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { IssueDetailView } from "@/components/issue-detail-view"

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaffAuth()
  const { id } = await params
  const supabase = await createClient()

  // Get issue details
  const { data: issue } = await supabase
    .from("issues")
    .select(`
      *,
      reporter:profiles!reporter_id(full_name, email, phone),
      assigned_staff:profiles!assigned_to(full_name, email)
    `)
    .eq("id", id)
    .single()

  if (!issue) {
    notFound()
  }

  // Get issue updates
  const { data: updates } = await supabase
    .from("issue_updates")
    .select(`
      *,
      user:profiles(full_name, email)
    `)
    .eq("issue_id", id)
    .order("created_at", { ascending: false })

  // Get staff members for assignment
  const { data: staffMembers } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("role", ["staff", "admin"])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <IssueDetailView issue={issue} updates={updates || []} staffMembers={staffMembers || []} />
      </div>
    </div>
  )
}
