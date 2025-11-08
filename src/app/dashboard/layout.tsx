"use client"

import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    // If the user is not defined (still loading) or is null (not logged in),
    // redirect to the login page.
    if (user === null) {
      router.push("/")
    }
  }, [user, router])

  // While the user state is loading, show a loading indicator.
  if (user === undefined) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If the user is authenticated, render the dashboard layout.
  return user ? (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <SidebarNav />
        </div>
      </aside>
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  ) : null // Or a fallback component if you want to avoid a null render
}
