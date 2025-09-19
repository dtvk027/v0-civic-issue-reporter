import { requireAuth } from "@/lib/auth"
import { ReportForm } from "@/components/report-form"

export default async function ReportPage() {
  await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Report a Civic Issue</h1>
            <p className="text-muted-foreground">
              Help improve your community by reporting issues that need attention from local authorities.
            </p>
          </div>
          <ReportForm />
        </div>
      </div>
    </div>
  )
}
