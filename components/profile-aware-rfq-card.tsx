"use client"

import * as React from "react"
import Link from "next/link"
import { formatDistance, formatDistanceToNow, isAfter, isBefore } from "date-fns"

import { cn } from "@/lib/utils"
import { checkProfileCompletion } from "@/lib/user"
import { UserProfile } from "@/types/user-profile"
import { RfqWithRelations, RfqStatusType } from "@/types/rfq"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RfqCard } from "@/components/rfq-card"

interface ProfileAwareRfqCardProps {
  rfq: RfqWithRelations
  user: UserProfile
  onSave?: (rfqId: string) => void
  onUnsave?: (rfqId: string) => void
  onStatusChange?: (rfqId: string, status: RfqStatusType) => void
  showActions?: boolean
  compact?: boolean
  className?: string
}

// Enhanced matching logic based on profile completion
function calculateProfileMatchScore(rfq: RfqWithRelations, user: UserProfile) {
  let score = 0
  let maxScore = 100
  const factors: Array<{ name: string; score: number; maxScore: number; message: string }> = []

  // NAICS codes matching
  if (user.naics_codes && rfq.naics_codes) {
    const userNaics = user.naics_codes.split(',').map(code => code.trim())
    const rfqNaics = rfq.naics_codes.split(',').map(code => code.trim())
    
    const matches = userNaics.filter(code => 
      rfqNaics.some(rfqCode => rfqCode.startsWith(code.substring(0, 2)))
    )
    
    const naicsScore = (matches.length / Math.max(userNaics.length, 1)) * 40
    score += naicsScore
    
    factors.push({
      name: "NAICS Match",
      score: naicsScore,
      maxScore: 40,
      message: matches.length > 0 
        ? `${matches.length} of your NAICS codes match this opportunity`
        : "No direct NAICS code matches found"
    })
  } else if (!user.naics_codes) {
    factors.push({
      name: "NAICS Match",
      score: 0,
      maxScore: 40,
      message: "Add NAICS codes to your profile for better matching"
    })
  }

  // Company name presence
  if (user.company_name) {
    score += 20
    factors.push({
      name: "Profile Completeness",
      score: 20,
      maxScore: 20,
      message: "Complete profile enhances credibility"
    })
  } else {
    factors.push({
      name: "Profile Completeness", 
      score: 0,
      maxScore: 20,
      message: "Add company name to improve your profile strength"
    })
  }

  // Business verification bonus
  if (user.business_verified) {
    score += 15
    factors.push({
      name: "Business Verification",
      score: 15,
      maxScore: 15,
      message: "Verified business status increases competitiveness"
    })
  } else {
    factors.push({
      name: "Business Verification",
      score: 0,
      maxScore: 15,
      message: "Business verification can improve your chances"
    })
  }

  // Base opportunity score
  score += 25
  factors.push({
    name: "Opportunity Quality",
    score: 25,
    maxScore: 25,
    message: "Standard opportunity assessment"
  })

  return {
    totalScore: Math.round(score),
    maxScore,
    factors,
    percentage: Math.round((score / maxScore) * 100)
  }
}

// Profile-aware message generation
function getProfileAwareMessage(rfq: RfqWithRelations, user: UserProfile) {
  const profileStatus = checkProfileCompletion(user)
  
  if (!profileStatus.isComplete) {
    const missingFields = profileStatus.missingFields
    
    if (missingFields.includes("naics_codes")) {
      return {
        type: "warning" as const,
        title: "Improve Your Match Score",
        message: "Add NAICS codes to see if this opportunity aligns with your business sectors.",
        action: "Add NAICS Codes",
        actionHref: "/dashboard/settings"
      }
    } else if (missingFields.includes("company_name")) {
      return {
        type: "info" as const,
        title: "Complete Your Profile",
        message: "Add your company name to strengthen your profile for this opportunity.",
        action: "Add Company Info",
        actionHref: "/dashboard/settings"
      }
    }
  }

  // For complete profiles, provide value-add messages
  const matchScore = calculateProfileMatchScore(rfq, user)
  
  if (matchScore.percentage >= 80) {
    return {
      type: "success" as const,
      title: "Excellent Match",
      message: `${matchScore.percentage}% match based on your profile. This looks like a great opportunity for your business.`,
      action: "View Details",
      actionHref: `/rfqs/${rfq.id}`
    }
  } else if (matchScore.percentage >= 60) {
    return {
      type: "default" as const,
      title: "Good Match",
      message: `${matchScore.percentage}% match. Consider reviewing the requirements to see if this aligns with your capabilities.`,
      action: "Analyze Match",
      actionHref: `/rfqs/${rfq.id}`
    }
  }

  return null
}

export function ProfileAwareRfqCard({
  rfq,
  user,
  onSave,
  onUnsave,
  onStatusChange,
  showActions = true,
  compact = false,
  className
}: ProfileAwareRfqCardProps) {
  const profileStatus = checkProfileCompletion(user)
  const profileMessage = getProfileAwareMessage(rfq, user)
  const matchScore = calculateProfileMatchScore(rfq, user)

  // For compact mode or when profile is incomplete, show enhanced messaging
  if (!profileStatus.isComplete || profileMessage) {
    return (
      <div className="space-y-3">
        {/* Original RFQ Card */}
        <RfqCard
          rfq={rfq}
          onSave={onSave}
          onUnsave={onUnsave}
          onStatusChange={onStatusChange}
          showActions={showActions}
          compact={compact}
          className={className}
        />
        
        {/* Profile-aware enhancement */}
        {profileMessage && (
          <Alert 
            variant={profileMessage.type === 'warning' ? 'destructive' : 'default'}
            className={cn(
              "border-l-4",
              profileMessage.type === "success" && "border-l-green-500 bg-green-50 dark:bg-green-950",
              profileMessage.type === "warning" && "border-l-orange-500 bg-orange-50 dark:bg-orange-950",
              profileMessage.type === "info" && "border-l-blue-500 bg-blue-50 dark:bg-blue-950",
              profileMessage.type === "default" && "border-l-gray-300"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <AlertDescription className="font-medium">
                  {profileMessage.title}
                </AlertDescription>
                <AlertDescription className="text-sm text-muted-foreground">
                  {profileMessage.message}
                </AlertDescription>
              </div>
              <Link
                href={profileMessage.actionHref}
                className={cn(
                  "text-xs px-2 py-1 rounded-md shrink-0 ml-2",
                  profileMessage.type === "success" && "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300",
                  profileMessage.type === "warning" && "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300",
                  profileMessage.type === "info" && "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300",
                  profileMessage.type === "default" && "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                {profileMessage.action}
              </Link>
            </div>
          </Alert>
        )}
        
        {/* Match Score Display for Complete Profiles */}
        {profileStatus.isComplete && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 border-0">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icons.target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Profile Match Score</span>
                </div>
                <Badge 
                  variant={matchScore.percentage >= 80 ? "default" : matchScore.percentage >= 60 ? "secondary" : "outline"}
                  className="font-semibold"
                >
                  {matchScore.percentage}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // For complete profiles without special messaging, return enhanced card
  return (
    <RfqCard
      rfq={rfq}
      onSave={onSave}
      onUnsave={onUnsave}
      onStatusChange={onStatusChange}
      showActions={showActions}
      compact={compact}
      className={cn(
        className,
        profileStatus.isComplete && matchScore.percentage >= 80 && "ring-2 ring-green-200 dark:ring-green-800"
      )}
    />
  )
}

// Hook for profile-aware RFQ browsing enhancements
export function useProfileAwareRfqBrowsing(user: UserProfile) {
  const profileStatus = checkProfileCompletion(user)
  
  const getEmptyStateMessage = React.useCallback(() => {
    if (!profileStatus.isComplete) {
      return {
        title: "No RFQs found",
        description: "Complete your business profile to see more relevant opportunities matched to your industry.",
        action: "Complete Profile",
        actionHref: "/dashboard/settings"
      }
    }
    
    return {
      title: "No matching opportunities",
      description: "Try adjusting your search filters or check back later for new opportunities.",
      action: "Browse All RFQs",
      actionHref: "/rfqs"
    }
  }, [profileStatus.isComplete])

  const getSearchResultsHeader = React.useCallback((totalResults: number) => {
    if (!profileStatus.isComplete && totalResults > 0) {
      return {
        message: `Showing ${totalResults} opportunities. Complete your profile to see personalized match scores and recommendations.`,
        action: "Complete Profile",
        actionHref: "/dashboard/settings"
      }
    }
    
    if (profileStatus.isComplete && totalResults > 0) {
      return {
        message: `Found ${totalResults} opportunities with personalized matching.`,
        action: null,
        actionHref: null
      }
    }
    
    return null
  }, [profileStatus.isComplete])

  return {
    profileStatus,
    getEmptyStateMessage,
    getSearchResultsHeader,
    isProfileComplete: profileStatus.isComplete
  }
}