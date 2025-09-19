import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <AlertTriangle className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">CivicReport</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
              Authentication Error
            </CardTitle>
            <CardDescription>There was a problem with your authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                The authentication link may have expired or been used already. Please try signing up or logging in
                again.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Common issues:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Email confirmation link has expired</li>
                <li>• Link has already been used</li>
                <li>• Email address not verified</li>
                <li>• Network connectivity issues</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/sign-up">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try Again
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/auth/login">Sign In Instead</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
