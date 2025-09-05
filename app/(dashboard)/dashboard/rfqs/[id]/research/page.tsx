"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardShell } from "@/components/shell"
import { DashboardHeader } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"
import { ProductResearchResult, GeneratedQuote } from "@/types/product-research"

export default function RFQResearchPage() {
  const params = useParams()
  const rfqId = params?.id as string
  
  const [research, setResearch] = useState<ProductResearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!rfqId) return

    const fetchResearch = async () => {
      try {
        const response = await fetch(`/api/rfqs/${rfqId}/research`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Research not found')
          }
          throw new Error(`Failed to fetch research`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          setResearch(data.research)
        } else {
          throw new Error(data.error || 'Failed to load research')
        }
      } catch (error) {
        console.error('Error fetching research:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchResearch()
  }, [rfqId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
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
            <h3 className="text-lg font-semibold">Unable to load research</h3>
            <p className="text-muted-foreground mt-1">{error}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/rfqs/${rfqId}`}>
              <Button variant="outline">
                <Icons.arrowLeft className="h-4 w-4 mr-2" />
                Back to RFQ
              </Button>
            </Link>
            <Link href="/rfqs">
              <Button variant="ghost">
                View All RFQs
              </Button>
            </Link>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!research) {
    return (
      <DashboardShell>
        <div className="text-center py-12">
          <Icons.search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No research found</h3>
          <p className="text-muted-foreground mb-4">
            Product research may still be in progress or failed to complete.
          </p>
          <Link href={`/rfqs/${rfqId}`}>
            <Button>Back to RFQ Details</Button>
          </Link>
        </div>
      </DashboardShell>
    )
  }

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
              <Link href={`/rfqs/${rfqId}`} className="hover:text-foreground transition-colors">
                RFQ Details
              </Link>
              <Icons.chevronRight className="h-4 w-4" />
              <span>Research Results</span>
            </div>
            <DashboardHeader 
              heading="Product Research Results" 
              text={`AI-powered product matching completed on ${new Date(research.researchedAt).toLocaleDateString()}`}
            />
          </div>
        </div>

        {/* Research Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.lightbulb className="h-5 w-5 text-yellow-500" />
              Research Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{research.summary.totalRequirements}</div>
                <div className="text-sm text-muted-foreground">Requirements Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{research.summary.matchedRequirements}</div>
                <div className="text-sm text-muted-foreground">Products Matched</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{research.summary.averageConfidence}%</div>
                <div className="text-sm text-muted-foreground">Avg. Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(research.totalEstimatedCost)}</div>
                <div className="text-sm text-muted-foreground">Est. Total Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements & Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.clipboard className="h-5 w-5" />
                Requirements ({research.requirements.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {research.requirements.map((req, index) => (
                <div key={`req-${req.id}-${index}`} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm">{req.name}</h4>
                    <Badge variant={req.priority === 'high' ? 'destructive' : req.priority === 'medium' ? 'secondary' : 'outline'}>
                      {req.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{req.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Category: {req.category}</span>
                    {req.quantity && <span>Qty: {req.quantity}</span>}
                  </div>
                  {req.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {req.keywords.slice(0, 3).map((keyword, keywordIndex) => (
                        <Badge key={`keyword-${index}-${keywordIndex}`} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {req.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{req.keywords.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Matching Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.package className="h-5 w-5" />
                Matching Products ({research.matches.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {research.matches.map((match, index) => (
                <div key={`match-${match.id}-${index}`} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm line-clamp-2">{match.productName}</h4>
                    <div className="text-right">
                      <Badge variant={match.confidence >= 80 ? 'default' : match.confidence >= 60 ? 'secondary' : 'outline'}>
                        {match.confidence}%
                      </Badge>
                      <div className="font-bold text-green-600 text-sm mt-1">{formatCurrency(match.price)}</div>
                      <div className="text-xs text-muted-foreground">per {match.priceUnit}</div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{match.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium">{match.vendor}</span>
                      <span className="text-muted-foreground ml-2">{match.availability}</span>
                    </div>
                    <Link href={match.sourceUrl} target="_blank" className="text-blue-600 hover:underline">
                      View Source
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2">
                <Icons.download className="h-4 w-4" />
                Export Results
              </Button>
              <Button variant="outline" className="gap-2">
                <Icons.calculator className="h-4 w-4" />
                Generate Quote
              </Button>
              <Link href={`/rfqs/${rfqId}`}>
                <Button variant="outline" className="gap-2">
                  <Icons.arrowLeft className="h-4 w-4" />
                  Back to RFQ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}