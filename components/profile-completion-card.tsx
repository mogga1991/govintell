"use client"

import * as React from "react"
import Link from "next/link"
import { User } from "@prisma/client"

import { checkProfileCompletion } from "@/lib/user"
import { UserProfile } from "@/types/user-profile"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"

interface ProfileCompletionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  user: UserProfile | User
  title?: string
  description?: string
  dismissible?: boolean
  compact?: boolean
  variant?: "default" | "minimal"
  onDismiss?: () => void
}

export function ProfileCompletionCard({
  user,
  title,
  description,
  dismissible = false,
  compact = false,
  variant = "default",
  onDismiss,
  className,
  ...props
}: ProfileCompletionCardProps) {
  const [isDismissed, setIsDismissed] = React.useState(false)
  
  const profileStatus = checkProfileCompletion(user)
  const { isComplete, missingFields, completionPercentage } = profileStatus

  // Don't render if profile is complete
  if (isComplete) return null

  // Don't render if dismissed
  if (dismissible && isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const getFieldDisplayName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      company_name: "company name",
      naics_codes: "NAICS codes",
      psc_codes: "PSC codes"
    }
    return fieldNames[field] || field
  }

  const defaultTitle = completionPercentage === 0 
    ? "Complete Your Profile" 
    : "Finish Your Profile"

  const defaultDescription = completionPercentage === 0
    ? "Set up your business profile to get personalized RFQ recommendations"
    : `Your profile is ${completionPercentage}% complete. Add the remaining information to improve your RFQ matches.`

  if (compact) {
    return (
      <Card className={cn("relative", className)} {...props}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="relative w-10 h-10">
                <Progress 
                  value={completionPercentage} 
                  className="w-10 h-10 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {title || defaultTitle}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard/settings"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "shrink-0"
              )}
            >
              Complete
            </Link>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss card"
              >
                <Icons.x className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === "minimal") {
    return (
      <div 
        role="alert"
        className={cn(
          "flex items-center justify-between p-4 border rounded-lg bg-muted/50",
          className
        )} 
        {...props}
      >
        <div className="flex items-center space-x-4">
          <Icons.user className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Profile {completionPercentage}% complete
            </p>
            <p className="text-xs text-muted-foreground">
              {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} missing
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Progress value={completionPercentage} className="w-20" />
          <Link
            href="/dashboard/settings"
            className={cn(
              buttonVariants({ size: "sm", variant: "default" }),
              "shrink-0"
            )}
          >
            Complete
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("relative", className)} role="alert" {...props}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Icons.user className="h-5 w-5" />
              <span>{title || defaultTitle}</span>
              <Badge variant="outline" className="ml-2">
                {completionPercentage}%
              </Badge>
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
            {!description && (
              <CardDescription>{defaultDescription}</CardDescription>
            )}
          </div>
          
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss card"
            >
              <Icons.x className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="w-full" />
        </div>

        {missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Missing Information:</p>
            <div className="grid gap-2">
              {missingFields.map((field) => (
                <div key={field} className="flex items-center space-x-2 text-sm">
                  <Icons.circle className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{getFieldDisplayName(field)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Complete profile for better RFQ matching
          </p>
          <Link
            href="/dashboard/settings"
            className={cn(
              buttonVariants({ size: "sm", variant: "default" }),
              "shrink-0"
            )}
          >
            Complete Profile
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileCompletionCard