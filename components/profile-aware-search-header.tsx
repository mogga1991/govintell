"use client"

import * as React from "react"
import Link from "next/link"
import { User } from "@prisma/client"

import { checkProfileCompletion } from "@/lib/user"
import { UserProfile } from "@/types/user-profile"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { Card, CardContent } from "@/components/ui/card"

interface ProfileAwareSearchHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  user: UserProfile
  searchResults: {
    total: number
    page: number
    limit: number
    hasFilters: boolean
    activeFilters?: string[]
  }
  showProfileHints?: boolean
  variant?: "default" | "compact"
}

export function ProfileAwareSearchHeader({
  user,
  searchResults,
  showProfileHints = true,
  variant = "default",
  className,
  ...props
}: ProfileAwareSearchHeaderProps) {
  const profileStatus = checkProfileCompletion(user)
  const { isComplete, missingFields, completionPercentage } = profileStatus
  const { total, hasFilters, activeFilters = [] } = searchResults

  const getSearchHeaderMessage = () => {
    if (total === 0) {
      return null // Let empty state handle this
    }

    const baseMessage = `Found ${total.toLocaleString()} ${total === 1 ? 'opportunity' : 'opportunities'}`
    
    if (!isComplete && showProfileHints) {
      return {
        type: "info" as const,
        title: `${baseMessage} • Profile ${completionPercentage}% complete`,
        message: "Complete your profile to see personalized match scores and better recommendations.",
        action: "Complete Profile",
        actionHref: "/dashboard/settings",
        showIcon: true
      }
    }

    if (isComplete && total > 0) {
      const matchingMessage = hasFilters 
        ? `${baseMessage} matching your search criteria`
        : `${baseMessage} with personalized matching`
        
      return {
        type: "success" as const,
        title: matchingMessage,
        message: "Results are ranked by relevance to your business profile.",
        action: null,
        actionHref: null,
        showIcon: false
      }
    }

    return {
      type: "default" as const,
      title: baseMessage,
      message: null,
      action: null,
      actionHref: null,
      showIcon: false
    }
  }

  const headerMessage = getSearchHeaderMessage()

  if (!headerMessage) {
    return null
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center justify-between py-2", className)} {...props}>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {headerMessage.title}
          </span>
          {!isComplete && showProfileHints && (
            <Badge variant="outline" className="text-xs">
              <Icons.alertCircle className="h-3 w-3 mr-1" />
              Incomplete Profile
            </Badge>
          )}
        </div>
        
        {headerMessage.action && headerMessage.actionHref && (
          <Link
            href={headerMessage.actionHref}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "text-xs")}
          >
            {headerMessage.action}
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Main search results header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            {headerMessage.title}
          </h2>
          {headerMessage.message && (
            <p className="text-sm text-muted-foreground">
              {headerMessage.message}
            </p>
          )}
        </div>
        
        {headerMessage.action && headerMessage.actionHref && (
          <Link
            href={headerMessage.actionHref}
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            <Icons.user className="h-4 w-4 mr-2" />
            {headerMessage.action}
          </Link>
        )}
      </div>

      {/* Profile completion enhancement banner */}
      {!isComplete && showProfileHints && total > 0 && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <Icons.lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Unlock Better Matching
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {missingFields.includes("naics_codes") 
                  ? "Add NAICS codes to see which opportunities match your business sector"
                  : missingFields.includes("company_name")
                  ? "Complete your company profile to improve opportunity relevance"
                  : "Complete your profile for personalized match scores and recommendations"
                }
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              className={cn(
                buttonVariants({ size: "sm" }),
                "shrink-0 ml-4 bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              Complete Now
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Active filters display */}
      {hasFilters && activeFilters.length > 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active Filters</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {filter}
                    </Badge>
                  ))}
                </div>
              </div>
              <Link
                href="/rfqs"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <Icons.x className="h-4 w-4 mr-1" />
                Clear All
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile matching insights for complete profiles */}
      {isComplete && total > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Icons.target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Smart Matching Active
                </span>
              </div>
              <Badge variant="default" className="bg-green-600 text-white text-xs">
                <Icons.checkCircle className="h-3 w-3 mr-1" />
                Profile Complete
              </Badge>
              <span className="text-xs text-green-700 dark:text-green-300">
                Results are personalized based on your NAICS codes and business profile
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook for managing search header state and interactions
export function useProfileAwareSearchHeader(user: UserProfile) {
  const profileStatus = checkProfileCompletion(user)

  const getHeaderConfiguration = React.useCallback((searchResults: {
    total: number
    hasFilters: boolean
    activeFilters?: string[]
  }) => {
    const { total, hasFilters, activeFilters = [] } = searchResults
    
    return {
      shouldShow: total > 0 || !profileStatus.isComplete,
      showProfileHints: !profileStatus.isComplete,
      variant: profileStatus.isComplete ? "default" : "compact",
      headerProps: {
        user,
        searchResults,
        showProfileHints: !profileStatus.isComplete
      }
    }
  }, [user, profileStatus.isComplete])

  const getFilterSummary = React.useCallback((filters: string[]) => {
    if (filters.length === 0) return ""
    if (filters.length === 1) return `Filtered by ${filters[0]}`
    if (filters.length === 2) return `Filtered by ${filters[0]} and ${filters[1]}`
    return `Filtered by ${filters.length} criteria`
  }, [])

  return {
    profileStatus,
    getHeaderConfiguration,
    getFilterSummary
  }
}