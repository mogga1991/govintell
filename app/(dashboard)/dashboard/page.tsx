"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileProgressBanner } from "@/components/profile-progress-banner"
import { ProfileCompletionCard } from "@/components/profile-completion-card"


export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // User not authenticated, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Dashboard" 
        text="Welcome to your government contracting dashboard."
      />
      
      {/* Profile Progress Banner */}
      <ProfileProgressBanner 
        user={user}
        showOnPages={["/dashboard"]}
        className="mb-6"
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Completion Card */}
        <ProfileCompletionCard 
          user={user}
          dismissible={true}
        />

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{user.name || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {user.company_name && (
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">{user.company_name}</p>
              </div>
            )}
            {user.naics_codes && (
              <div>
                <p className="text-sm font-medium">NAICS Codes</p>
                <p className="text-sm text-muted-foreground">{user.naics_codes}</p>
              </div>
            )}
            {user.psc_codes && (
              <div>
                <p className="text-sm font-medium">PSC Codes</p>
                <p className="text-sm text-muted-foreground">{user.psc_codes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with government contracting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <a href="/dashboard/settings" className="no-underline">Edit Profile</a>
            </Button>
            <Button variant="outline" size="sm">
              <a href="/dashboard/rfqs" className="no-underline">Browse RFQs</a>
            </Button>
            <Button variant="outline" size="sm" disabled>
              Generate Quote (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
