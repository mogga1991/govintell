"use client"

import * as React from "react"
import Link from "next/link"
import { User } from "@prisma/client"

import { checkProfileCompletion } from "@/lib/user"
import { UserProfile } from "@/types/user-profile"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"

interface ProfileAwareEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  user: UserProfile
  searchContext?: {
    hasFilters: boolean
    filtersApplied: string[]
    totalPossibleResults?: number
  }
  variant?: "no_results" | "no_rfqs" | "search_empty"
}

export function ProfileAwareEmptyState({
  user,
  searchContext,
  variant = "no_results",
  className,
  ...props
}: ProfileAwareEmptyStateProps) {
  const profileStatus = checkProfileCompletion(user)
  const { isComplete, missingFields, completionPercentage } = profileStatus

  const getEmptyStateContent = () => {
    const hasFilters = searchContext?.hasFilters || false
    const filtersApplied = searchContext?.filtersApplied || []

    // Profile incomplete scenarios
    if (!isComplete) {
      if (variant === "search_empty" && hasFilters) {
        return {
          icon: Icons.search,
          title: "No opportunities match your search",
          description: "Try adjusting your filters or complete your profile to see more relevant opportunities.",
          primaryAction: {
            text: "Clear Filters",
            href: "/rfqs",
            variant: "outline" as const
          },
          secondaryAction: {
            text: "Complete Profile",
            href: "/dashboard/settings",
            variant: "default" as const
          },
          showProfileBenefits: true
        }
      }

      const missingField = missingFields[0]
      if (missingField === "naics_codes") {
        return {
          icon: Icons.target,
          title: "Add NAICS codes to see relevant opportunities",
          description: "Government contracts are organized by NAICS industry codes. Add your codes to see opportunities specifically matched to your business sector.",
          primaryAction: {
            text: "Add NAICS Codes",
            href: "/dashboard/settings",
            variant: "default" as const
          },
          showProfileBenefits: true,
          profileTip: {
            title: "Why NAICS codes matter",
            items: [
              "Government agencies use NAICS codes to find qualified contractors",
              "Opportunities are often restricted to specific NAICS codes",
              "Better matching means fewer irrelevant opportunities"
            ]
          }
        }
      }

      if (missingField === "company_name") {
        return {
          icon: Icons.building,
          title: "Complete your company profile",
          description: "Add your company information to access more features and improve your credibility with government agencies.",
          primaryAction: {
            text: "Add Company Info",
            href: "/dashboard/settings",
            variant: "default" as const
          },
          showProfileBenefits: true
        }
      }

      return {
        icon: Icons.alertCircle,
        title: "Complete your profile to unlock opportunities",
        description: "Government contracting platforms work best when they know about your business. Complete your profile to see relevant opportunities.",
        primaryAction: {
          text: "Complete Profile",
          href: "/dashboard/settings",
          variant: "default" as const
        },
        showProfileBenefits: true
      }
    }

    // Profile complete scenarios
    if (variant === "search_empty" && hasFilters) {
      return {
        icon: Icons.search,
        title: "No opportunities match your current filters",
        description: "Try expanding your search criteria or check back later for new opportunities.",
        primaryAction: {
          text: "Clear Filters",
          href: "/rfqs",
          variant: "outline" as const
        },
        secondaryAction: {
          text: "Browse All",
          href: "/rfqs",
          variant: "default" as const
        },
        showFilterSummary: true
      }
    }

    return {
      icon: Icons.inbox,
      title: "No opportunities available right now",
      description: "We'll notify you when new opportunities that match your profile become available.",
      primaryAction: {
        text: "Set Up Alerts",
        href: "/dashboard/settings#alerts",
        variant: "default" as const
      },
      secondaryAction: {
        text: "Browse All RFQs",
        href: "/rfqs",
        variant: "outline" as const
      }
    }
  }

  const content = getEmptyStateContent()

  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)} {...props}>
      <Card className="max-w-2xl w-full text-center">
        <CardHeader className="pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <content.icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{content.title}</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            {content.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Profile Benefits */}
          {content.showProfileBenefits && !isComplete && (
            <Alert className="text-left">
              <Icons.lightbulb className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Complete your profile to unlock:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li className="flex items-center gap-2">
                      <Icons.checkCircle className="h-3 w-3 text-green-600" />
                      3x more relevant RFQ matches
                    </li>
                    <li className="flex items-center gap-2">
                      <Icons.checkCircle className="h-3 w-3 text-green-600" />
                      Personalized opportunity recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <Icons.checkCircle className="h-3 w-3 text-green-600" />
                      Advanced filtering and search features
                    </li>
                  </ul>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Profile completion:</span>
                    <Badge variant="secondary" className="text-xs">
                      {completionPercentage}%
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Tip */}
          {content.profileTip && (
            <Alert className="text-left bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <Icons.info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {content.profileTip.title}
                  </p>
                  <ul className="text-sm space-y-1 ml-2 text-blue-800 dark:text-blue-200">
                    {content.profileTip.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Icons.dot className="h-3 w-3 mt-1 text-blue-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Filter Summary */}
          {content.showFilterSummary && searchContext?.filtersApplied.length && (
            <Alert className="text-left">
              <Icons.filter className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Active filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchContext.filtersApplied.map((filter, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {filter}
                      </Badge>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-center gap-3">
          {content.secondaryAction && (
            <Link
              href={content.secondaryAction.href}
              className={cn(buttonVariants({ variant: content.secondaryAction.variant }))}
            >
              {content.secondaryAction.text}
            </Link>
          )}
          <Link
            href={content.primaryAction.href}
            className={cn(buttonVariants({ variant: content.primaryAction.variant }))}
          >
            {content.primaryAction.text}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

// Hook for providing empty state props
export function useProfileAwareEmptyState(user: UserProfile) {
  const profileStatus = checkProfileCompletion(user)

  const getEmptyStateProps = React.useCallback((
    searchContext?: {
      hasFilters: boolean
      filtersApplied: string[]
      totalPossibleResults?: number
    }
  ) => {
    const hasFilters = searchContext?.hasFilters || false
    
    if (!profileStatus.isComplete) {
      return {
        variant: "no_results" as const,
        message: "Complete your profile to see more relevant opportunities",
        actionText: "Complete Profile",
        actionHref: "/dashboard/settings"
      }
    }

    if (hasFilters) {
      return {
        variant: "search_empty" as const,
        message: "No opportunities match your search criteria",
        actionText: "Clear Filters", 
        actionHref: "/rfqs"
      }
    }

    return {
      variant: "no_rfqs" as const,
      message: "No opportunities available",
      actionText: "Set Up Alerts",
      actionHref: "/dashboard/settings#alerts"
    }
  }, [profileStatus.isComplete])

  return {
    profileStatus,
    getEmptyStateProps
  }
}