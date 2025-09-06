import React, { useState } from 'react'
import { Search } from 'lucide-react'

interface LandingSearchProps {
  onSubmit: (keyword: string) => void
}

const LandingSearch: React.FC<LandingSearchProps> = ({ onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSubmit(searchTerm.trim())
    }
  }

  return (
    <div className="min-h-screen bg-[#202124] text-gray-100 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-8 select-none">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">RFQ Intelligence</h1>
        <p className="mt-3 text-lg text-gray-300">Search Federal Request for Quote Opportunities</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-[#303134] border border-[#5f6368] hover:bg-[#3a3b3c] transition-colors">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search RFQ opportunities..."
            className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-400 text-base"
          />
        </div>

        <div className="flex items-center justify-center gap-3 mt-7">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#303134] text-gray-200 border border-[#5f6368] hover:border-gray-400"
          >
            Search RFQs
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#303134] text-gray-200 border border-[#5f6368] hover:border-gray-400"
          >
            I'm Feeling Curious
          </button>
        </div>
      </form>
    </div>
  )
}

export default LandingSearch