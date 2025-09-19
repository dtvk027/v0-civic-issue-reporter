export type UserRole = "citizen" | "staff" | "admin"

export type IssueStatus = "pending" | "in_progress" | "resolved" | "closed"

export type IssuePriority = "low" | "medium" | "high" | "urgent"

export type IssueCategory =
  | "pothole"
  | "streetlight"
  | "traffic_signal"
  | "sidewalk"
  | "graffiti"
  | "garbage"
  | "water_leak"
  | "other"

export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: UserRole
  department?: string
  created_at: string
  updated_at: string
}

export interface Issue {
  id: string
  title: string
  description: string
  category: IssueCategory
  priority: IssuePriority
  status: IssueStatus
  location_lat?: number
  location_lng?: number
  address?: string
  image_url?: string
  reporter_id: string
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  reporter?: Profile
  assigned_staff?: Profile
}

export interface IssueUpdate {
  id: string
  issue_id: string
  user_id: string
  message: string
  status?: IssueStatus
  created_at: string
  user?: Profile
}

export interface Notification {
  id: string
  user_id: string
  issue_id?: string
  title: string
  message: string
  read: boolean
  created_at: string
  issue?: Issue
}
