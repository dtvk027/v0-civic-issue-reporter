"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const categories = [
  { value: "pothole", label: "Pothole", icon: "🕳️" },
  { value: "streetlight", label: "Street Light", icon: "💡" },
  { value: "traffic_signal", label: "Traffic Signal", icon: "🚦" },
  { value: "sidewalk", label: "Sidewalk", icon: "🚶" },
  { value: "graffiti", label: "Graffiti", icon: "🎨" },
  { value: "garbage", label: "Garbage/Litter", icon: "🗑️" },
  { value: "water_leak", label: "Water Leak", icon: "💧" },
  { value: "other", label: "Other", icon: "⚠️" },
]

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export function ReportForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const router = useRouter()

  const handleGetLocation = () => {
    setGettingLocation(true)

    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setGettingLocation(false)
        toast({
          title: "Location captured",
          description: "Your current location has been added to the report.",
        })
      },
      (error) => {
        console.error("Error getting location:", error)
        toast({
          title: "Error",
          description: "Unable to get your location. Please enter the address manually.",
          variant: "destructive",
        })
        setGettingLocation(false)
      },
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to report an issue")
      }

      const issueData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        priority: formData.get("priority") as string,
        address: formData.get("address") as string,
        location_lat: location?.lat,
        location_lng: location?.lng,
        reporter_id: user.id,
      }

      const { error } = await supabase.from("issues").insert([issueData])

      if (error) throw error

      toast({
        title: "Issue reported successfully",
        description: "Your report has been submitted and will be reviewed by local authorities.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input id="title" name="title" placeholder="Brief description of the issue" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select issue category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" defaultValue="medium">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide detailed information about the issue"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="flex gap-2">
              <Input id="address" name="address" placeholder="Street address or nearby landmark" className="flex-1" />
              <Button type="button" variant="outline" onClick={handleGetLocation} disabled={gettingLocation}>
                {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              </Button>
            </div>
            {location && (
              <p className="text-sm text-muted-foreground">
                Location captured: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
