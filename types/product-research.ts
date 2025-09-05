export interface ProductRequirement {
  id: string
  name: string
  description: string
  category: string
  specifications?: Record<string, string>
  quantity?: number
  unitType?: string // 'each', 'set', 'license', 'hour', etc.
  keywords: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface ProductMatch {
  id: string
  requirementId: string
  productName: string
  description: string
  vendor: string
  price: number
  priceUnit: string
  currency: string
  availability: string
  sourceUrl: string
  confidence: number // 0-100 match confidence
  specifications?: Record<string, string>
  imageUrl?: string
  lastUpdated: Date
}

export interface ProductResearchResult {
  rfqId: string
  requirements: ProductRequirement[]
  matches: ProductMatch[]
  totalEstimatedCost: number
  currency: string
  researchedAt: Date
  status: 'researching' | 'completed' | 'failed'
  summary: {
    totalRequirements: number
    matchedRequirements: number
    averageConfidence: number
    estimatedDelivery: string
  }
}

export interface QuoteLineItem {
  id: string
  requirementId: string
  productMatchId?: string
  productName: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  vendor?: string
  specifications?: Record<string, string>
  notes?: string
}

export interface GeneratedQuote {
  id: string
  rfqId: string
  lineItems: QuoteLineItem[]
  subtotal: number
  taxRate?: number
  taxAmount?: number
  shippingCost?: number
  totalAmount: number
  currency: string
  validUntil: Date
  notes?: string
  terms?: string
  generatedAt: Date
  status: 'draft' | 'submitted' | 'accepted' | 'rejected'
}

export interface ProductSearchFilters {
  categories?: string[]
  priceRange?: {
    min: number
    max: number
  }
  vendors?: string[]
  availability?: string[]
  minConfidence?: number
}

// Web scraping configuration
export interface ScrapingSource {
  name: string
  domain: string
  searchUrl: string
  selectors: {
    productName: string
    price: string
    description: string
    availability: string
    imageUrl?: string
  }
  rateLimit: number // requests per minute
  priority: number // 1-10, higher is better
}