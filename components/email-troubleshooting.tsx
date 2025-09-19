import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Mail, AlertTriangle, Settings, ExternalLink } from "lucide-react"

export function EmailTroubleshooting() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Delivery Issues
          </CardTitle>
          <CardDescription>Common solutions for email confirmation problems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Development Note:</strong> This app uses Supabase's default email service, which has very low rate
              limits and is for demonstration only.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium">If you're not receiving emails:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                <span>Check your spam/junk folder - emails from supabase.io may be filtered</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                <span>Wait 5-10 minutes - the default email service can be slow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                <span>Try a different email address (Gmail, Outlook work best)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">4.</span>
                <span>For production use, configure a custom SMTP provider</span>
              </li>
            </ul>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Production Setup
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              For reliable email delivery in production, configure a custom SMTP provider in your Supabase project:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• SendGrid (recommended for civic platforms)</p>
              <p>• Mailgun (good free tier)</p>
              <p>• Amazon SES (cost-effective for high volume)</p>
              <p>• Postmark (excellent deliverability)</p>
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <a
              href="https://supabase.com/docs/guides/auth/auth-smtp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Supabase SMTP Setup Guide
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
