"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/shell"
import { DashboardHeader } from "@/components/header"
import { RfqCard } from "@/components/rfq-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { RfqWithRelations, RfqSearchResult } from "@/types/rfq"

export default function RFQPage() {
  const [searchResult, setSearchResult] = useState<RfqSearchResult | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  // Debounced search function
  const searchRfqs = async (keyword?: string) => {
    try {
      setSearchLoading(true)
      const params = new URLSearchParams({
        limit: '20',
        page: '1',
        sort_by: 'deadline',
        sort_order: 'asc',
        status: 'Open'
      })
      
      if (keyword?.trim()) {
        params.set('keyword', keyword.trim())
      }

      const response = await fetch(`/api/rfqs/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSearchResult(data.data)
      } else {
        console.error('Search failed:', data.error)
      }
    } catch (error) {
      console.error('Error searching RFQs:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    searchRfqs().then(() => setLoading(false))
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        searchRfqs(searchTerm)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSave = async (rfqId: string) => {
    try {
      const response = await fetch(`/api/rfqs/${rfqId}/save`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Update the local state to reflect the save
        setSearchResult(prev => prev ? {
          ...prev,
          rfqs: prev.rfqs.map(rfq => 
            rfq.id === rfqId ? { ...rfq, isSaved: true } : rfq
          )
        } : prev)
      }
    } catch (error) {
      console.error('Error saving RFQ:', error)
    }
  }

  const handleUnsave = async (rfqId: string) => {
    try {
      const response = await fetch(`/api/rfqs/${rfqId}/save`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Update the local state to reflect the unsave
        setSearchResult(prev => prev ? {
          ...prev,
          rfqs: prev.rfqs.map(rfq => 
            rfq.id === rfqId ? { ...rfq, isSaved: false } : rfq
          )
        } : prev)
      }
    } catch (error) {
      console.error('Error unsaving RFQ:', error)
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icons.loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <div className="text-muted-foreground">Loading RFQ opportunities...</div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="RFQ Opportunities" 
        text="Browse and search government contracting opportunities."
      />
      
      {/* Search Section */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search RFQs by title, agency, location, or solicitation number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm("")}
            className="shrink-0"
          >
            <Icons.x className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground flex items-center space-x-2">
          {searchLoading && <Icons.loader2 className="h-4 w-4 animate-spin" />}
          <span>
            {searchTerm ? (
              <>
                Showing {searchResult?.rfqs.length || 0} of {searchResult?.total || 0} results for "{searchTerm}"
              </>
            ) : (
              <>
                Showing {searchResult?.rfqs.length || 0} opportunities
              </>
            )}
          </span>
        </div>
      </div>

      {/* RFQ List */}
      <div className="space-y-6">
        {!searchResult || searchResult.rfqs.length === 0 ? (
          <div className="text-center py-12">
            <Icons.search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No RFQs found</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Try adjusting your search terms or clearing the search." 
                : "No RFQ opportunities available at this time."
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          searchResult.rfqs.map((rfq) => (
            <RfqCard
              key={rfq.id}
              rfq={rfq}
              onSave={handleSave}
              onUnsave={handleUnsave}
              showActions={true}
            />
          ))
        )}
      </div>
    </DashboardShell>
  )
}