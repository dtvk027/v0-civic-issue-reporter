import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MapsSecurityNotice() {
  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
      <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <div className="space-y-2">
          <p className="font-medium">Google Maps API Key Security</p>
          <p className="text-sm">
            The Google Maps API key is intentionally public (required for browser usage) but should be restricted by
            domain in Google Cloud Console to prevent unauthorized usage.
          </p>
          <Button variant="outline" size="sm" asChild className="mt-2 bg-transparent">
            <a
              href="https://developers.google.com/maps/api-security-best-practices"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-amber-700 dark:text-amber-300"
            >
              <ExternalLink className="h-3 w-3" />
              Security Best Practices
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
