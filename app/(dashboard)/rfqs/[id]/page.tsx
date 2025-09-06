"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { RfqWithRelations, RfqStatusType } from "@/types/rfq"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"

interface RfqDetailResponse {
  success: boolean
  rfq: RfqWithRelations
}

// Contract value formatting
function formatContractValue(min?: number | null, max?: number | null): string {
  if (!min && !max) return "Value TBD"
  
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString()}`
  }
  
  if (min && max) {
    if (min === max) return formatValue(min)
    return `${formatValue(min)} - ${formatValue(max)}`
  }
  
  return formatValue(min || max || 0)
}

// Format date helper
function formatDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

// Deadline urgency calculation
function getDeadlineUrgency(deadline: Date) {
  const now = new Date()
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilDeadline < 0) return { urgency: "expired", label: "Expired", variant: "destructive" as const }
  if (daysUntilDeadline <= 7) return { urgency: "urgent", label: "Due Soon", variant: "destructive" as const }
  if (daysUntilDeadline <= 30) return { urgency: "moderate", label: "Closing Soon", variant: "secondary" as const }
  return { urgency: "normal", label: "Open", variant: "default" as const }
}

export default function RfqDetailPage() {
  const params = useParams()
  const router = useRouter()
  
  const [rfq, setRfq] = React.useState<RfqWithRelations | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isResearching, setIsResearching] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const rfqId = params?.id as string

  // Fetch RFQ details
  const fetchRfqDetail = React.useCallback(async () => {
    if (!rfqId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/rfqs/${rfqId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('RFQ not found')
        }
        throw new Error('Failed to fetch RFQ details')
      }
      
      const data: RfqDetailResponse = await response.json()
      
      if (data.success && data.rfq) {
        setRfq(data.rfq)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [rfqId])

  React.useEffect(() => {
    fetchRfqDetail()
  }, [fetchRfqDetail])

  // Handle RFQ actions
  const handleSaveRfq = async () => {
    if (!rfq) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/rfqs/${rfq.id}/save`, {
        method: rfq.isSaved ? 'DELETE' : 'POST'
      })
      
      if (response.ok) {
        setRfq(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null)
      }
    } catch (error) {
      console.error('Error saving RFQ:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleProductResearch = async () => {
    if (!rfq) return
    
    setIsResearching(true)
    try {
      const response = await fetch(`/api/rfqs/${rfq.id}/research`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Research failed')
      }
      
      const data = await response.json()
      console.log('Research started:', data)
      
      // Redirect to research results page
      window.open(`/dashboard/rfqs/${rfq.id}/research`, '_blank')
      
    } catch (error) {
      console.error('Error starting product research:', error)
      alert('Failed to start product research. Please try again.')
    } finally {
      setIsResearching(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Icons.alertCircle className="h-16 w-16 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Unable to load RFQ</h3>
            <p className="text-muted-foreground mt-1">{error}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchRfqDetail} variant="outline">
              <Icons.refresh className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => router.back()} variant="ghost">
              <Icons.arrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!rfq) {
    return null
  }

  const deadlineInfo = getDeadlineUrgency(new Date(rfq.deadline_date))
  const contractValue = formatContractValue(
    rfq.contract_value_min ? Number(rfq.contract_value_min) : null,
    rfq.contract_value_max ? Number(rfq.contract_value_max) : null
  )

  // Format codes for display
  const naicsCodes = rfq.naics_codes?.split(',') || []
  const pscCodes = rfq.psc_codes?.split(',') || []

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/rfqs" className="hover:text-foreground transition-colors">
                RFQ Opportunities
              </Link>
              <Icons.chevronRight className="h-4 w-4" />
              <span>RFQ Details</span>
            </div>
            <DashboardHeader
              heading={rfq.title}
              text={rfq.agency}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleSaveRfq}
              disabled={isSaving}
            >
              {isSaving ? (
                <Icons.loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : rfq.isSaved ? (
                <Icons.bookmark className="h-4 w-4 mr-2 fill-current" />
              ) : (
                <Icons.bookmark className="h-4 w-4 mr-2" />
              )}
              {rfq.isSaved ? 'Saved' : 'Save'}
            </Button>

            {rfq.source_url && (
              <Link 
                href={rfq.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
              >
                <Icons.externalLink className="h-4 w-4 mr-2" />
                View Original
              </Link>
            )}
          </div>
        </div>

        {/* Deadline Warning */}
        {deadlineInfo.urgency === "urgent" && (
          <Alert variant="destructive">
            <Icons.clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Deadline approaching!</strong> This opportunity closes {formatDistanceToNow(new Date(rfq.deadline_date), { addSuffix: true })}.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* RFQ Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Opportunity Details</CardTitle>
                  <Badge variant={deadlineInfo.variant}>
                    {deadlineInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rfq.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Contract Information</h4>
                    <div className="space-y-2 text-sm">
                      {rfq.solicitation_number && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Solicitation:</span>
                          <span className="font-mono">{rfq.solicitation_number}</span>
                        </div>
                      )}
                      {rfq.contract_type && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{rfq.contract_type}</span>
                        </div>
                      )}
                      {rfq.set_aside_type && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Set-aside:</span>
                          <span>{rfq.set_aside_type}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="font-medium">{contractValue}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Important Dates</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posted:</span>
                        <span>{formatDate(rfq.posted_date)}</span>
                      </div>
                      {rfq.response_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Response:</span>
                          <span>{formatDate(rfq.response_date)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deadline:</span>
                        <span className={cn(
                          "font-medium",
                          deadlineInfo.urgency === "urgent" && "text-red-600"
                        )}>
                          {formatDate(rfq.deadline_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Classification Codes</h4>
                  <div className="space-y-3">
                    {naicsCodes.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground mb-2 block">NAICS Codes:</span>
                        <div className="flex flex-wrap gap-1">
                          {naicsCodes.map(code => (
                            <Badge key={code} variant="outline" className="font-mono">
                              {code.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {pscCodes.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground mb-2 block">PSC Codes:</span>
                        <div className="flex flex-wrap gap-1">
                          {pscCodes.map(code => (
                            <Badge key={code} variant="outline" className="font-mono">
                              {code.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            {rfq.location && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Icons.mapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{rfq.location}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleProductResearch}
                  variant="outline"
                  className="w-full justify-start bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                  disabled={isResearching}
                >
                  {isResearching ? (
                    <Icons.loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Icons.search className="h-4 w-4 mr-2" />
                  )}
                  {isResearching ? 'Researching...' : 'Find Products'}
                </Button>
                
                <Button 
                  onClick={handleSaveRfq} 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Icons.loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : rfq.isSaved ? (
                    <Icons.bookmark className="h-4 w-4 mr-2 fill-current" />
                  ) : (
                    <Icons.bookmark className="h-4 w-4 mr-2" />
                  )}
                  {rfq.isSaved ? 'Remove from Saved' : 'Save Opportunity'}
                </Button>
                
                {rfq.source_url && (
                  <Link 
                    href={rfq.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    <Icons.externalLink className="h-4 w-4 mr-2" />
                    View on SAM.gov
                  </Link>
                )}
                
                <Button variant="outline" className="w-full justify-start">
                  <Icons.download className="h-4 w-4 mr-2" />
                  Download Documents
                </Button>
              </CardContent>
            </Card>

            {/* Status Info */}
            {rfq.userStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="capitalize">
                    {rfq.userStatus.status.replace('_', ' ')}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}