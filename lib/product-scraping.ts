import { ProductMatch, ProductRequirement, ScrapingSource } from '@/types/product-research'

export class ProductScrapingService {
  private readonly sources: ScrapingSource[] = [
    {
      name: 'Amazon Business',
      domain: 'amazon.com',
      searchUrl: 'https://www.amazon.com/s?k={query}&ref=sr_pg_1',
      selectors: {
        productName: '[data-component-type="s-search-result"] h2 a span',
        price: '.a-price-whole',
        description: '[data-component-type="s-search-result"] .a-size-base',
        availability: '.a-color-success',
        imageUrl: '[data-component-type="s-search-result"] img'
      },
      rateLimit: 10,
      priority: 8
    },
    {
      name: 'GSA Advantage',
      domain: 'gsaadvantage.gov',
      searchUrl: 'https://www.gsaadvantage.gov/advgsa/advantage/search/search_result.do?searchFor={query}',
      selectors: {
        productName: '.product-title',
        price: '.price',
        description: '.product-description',
        availability: '.availability',
        imageUrl: '.product-image img'
      },
      rateLimit: 5,
      priority: 10 // Highest priority for government purchasing
    },
    {
      name: 'CDW Government',
      domain: 'cdwg.com',
      searchUrl: 'https://www.cdwg.com/search/?key={query}',
      selectors: {
        productName: '.search-result-product-name',
        price: '.price',
        description: '.search-result-description',
        availability: '.availability-message',
        imageUrl: '.search-result-image img'
      },
      rateLimit: 8,
      priority: 9
    },
    {
      name: 'Grainger',
      domain: 'grainger.com',
      searchUrl: 'https://www.grainger.com/search?searchQuery={query}',
      selectors: {
        productName: '.product-name',
        price: '.pricing-price',
        description: '.product-description',
        availability: '.availability',
        imageUrl: '.product-image img'
      },
      rateLimit: 6,
      priority: 7
    },
    {
      name: 'Dell Technologies',
      domain: 'dell.com',
      searchUrl: 'https://www.dell.com/en-us/search/{query}',
      selectors: {
        productName: '.product-title',
        price: '.price',
        description: '.product-summary',
        availability: '.availability-msg',
        imageUrl: '.product-image img'
      },
      rateLimit: 5,
      priority: 8
    }
  ]

  /**
   * Search for products matching the requirements
   */
  async findProductMatches(requirements: ProductRequirement[]): Promise<ProductMatch[]> {
    const allMatches: ProductMatch[] = []
    
    for (const requirement of requirements) {
      try {
        const matches = await this.searchForRequirement(requirement)
        allMatches.push(...matches)
      } catch (error) {
        console.error(`Error searching for requirement ${requirement.id}:`, error)
        // Continue with other requirements even if one fails
      }
    }
    
    return this.rankAndDeduplicateMatches(allMatches)
  }

  /**
   * Search for products matching a specific requirement
   */
  private async searchForRequirement(requirement: ProductRequirement): Promise<ProductMatch[]> {
    const matches: ProductMatch[] = []
    const searchQueries = this.generateSearchQueries(requirement)
    
    // Search using multiple sources
    const sources = this.sources
      .filter(source => this.isSourceRelevant(source, requirement))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3) // Use top 3 most relevant sources
    
    for (const source of sources) {
      for (const query of searchQueries.slice(0, 2)) { // Use top 2 queries per source
        try {
          const sourceMatches = await this.searchWithSource(source, query, requirement)
          matches.push(...sourceMatches)
          
          // Rate limiting
          await this.delay(60000 / source.rateLimit) // Convert rate limit to delay
        } catch (error) {
          console.error(`Error searching ${source.name} for "${query}":`, error)
        }
      }
    }
    
    return matches
  }

  /**
   * Generate search queries for a requirement
   */
  private generateSearchQueries(requirement: ProductRequirement): string[] {
    const queries: string[] = []
    
    // Primary query - requirement name + category
    queries.push(`${requirement.name} ${requirement.category}`.trim())
    
    // Secondary query - top keywords
    if (requirement.keywords.length > 0) {
      queries.push(requirement.keywords.slice(0, 3).join(' '))
    }
    
    // Specification-based queries
    if (requirement.specifications) {
      const specValues = Object.values(requirement.specifications)
        .filter(val => val.length < 50)
        .slice(0, 2)
      
      if (specValues.length > 0) {
        queries.push(`${requirement.name} ${specValues.join(' ')}`.trim())
      }
    }
    
    // Category + keywords query
    queries.push(`${requirement.category} ${requirement.keywords.slice(0, 2).join(' ')}`.trim())
    
    return queries.filter(q => q.length > 3).slice(0, 4)
  }

  /**
   * Simulate product search with realistic mock data
   * In production, this would perform actual web scraping
   */
  private async searchWithSource(
    source: ScrapingSource, 
    query: string, 
    requirement: ProductRequirement
  ): Promise<ProductMatch[]> {
    // Simulate network delay
    await this.delay(Math.random() * 1000 + 500)
    
    // Generate mock product matches based on the requirement
    const matches: ProductMatch[] = []
    const numResults = Math.floor(Math.random() * 5) + 2 // 2-6 results
    
    for (let i = 0; i < numResults; i++) {
      const match = this.generateMockProductMatch(source, query, requirement, i)
      matches.push(match)
    }
    
    return matches
  }

  /**
   * Generate realistic mock product data
   */
  private generateMockProductMatch(
    source: ScrapingSource,
    query: string,
    requirement: ProductRequirement,
    index: number
  ): ProductMatch {
    const basePrice = this.estimateBasePrice(requirement.category)
    const variation = (Math.random() - 0.5) * 0.4 // ±20% variation
    const price = Math.round(basePrice * (1 + variation))
    
    // Generate realistic vendor names
    const vendors = this.getVendorsForCategory(requirement.category)
    const vendor = vendors[Math.floor(Math.random() * vendors.length)]
    
    // Calculate confidence based on keyword matching
    const confidence = this.calculateMatchConfidence(query, requirement, vendor)
    
    return {
      id: `match-${requirement.id}-${source.name.toLowerCase().replace(' ', '')}-${index}`,
      requirementId: requirement.id,
      productName: this.generateProductName(requirement, vendor, index),
      description: this.generateProductDescription(requirement),
      vendor,
      price,
      priceUnit: requirement.unitType || 'each',
      currency: 'USD',
      availability: this.generateAvailability(),
      sourceUrl: `${source.searchUrl.replace('{query}', encodeURIComponent(query))}#result${index}`,
      confidence,
      specifications: this.generateMatchingSpecs(requirement),
      imageUrl: this.generateImageUrl(requirement.category),
      lastUpdated: new Date()
    }
  }

  private estimateBasePrice(category: string): number {
    const basePrices = {
      'Cloud Services': 500,
      'Software': 1200,
      'Security Software': 800,
      'Server Hardware': 3500,
      'Computing Devices': 1100,
      'Network Hardware': 650,
      'Medical Devices': 8500,
      'Medical Supplies': 45,
      'Building Materials': 85,
      'Construction Equipment': 15000,
      'Office Furniture': 320,
      'Office Supplies': 25,
      'Vehicles': 28000,
      'Technology': 950,
      'Equipment': 1200,
      'General Services': 150
    }
    
    return basePrices[category] || 200
  }

  private getVendorsForCategory(category: string): string[] {
    const vendorMap = {
      'Cloud Services': ['Amazon Web Services', 'Microsoft Azure', 'Google Cloud', 'IBM Cloud'],
      'Software': ['Microsoft', 'Adobe', 'Oracle', 'SAP', 'Salesforce'],
      'Security Software': ['Symantec', 'McAfee', 'Trend Micro', 'FireEye', 'CrowdStrike'],
      'Server Hardware': ['Dell Technologies', 'HP Enterprise', 'IBM', 'Cisco', 'Lenovo'],
      'Computing Devices': ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS'],
      'Network Hardware': ['Cisco', 'Juniper Networks', 'Aruba', 'Fortinet', 'SonicWall'],
      'Medical Devices': ['GE Healthcare', 'Philips Healthcare', 'Siemens Healthineers', 'Medtronic'],
      'Medical Supplies': ['3M', 'Johnson & Johnson', 'BD', 'Cardinal Health', 'Medline'],
      'Building Materials': ['Home Depot Pro', 'Lowes Pro', 'Ferguson', 'Grainger', 'MSC Industrial'],
      'Construction Equipment': ['Caterpillar', 'John Deere', 'Komatsu', 'Volvo Construction'],
      'Office Furniture': ['Herman Miller', 'Steelcase', 'Knoll', 'Haworth', 'HON'],
      'Office Supplies': ['Staples Business', 'Office Depot', 'Amazon Business', 'W.B. Mason'],
      'Vehicles': ['General Motors Fleet', 'Ford Commercial', 'Ram Commercial', 'Nissan Fleet']
    }
    
    return vendorMap[category] || ['Generic Vendor A', 'Generic Vendor B', 'Reliable Supplier Co.']
  }

  private generateProductName(requirement: ProductRequirement, vendor: string, index: number): string {
    const prefixes = ['Professional', 'Enterprise', 'Commercial', 'Industrial', 'Advanced', 'Premium']
    const suffixes = ['Pro', 'Enterprise', 'Business', 'Commercial', 'Series', 'Elite']
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    const model = `Model ${String.fromCharCode(65 + index)}${Math.floor(Math.random() * 9000) + 1000}`
    
    return `${vendor} ${prefix} ${requirement.name.split(' ')[0]} ${suffix} ${model}`
  }

  private generateProductDescription(requirement: ProductRequirement): string {
    const features = [
      'High-quality construction',
      'Government-grade compliance',
      'Extended warranty included',
      'Professional installation available',
      'Bulk pricing available',
      'Same-day shipping',
      '24/7 technical support',
      'GSA Schedule pricing'
    ]
    
    const selectedFeatures = features
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .join(', ')
    
    return `${requirement.description}. Features: ${selectedFeatures}.`
  }

  private calculateMatchConfidence(query: string, requirement: ProductRequirement, vendor: string): number {
    let confidence = 70 // Base confidence
    
    // Keyword matching
    const queryWords = query.toLowerCase().split(' ')
    const reqWords = requirement.keywords.map(k => k.toLowerCase())
    const matchingKeywords = queryWords.filter(word => reqWords.some(rw => rw.includes(word)))
    
    confidence += Math.min(matchingKeywords.length * 5, 20)
    
    // Vendor reputation (mock scoring)
    const highRepVendors = ['Dell', 'HP', 'Microsoft', 'Cisco', 'Amazon']
    if (highRepVendors.some(v => vendor.includes(v))) {
      confidence += 10
    }
    
    // Add random variation
    confidence += Math.floor(Math.random() * 10) - 5
    
    return Math.min(Math.max(confidence, 60), 95)
  }

  private generateMatchingSpecs(requirement: ProductRequirement): Record<string, string> {
    if (!requirement.specifications) return {}
    
    const mockSpecs = { ...requirement.specifications }
    
    // Add some additional realistic specs
    mockSpecs['Warranty'] = ['1 year', '2 years', '3 years', '5 years'][Math.floor(Math.random() * 4)]
    mockSpecs['Availability'] = ['In Stock', 'Ships in 1-2 days', 'Ships in 3-5 days'][Math.floor(Math.random() * 3)]
    
    return mockSpecs
  }

  private generateAvailability(): string {
    const options = [
      'In Stock - Ships Next Day',
      'In Stock - Ships 2-3 Days', 
      'Limited Stock - Ships 1 Week',
      'Available - Ships 2-3 Weeks',
      'Special Order - 4-6 Weeks'
    ]
    return options[Math.floor(Math.random() * options.length)]
  }

  private generateImageUrl(category: string): string {
    // In production, this would extract actual product images
    const imageMap = {
      'Server Hardware': 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Server',
      'Computing Devices': 'https://via.placeholder.com/300x200/5CB85C/FFFFFF?text=Laptop',
      'Network Hardware': 'https://via.placeholder.com/300x200/F0AD4E/FFFFFF?text=Router',
      'Office Furniture': 'https://via.placeholder.com/300x200/D9534F/FFFFFF?text=Desk',
      'Medical Devices': 'https://via.placeholder.com/300x200/5BC0DE/FFFFFF?text=Medical',
      'Vehicles': 'https://via.placeholder.com/300x200/292B2C/FFFFFF?text=Vehicle'
    }
    
    return imageMap[category] || 'https://via.placeholder.com/300x200/999999/FFFFFF?text=Product'
  }

  private isSourceRelevant(source: ScrapingSource, requirement: ProductRequirement): boolean {
    // GSA Advantage is always relevant for government contracts
    if (source.name.includes('GSA')) return true
    
    // Category-specific source relevance
    if (requirement.category.includes('Technology') && source.name.includes('CDW')) return true
    if (requirement.category.includes('Medical') && source.name.includes('Grainger')) return true
    if (requirement.category.includes('Office') && source.name.includes('Amazon')) return true
    
    return true // All sources are generally relevant
  }

  private rankAndDeduplicateMatches(matches: ProductMatch[]): ProductMatch[] {
    // Remove duplicates based on product name similarity
    const uniqueMatches = matches.filter((match, index, array) => {
      return !array.slice(0, index).some(prev => 
        this.calculateSimilarity(match.productName, prev.productName) > 0.8
      )
    })
    
    // Sort by confidence score (descending)
    return uniqueMatches.sort((a, b) => b.confidence - a.confidence)
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const productScrapingService = new ProductScrapingService()