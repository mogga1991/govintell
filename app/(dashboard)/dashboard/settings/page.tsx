import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { UserNameForm } from "@/components/user-name-form"
import { UserProfileFormEnhanced } from "@/components/user-profile-form-enhanced"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Settings",
  description: "Manage your account and business profile settings.",
}

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage your account and business profile settings."
      />
      <div className="grid gap-10">
        {/* Enhanced Business Profile Form - Primary focus */}
        <UserProfileFormEnhanced 
          user={{
            id: user.id,
            name: user.name || "",
            email: user.email || "",
            company_name: user.company_name,
            naics_codes: user.naics_codes,
            profile_completed: user.profile_completed,
            business_verified: user.business_verified,
          }}
          variant="progressive" 
          showCompletionCard={false}
        />
        
        <Separator />
        
        {/* Personal Name Form - Secondary */}
        <div>
          <h3 className="text-lg font-medium mb-2">Personal Information</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Update your personal display name.
          </p>
          <UserNameForm user={{ id: user.id, name: user.name || "" }} />
        </div>
      </div>
    </DashboardShell>
  )
}
