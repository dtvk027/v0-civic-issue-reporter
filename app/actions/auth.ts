"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        role: "citizen",
      },
      emailRedirectTo: undefined,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user && !data.user.email_confirmed_at) {
    // For development, we'll redirect to login with a message
    redirect("/auth/login?message=Account created successfully. Please login.")
  }

  if (data.user) {
    redirect("/dashboard")
  }

  return { error: "Failed to create account" }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}
