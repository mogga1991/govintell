"use client"

import * as React from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { cn } from "@/lib/utils"
import { RfqWithRelations, RfqStatusType } from "@/types/rfq"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface RfqCardProps {
  rfq: RfqWithRelations
  onSave?: (rfqId: string) => void
  onUnsave?: (rfqId: string) => void
  onStatusChange?: (rfqId: string, status: RfqStatusType) => void
  showActions?: boolean
  compact?: boolean
  className?: string
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

// Deadline urgency calculation
function getDeadlineUrgency(deadline: Date) {
  const now = new Date()
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilDeadline < 0) return { urgency: "expired", label: "Expired", variant: "destructive" as const }
  if (daysUntilDeadline <= 7) return { urgency: "urgent", label: "Due Soon", variant: "destructive" as const }
  if (daysUntilDeadline <= 30) return { urgency: "moderate", label: "Closing Soon", variant: "secondary" as const }
  return { urgency: "normal", label: "Open", variant: "default" as const }
}

export function RfqCard({
  rfq,
  onSave,
  onUnsave,
  onStatusChange,
  showActions = true,
  compact = false,
  className
}: RfqCardProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [isResearching, setIsResearching] = React.useState(false)

  const deadlineInfo = getDeadlineUrgency(new Date(rfq.deadline_date))
  const contractValue = formatContractValue(
    rfq.contract_value_min ? Number(rfq.contract_value_min) : null,
    rfq.contract_value_max ? Number(rfq.contract_value_max) : null
  )

  // Format codes for display
  const naicsCodes = rfq.naics_codes?.split(',').slice(0, 2) || []
  const pscCodes = rfq.psc_codes?.split(',').slice(0, 1) || []

  async function handleSaveToggle() {
    setIsSaving(true)
    try {
      if (rfq.isSaved) {
        await onUnsave?.(rfq.id)
      } else {
        await onSave?.(rfq.id)
      }
    } catch (error) {
      console.error('Error toggling save status:', error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleProductResearch() {
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

  if (compact) {
    return (
      <Card className={cn("transition-all hover:shadow-md", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link href={`/rfqs/${rfq.id}`}>
                <h3 className="font-medium text-sm leading-tight hover:underline line-clamp-2 mb-1">
                  {rfq.title}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground mb-2">
                {rfq.agency}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{contractValue}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(rfq.deadline_date), { addSuffix: true })}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Badge variant={deadlineInfo.variant} className="text-xs">
                {deadlineInfo.label}
              </Badge>
              {showActions && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleSaveToggle}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Icons.loader2 className="h-3 w-3 animate-spin" />
                  ) : rfq.isSaved ? (
                    <Icons.bookmark className="h-3 w-3 fill-current" />
                  ) : (
                    <Icons.bookmark className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("transition-all hover:shadow-lg", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg leading-tight mb-2">
              <Link href={`/rfqs/${rfq.id}`} className="hover:text-blue-600 hover:underline">
                {rfq.title}
              </Link>
            </CardTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{rfq.agency}</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Icons.calendar className="h-4 w-4" />
                  Due {formatDistanceToNow(new Date(rfq.deadline_date), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <Icons.mapPin className="h-4 w-4" />
                  {rfq.location}
                </span>
                <span className="flex items-center gap-1">
                  <Icons.dollarSign className="h-4 w-4" />
                  {contractValue}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={deadlineInfo.variant}>
              {deadlineInfo.label}
            </Badge>
            {rfq.isSaved && (
              <Badge variant="outline" className="gap-1">
                <Icons.bookmark className="h-3 w-3 fill-current" />
                Saved
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {rfq.description}
        </p>
        
        {/* Classification codes */}
        {(naicsCodes.length > 0 || pscCodes.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {naicsCodes.map(code => (
              <Badge key={code} variant="outline" className="text-xs">
                NAICS {code.trim()}
              </Badge>
            ))}
            {pscCodes.map(code => (
              <Badge key={code} variant="outline" className="text-xs">
                PSC {code.trim()}
              </Badge>
            ))}
          </div>
        )}

        {/* Contract details */}
        {(rfq.contract_type || rfq.set_aside_type) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {rfq.contract_type && (
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium">{rfq.contract_type}</p>
              </div>
            )}
            {rfq.set_aside_type && (
              <div>
                <span className="text-muted-foreground">Set Aside:</span>
                <p className="font-medium">{rfq.set_aside_type}</p>
              </div>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveToggle}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <Icons.loader2 className="h-4 w-4 animate-spin" />
                ) : rfq.isSaved ? (
                  <>
                    <Icons.bookmark className="h-4 w-4 fill-current" />
                    Saved
                  </>
                ) : (
                  <>
                    <Icons.bookmark className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleProductResearch}
                disabled={isResearching}
                className="gap-2"
              >
                {isResearching ? (
                  <Icons.loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icons.search className="h-4 w-4" />
                )}
                {isResearching ? 'Researching...' : 'Find Products'}
              </Button>
            </div>
            
            <Link 
              href={`/rfqs/${rfq.id}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
            >
              View Details
              <Icons.arrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}