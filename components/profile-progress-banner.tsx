"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "@prisma/client"

import { checkProfileCompletion } from "@/lib/user"
import { UserProfile } from "@/types/user-profile"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"

interface ProfileProgressBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  user: UserProfile
  dismissible?: boolean
  showOnPages?: string[]
  hideOnPages?: string[]
  onDismiss?: () => void
}

export function ProfileProgressBanner({
  user,
  dismissible = true,
  showOnPages = ["/dashboard", "/rfqs"],
  hideOnPages = ["/dashboard/settings"],
  onDismiss,
  className,
  ...props
}: ProfileProgressBannerProps) {
  const pathname = usePathname()
  const [isDismissed, setIsDismissed] = React.useState(false)
  
  const profileStatus = checkProfileCompletion(user)
  const { isComplete, missingFields, completionPercentage } = profileStatus

  // Don't show banner if profile is complete
  if (isComplete) return null

  // Don't show if dismissed and dismissible
  if (dismissible && isDismissed) return null

  // Check if current page should show the banner
  const shouldShowOnCurrentPage = React.useMemo(() => {
    if (!pathname) return false
    
    // If hideOnPages is specified and current page is in it, don't show
    if (hideOnPages.some(page => pathname.startsWith(page))) {
      return false
    }
    
    // If showOnPages is specified, only show on those pages
    if (showOnPages.length > 0) {
      return showOnPages.some(page => pathname.startsWith(page))
    }
    
    return true
  }, [pathname, showOnPages, hideOnPages])

  if (!shouldShowOnCurrentPage) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const getBannerMessage = () => {
    if (completionPercentage === 0) {
      return "Complete your business profile to unlock better RFQ matches"
    } else if (completionPercentage < 100) {
      return `Your profile is ${completionPercentage}% complete. Add missing information to improve your RFQ results.`
    }
    return ""
  }

  const getBannerVariant = () => {
    // Use a friendly default styling instead of aggressive red
    return "default"
  }

  const getMissingFieldsText = () => {
    if (missingFields.length === 0) return ""
    
    const fieldNames: Record<string, string> = {
      company_name: "company name",
      naics_codes: "NAICS codes"
    }
    
    const readableFields = missingFields.map(field => fieldNames[field] || field)
    
    if (readableFields.length === 1) {
      return `Add your ${readableFields[0]} to get better personalized recommendations.`
    } else if (readableFields.length === 2) {
      return `Add your ${readableFields[0]} and ${readableFields[1]} for better matching.`
    } else {
      const lastField = readableFields.pop()
      return `Add your ${readableFields.join(", ")}, and ${lastField} for better matching.`
    }
  }

  return (
    <Alert 
      variant="default" 
      className={cn(
        "relative border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950", 
        className
      )} 
      {...props}
    >
      <div className="flex items-start gap-4">
        <Icons.lightbulb className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
        <div className="flex-1 space-y-2">
          <AlertDescription className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {getBannerMessage()}
          </AlertDescription>
          
          {missingFields.length > 0 && (
            <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
              {getMissingFieldsText()}
            </AlertDescription>
          )}
          
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Progress value={completionPercentage} className="flex-1 h-2" />
                <span className="text-xs font-medium min-w-fit text-blue-800 dark:text-blue-200">
                  {completionPercentage}%
                </span>
              </div>
            </div>
            
            <Link
              href="/dashboard/settings"
              className={cn(
                buttonVariants({ size: "sm", variant: "default" }), 
                "shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              Complete Now
            </Link>
          </div>
        </div>
        
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 p-1"
            aria-label="Dismiss banner"
          >
            <Icons.x className="h-4 w-4" />
          </button>
        )}
      </div>
    </Alert>
  )
}

// Hook for managing banner dismissal state
export function useProfileBannerDismissal() {
  const [dismissedBanners, setDismissedBanners] = React.useState<string[]>([])

  const dismissBanner = React.useCallback((bannerId: string) => {
    setDismissedBanners(prev => prev.includes(bannerId) ? prev : [...prev, bannerId])
  }, [])

  const isBannerDismissed = React.useCallback((bannerId: string) => {
    return dismissedBanners.includes(bannerId)
  }, [dismissedBanners])

  return { dismissBanner, isBannerDismissed }
}