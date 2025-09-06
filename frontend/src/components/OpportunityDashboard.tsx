import React, { useState, useEffect } from 'react'
import { BarChart3, Database, Sync, AlertCircle, CheckCircle, Clock, Globe } from 'lucide-react'

interface CollectionStatus {
  total_opportunities: number
  new_today: number
  product_related: number
  platforms: Record<string, number>
  last_collection: string | null
}

interface Platform {
  name: string
  full_name: string
  description: string
  data_types: string[]
  classification_system: string
  update_frequency: string
  status: string
}

const OpportunityDashboard: React.FC = () => {
  const [status, setStatus] = useState<CollectionStatus | null>(null)
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statusResponse, platformsResponse] = await Promise.all([
        fetch('http://localhost:8002/api/v2/opportunities/collection-status'),
        fetch('http://localhost:8002/api/v2/opportunities/platforms')
      ])

      if (statusResponse.ok && platformsResponse.ok) {
        const statusData = await statusResponse.json()
        const platformsData = await platformsResponse.json()
        
        setStatus(statusData)
        setPlatforms(platformsData.platforms)
        setError(null)
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const triggerManualCollection = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/v2/opportunities/manual-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: ['SAM', 'GSA_EBUY'], force_refresh: false })
      })

      if (response.ok) {
        alert('Manual collection started. Check back in 5-15 minutes for updates.')
      } else {
        throw new Error('Failed to start manual collection')
      }
    } catch (err) {
      alert('Error starting collection: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />
      default: return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RFQ Intelligence Dashboard</h1>
                <p className="text-gray-600">Real-time government procurement opportunities</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={triggerManualCollection}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Sync className="h-4 w-4" />
                  Manual Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Opportunities</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {status?.total_opportunities.toLocaleString() || '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">New Today</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {status?.new_today.toLocaleString() || '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Product Related</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {status?.product_related.toLocaleString() || '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Last Collection</dt>
                    <dd className="text-sm font-bold text-gray-900">
                      {formatDate(status?.last_collection || null)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Overview */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Data Sources</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {platforms.map((platform) => (
                  <div key={platform.name} className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(platform.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{platform.full_name}</h4>
                        <p className="text-xs text-gray-500">{platform.description}</p>
                        <div className="mt-1">
                          <span className="text-xs text-gray-400">
                            {platform.classification_system} • {platform.update_frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {status?.platforms[platform.name]?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-500">opportunities</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Collection Stats */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Collection Statistics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Platforms</span>
                  <span className="text-sm font-medium text-gray-900">
                    {platforms.filter(p => p.status === 'active').length} of {platforms.length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Product Coverage</span>
                  <span className="text-sm font-medium text-gray-900">
                    {status ? Math.round((status.product_related / status.total_opportunities) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data Sources</span>
                  <div className="text-right">
                    {Object.entries(status?.platforms || {}).map(([platform, count]) => (
                      <div key={platform} className="text-xs text-gray-500">
                        {platform}: {count.toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    <strong>Next scheduled collection:</strong> Daily at 6:00 AM EST<br/>
                    <strong>Collection types:</strong> RFQs, Product Solicitations, IFBs<br/>
                    <strong>Filters applied:</strong> PSC codes 10-69 (products only)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a 
                href="/search"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-gray-900">Search Opportunities</h4>
                <p className="text-sm text-gray-500 mt-1">Find RFQs and solicitations</p>
              </a>
              
              <button 
                onClick={triggerManualCollection}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <Sync className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium text-gray-900">Refresh Data</h4>
                <p className="text-sm text-gray-500 mt-1">Trigger manual collection</p>
              </button>
              
              <a 
                href="/admin"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-medium text-gray-900">View Analytics</h4>
                <p className="text-sm text-gray-500 mt-1">Collection reports & trends</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpportunityDashboard