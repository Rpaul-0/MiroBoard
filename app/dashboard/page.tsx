import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Get the user from the server
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch user's boards
  const { data: boards } = await supabase
    .from("boards")
    .select(`
      *,
      board_collaborators!inner(
        user_id,
        role
      )
    `)
    .or(`owner_id.eq.${user.id},board_collaborators.user_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })

  return <DashboardClient user={user} boards={boards || []} />
}
