import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, ExternalLink, Calendar, Building, FileText, Link2 } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  solicitation_number?: string;
  agency?: string;
  department?: string;
  description: string;
  deadline?: string;
  posted_date?: string;
  sam_url?: string;
  source: string;
  notice_type?: string;
  classification_code?: string;
}

interface SearchParams {
  keyword: string;
  department: string;
  posted_days_ago: number;
  size: number;
}

interface OpportunitySearchProps {
  initialKeyword?: string;
  autoRun?: boolean;
}

const OpportunitySearch: React.FC<OpportunitySearchProps> = ({ initialKeyword, autoRun }) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: initialKeyword || '',
    department: '',
    posted_days_ago: 30,
    size: 20
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [importUrl, setImportUrl] = useState('');
  const [showUrlImport, setShowUrlImport] = useState(false);

  // Auto run a search if an initial keyword is provided
  useEffect(() => {
    if (autoRun && (initialKeyword && initialKeyword.trim().length > 0)) {
      setTimeout(() => {
        handleSearch();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        keyword: searchParams.keyword,
        department: searchParams.department,
        posted_days_ago: searchParams.posted_days_ago.toString(),
        size: searchParams.size.toString(),
        page: currentPage.toString()
      });

      const response = await fetch(`http://localhost:8002/api/v2/opportunities/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOpportunities(data.opportunities || []);
        setTotalResults(data.total_results || 0);
      } else {
        console.error('Search failed:', data.detail);
        alert('Search failed: ' + data.detail);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please check your connection.');
    }
    setLoading(false);
  };

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8002/api/v2/opportunities/import-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: importUrl })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Opportunity imported successfully!');
        setImportUrl('');
        setShowUrlImport(false);
        // Refresh search results
        handleSearch();
      } else {
        console.error('Import failed:', data.detail);
        alert('Import failed: ' + data.detail);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please check your connection.');
    }
    setLoading(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, keyword: e.target.value });
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, department: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Government RFQ Search
        </h1>
        <p className="text-gray-600">
          Find Request for Quote (RFQ) opportunities by products you sell, keywords, or departments
        </p>
      </div>

      {/* Search Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Keyword Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords / Products
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchParams.keyword}
                onChange={handleKeywordChange}
                placeholder="e.g. laptops, office supplies, IT services"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department / Agency
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchParams.department}
                onChange={handleDepartmentChange}
                placeholder="e.g. Defense, Navy, Army"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posted Within
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={searchParams.posted_days_ago}
                onChange={(e) => setSearchParams({ ...searchParams, posted_days_ago: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Results Per Page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Results
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={searchParams.size}
                onChange={(e) => setSearchParams({ ...searchParams, size: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Searching...' : 'Search Opportunities'}
          </button>

          <button
            onClick={() => setShowUrlImport(!showUrlImport)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Link2 className="h-4 w-4" />
            Import from URL
          </button>
        </div>

        {/* URL Import */}
        {showUrlImport && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SAM.gov Opportunity URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://sam.gov/opp/[opportunity-id]/view"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={handleImportUrl}
                disabled={loading || !importUrl.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Import
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      {totalResults > 0 && (
        <div className="mb-4">
          <p className="text-gray-600">
            Found {totalResults.toLocaleString()} opportunities
            {searchParams.keyword && ` matching "${searchParams.keyword}"`}
          </p>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {opportunities.filter(opp => 
          // Focus on RFQ-related notice types
          !opp.notice_type || 
          opp.notice_type.toLowerCase().includes('solicitation') ||
          opp.notice_type.toLowerCase().includes('rfq') ||
          opp.notice_type.toLowerCase().includes('combined')
        ).map((opp) => (
          <div key={opp.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {opp.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  {opp.solicitation_number && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {opp.solicitation_number}
                    </span>
                  )}
                  
                  {opp.agency && (
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {opp.agency}
                    </span>
                  )}
                  
                  {opp.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {formatDate(opp.deadline)}
                    </span>
                  )}
                  
                  {opp.posted_date && (
                    <span className="text-gray-500">
                      Posted: {formatDate(opp.posted_date)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {opp.notice_type && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {opp.notice_type}
                    </span>
                  )}
                  
                  {opp.classification_code && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      PSC: {opp.classification_code}
                    </span>
                  )}
                  
                  <span className={`px-2 py-1 rounded text-xs ${
                    opp.source === 'sam_gov_api' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {opp.source === 'sam_gov_api' ? 'Live from SAM.gov' : 'Cached'}
                  </span>
                </div>

                {opp.description && (
                  <p className="text-gray-700 line-clamp-2">
                    {opp.description.length > 200 
                      ? `${opp.description.substring(0, 200)}...` 
                      : opp.description
                    }
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                {opp.sam_url && (
                  <a
                    href={opp.sam_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on SAM.gov
                  </a>
                )}
                
                <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4" />
                  Generate Quote
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && opportunities.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching opportunities...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && opportunities.length === 0 && totalResults === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or expanding the date range
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalResults > searchParams.size && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => {
              setCurrentPage(Math.max(0, currentPage - 1));
              setTimeout(handleSearch, 100);
            }}
            disabled={currentPage === 0}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Page {currentPage + 1} of {Math.ceil(totalResults / searchParams.size)}
          </span>
          
          <button
            onClick={() => {
              setCurrentPage(currentPage + 1);
              setTimeout(handleSearch, 100);
            }}
            disabled={(currentPage + 1) * searchParams.size >= totalResults}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default OpportunitySearch;