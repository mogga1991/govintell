import { PrismaClient } from '@prisma/client'
import { checkProfileCompletion } from './user'
import type { UserProfile } from '@/types/user-profile'
import type { RfqWithRelations } from '@/types/rfq'

const db = new PrismaClient()

// Matching algorithm weights
export const MATCHING_WEIGHTS = {
  naics: 0.35,      // 35% - Industry alignment (most important)
  location: 0.20,   // 20% - Geographic proximity
  capability: 0.25, // 25% - Capability/experience match
  size: 0.15,       // 15% - Business size alignment
  completeness: 0.05 // 5% - Profile completion bonus
} as const

// Business size categories for set-aside matching
const BUSINESS_SIZE_CATEGORIES = {
  'Small Business': ['small', 'small_business'],
  '8(a)': ['8a', 'minority', 'disadvantaged'],
  'WOSB': ['women_owned', 'wosb'],
  'VOSB': ['veteran_owned', 'vosb', 'veteran'],
  'SDVOSB': ['service_disabled_veteran', 'sdvosb'],
  'HUBZone': ['hubzone', 'historically_underutilized'],
} as const

export interface MatchingScoreBreakdown {
  overall_score: number
  factors: {
    naics_match: {
      score: number
      weight: number
      explanation: string
      matched_codes?: string[]
    }
    location_match: {
      score: number
      weight: number
      explanation: string
      distance_miles?: number
    }
    capability_match: {
      score: number
      weight: number
      explanation: string
      matching_keywords?: string[]
    }
    size_match: {
      score: number
      weight: number
      explanation: string
      category_match?: boolean
    }
    profile_completeness: {
      score: number
      weight: number
      explanation: string
      completion_percentage?: number
    }
  }
  recommendations: string[]
}

export class RfqMatchingService {
  /**
   * Calculate comprehensive matching score for an RFQ based on user profile
   */
  async calculateMatchingScore(
    userId: string,
    rfq: RfqWithRelations,
    userProfile?: UserProfile
  ): Promise<MatchingScoreBreakdown> {
    // Get user profile if not provided
    if (!userProfile) {
      userProfile = await this.getUserProfile(userId)
      if (!userProfile) {
        throw new Error(`User profile not found for user: ${userId}`)
      }
    }

    // Calculate individual factor scores
    const naicsMatch = this.calculateNAICSMatch(userProfile, rfq)
    const locationMatch = this.calculateLocationMatch(userProfile, rfq)
    const capabilityMatch = this.calculateCapabilityMatch(userProfile, rfq)
    const sizeMatch = this.calculateSizeMatch(userProfile, rfq)
    const completenessBonus = this.calculateCompletenessBonus(userProfile)

    // Calculate weighted overall score
    const overallScore = Math.min(100, Math.round(
      (naicsMatch.score * MATCHING_WEIGHTS.naics) +
      (locationMatch.score * MATCHING_WEIGHTS.location) +
      (capabilityMatch.score * MATCHING_WEIGHTS.capability) +
      (sizeMatch.score * MATCHING_WEIGHTS.size) +
      (completenessBonus.score * MATCHING_WEIGHTS.completeness)
    ))

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      { naicsMatch, locationMatch, capabilityMatch, sizeMatch, completenessBonus },
      userProfile,
      rfq
    )

    return {
      overall_score: overallScore,
      factors: {
        naics_match: {
          ...naicsMatch,
          weight: MATCHING_WEIGHTS.naics
        },
        location_match: {
          ...locationMatch,
          weight: MATCHING_WEIGHTS.location
        },
        capability_match: {
          ...capabilityMatch,
          weight: MATCHING_WEIGHTS.capability
        },
        size_match: {
          ...sizeMatch,
          weight: MATCHING_WEIGHTS.size
        },
        profile_completeness: {
          ...completenessBonus,
          weight: MATCHING_WEIGHTS.completeness
        }
      },
      recommendations
    }
  }

  /**
   * Calculate NAICS code matching score (0-100)
   */
  private calculateNAICSMatch(userProfile: UserProfile, rfq: RfqWithRelations) {
    const userNAICS = userProfile.naics_codes ? 
      userProfile.naics_codes.split(',').map(code => code.trim()) : []
    
    const rfqNAICS = rfq.naics_codes ? 
      rfq.naics_codes.split(',').map(code => code.trim()) : []

    if (userNAICS.length === 0 || rfqNAICS.length === 0) {
      return {
        score: 0,
        explanation: userNAICS.length === 0 ? 
          "Add NAICS codes to your profile for better matching" :
          "RFQ has no NAICS codes specified",
        matched_codes: []
      }
    }

    // Check for exact matches first
    const exactMatches = userNAICS.filter(userCode => 
      rfqNAICS.includes(userCode)
    )

    if (exactMatches.length > 0) {
      return {
        score: 100,
        explanation: `Perfect match: ${exactMatches.length} exact NAICS code${exactMatches.length > 1 ? 's' : ''} aligned`,
        matched_codes: exactMatches
      }
    }

    // Check for industry group matches (first 3 digits)
    const industryMatches = userNAICS.filter(userCode => 
      rfqNAICS.some(rfqCode => 
        userCode.substring(0, 3) === rfqCode.substring(0, 3)
      )
    )

    if (industryMatches.length > 0) {
      return {
        score: 75,
        explanation: `Industry group match: ${industryMatches.length} related NAICS code${industryMatches.length > 1 ? 's' : ''} in same industry`,
        matched_codes: industryMatches
      }
    }

    // Check for sector matches (first 2 digits)
    const sectorMatches = userNAICS.filter(userCode => 
      rfqNAICS.some(rfqCode => 
        userCode.substring(0, 2) === rfqCode.substring(0, 2)
      )
    )

    if (sectorMatches.length > 0) {
      return {
        score: 50,
        explanation: `Sector match: ${sectorMatches.length} NAICS code${sectorMatches.length > 1 ? 's' : ''} in related sector`,
        matched_codes: sectorMatches
      }
    }

    return {
      score: 20,
      explanation: "No NAICS code alignment found",
      matched_codes: []
    }
  }

  /**
   * Calculate location-based matching score (0-100)
   */
  private calculateLocationMatch(userProfile: UserProfile, rfq: RfqWithRelations) {
    // Handle remote/nationwide opportunities
    if (!rfq.state || rfq.location?.toLowerCase().includes('remote') || 
        rfq.location?.toLowerCase().includes('nationwide')) {
      return {
        score: 100,
        explanation: "Remote/nationwide opportunity - location not a constraint"
      }
    }

    // If user has no location data, return neutral score
    if (!userProfile.location && !userProfile.state) {
      return {
        score: 70,
        explanation: "Add location to your profile for better geographic matching"
      }
    }

    const userState = userProfile.state || this.extractStateFromLocation(userProfile.location || undefined)
    const rfqState = rfq.state

    if (!userState || !rfqState) {
      return {
        score: 60,
        explanation: "Location data incomplete for accurate matching"
      }
    }

    // Same state match
    if (userState === rfqState) {
      // Same city bonus
      if (userProfile.city && rfq.city && 
          userProfile.city.toLowerCase() === rfq.city.toLowerCase()) {
        return {
          score: 100,
          explanation: "Excellent location match - same city",
          distance_miles: 0
        }
      }
      
      return {
        score: 90,
        explanation: "Great location match - same state",
        distance_miles: this.estimateInStateDistance()
      }
    }

    // Different states - calculate regional proximity
    const proximityScore = this.calculateStateProximity(userState, rfqState)
    
    return {
      score: proximityScore,
      explanation: proximityScore >= 70 ? 
        "Good regional match - nearby state" : 
        "Different region - may require travel",
      distance_miles: this.estimateInterStateDistance(userState, rfqState)
    }
  }

  /**
   * Calculate capability/experience matching score (0-100)
   */
  private calculateCapabilityMatch(userProfile: UserProfile, rfq: RfqWithRelations) {
    // Extract keywords from RFQ title and description
    const rfqKeywords = this.extractKeywords(
      `${rfq.title} ${rfq.description}`.toLowerCase()
    )

    // Extract user capabilities from profile
    const userCapabilities = this.extractUserCapabilities(userProfile)

    if (userCapabilities.length === 0) {
      return {
        score: 50,
        explanation: "Complete your profile with more details for better capability matching",
        matching_keywords: []
      }
    }

    // Find matching keywords
    const matchingKeywords = userCapabilities.filter(capability =>
      rfqKeywords.some(keyword => 
        keyword.includes(capability) || capability.includes(keyword)
      )
    )

    const matchPercentage = matchingKeywords.length / Math.max(userCapabilities.length, 1)

    let score = Math.round(matchPercentage * 100)
    let explanation = ""

    if (score >= 80) {
      explanation = `Excellent capability match: ${matchingKeywords.length} strong alignments found`
    } else if (score >= 60) {
      explanation = `Good capability match: ${matchingKeywords.length} relevant skills identified`
    } else if (score >= 40) {
      explanation = `Moderate capability match: ${matchingKeywords.length} related skills found`
    } else {
      explanation = "Limited capability match - consider expanding your service offerings"
      score = Math.max(score, 30) // Minimum score for effort
    }

    return {
      score,
      explanation,
      matching_keywords: matchingKeywords
    }
  }

  /**
   * Calculate business size/set-aside matching score (0-100)
   */
  private calculateSizeMatch(userProfile: UserProfile, rfq: RfqWithRelations) {
    // If no set-aside requirements, all businesses can compete
    if (!rfq.set_aside_type) {
      return {
        score: 100,
        explanation: "Open competition - no set-aside restrictions",
        category_match: true
      }
    }

    // Check if user's business qualifies for the set-aside
    const userBusinessType = userProfile.business_type?.toLowerCase() || ''
    const setAsideType = rfq.set_aside_type

    const qualifyingTerms = BUSINESS_SIZE_CATEGORIES[setAsideType as keyof typeof BUSINESS_SIZE_CATEGORIES] || []
    
    const qualifies = qualifyingTerms.some(term => 
      userBusinessType.includes(term.toLowerCase())
    )

    if (qualifies) {
      return {
        score: 100,
        explanation: `Perfect match: Your business qualifies for ${setAsideType} set-aside`,
        category_match: true
      }
    }

    // If user hasn't specified business type, give benefit of doubt
    if (!userBusinessType) {
      return {
        score: 75,
        explanation: `${setAsideType} set-aside required - verify your business qualification`,
        category_match: false
      }
    }

    // Small business can often compete in many categories
    if (userBusinessType.includes('small') && setAsideType !== 'Large Business') {
      return {
        score: 60,
        explanation: `May qualify: Small businesses often eligible for ${setAsideType} opportunities`,
        category_match: false
      }
    }

    return {
      score: 30,
      explanation: `Limited eligibility: ${setAsideType} set-aside may not match your business type`,
      category_match: false
    }
  }

  /**
   * Calculate profile completeness bonus (0-100)
   */
  private calculateCompletenessBonus(userProfile: UserProfile) {
    const profileStatus = checkProfileCompletion(userProfile)
    const { completionPercentage } = profileStatus

    return {
      score: completionPercentage,
      explanation: completionPercentage === 100 ? 
        "Complete profile provides maximum matching accuracy" :
        `${completionPercentage}% profile complete - add more details to improve matching`,
      completion_percentage: completionPercentage
    }
  }

  /**
   * Generate actionable recommendations based on matching analysis
   */
  private generateRecommendations(
    factors: any,
    userProfile: UserProfile,
    rfq: RfqWithRelations
  ): string[] {
    const recommendations: string[] = []

    // NAICS recommendations
    if (factors.naicsMatch.score < 50) {
      recommendations.push("Consider adding relevant NAICS codes to your profile to improve industry matching")
    } else if (factors.naicsMatch.score === 100) {
      recommendations.push("Excellent NAICS alignment - this opportunity matches your registered capabilities")
    }

    // Location recommendations  
    if (factors.locationMatch.score < 70 && rfq.state) {
      recommendations.push(`Consider if you can service ${rfq.state} operations or partner with local businesses`)
    }

    // Capability recommendations
    if (factors.capabilityMatch.score < 60) {
      recommendations.push("Review the RFQ requirements to identify skill gaps or partnership opportunities")
    }

    // Set-aside recommendations
    if (factors.sizeMatch.score < 100 && rfq.set_aside_type) {
      recommendations.push(`Verify ${rfq.set_aside_type} qualification or consider teaming arrangements`)
    }

    // Profile completeness
    if (factors.completenessBonus.score < 100) {
      recommendations.push("Complete your business profile to improve matching accuracy across all opportunities")
    }

    // Contract value considerations
    if (rfq.contract_value_min && Number(rfq.contract_value_min) > 10000000) {
      recommendations.push("Large contract value - consider teaming with established primes if you're a small business")
    }

    return recommendations
  }

  // Helper methods
  private async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    return user || undefined
  }

  private extractStateFromLocation(location?: string): string | null {
    if (!location) return null
    
    // Simple state extraction - could be enhanced with full address parsing
    const statePattern = /\b([A-Z]{2})\b/g
    const matches = location.match(statePattern)
    return matches ? matches[matches.length - 1] : null
  }

  private estimateInStateDistance(): number {
    return Math.floor(Math.random() * 200) + 50 // 50-250 miles estimate
  }

  private estimateInterStateDistance(state1: string, state2: string): number {
    // Simplified distance estimation - could use actual geocoding
    const adjacentStates = {
      'CA': ['NV', 'AZ', 'OR'],
      'TX': ['OK', 'LA', 'AR', 'NM'],
      'FL': ['GA', 'AL'],
      'NY': ['NJ', 'CT', 'PA', 'VT', 'MA'],
      'VA': ['MD', 'DC', 'WV', 'KY', 'TN', 'NC']
    }

    const adjacent = adjacentStates[state1 as keyof typeof adjacentStates]
    if (adjacent && adjacent.includes(state2)) {
      return Math.floor(Math.random() * 300) + 100 // 100-400 miles
    }
    
    return Math.floor(Math.random() * 1000) + 500 // 500-1500 miles
  }

  private calculateStateProximity(state1: string, state2: string): number {
    // Regional proximity scoring
    const regions = {
      northeast: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
      southeast: ['DE', 'MD', 'DC', 'VA', 'WV', 'KY', 'TN', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS'],
      midwest: ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
      southwest: ['AZ', 'NM', 'TX', 'OK'],
      west: ['MT', 'WY', 'CO', 'UT', 'ID', 'WA', 'OR', 'NV', 'CA'],
      other: ['AK', 'HI']
    }

    for (const [region, states] of Object.entries(regions)) {
      if (states.includes(state1) && states.includes(state2)) {
        return 80 // Same region
      }
    }
    
    return 40 // Different regions
  }

  private extractKeywords(text: string): string[] {
    // Extract meaningful keywords from text
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 20) // Limit to most relevant keywords
  }

  private extractUserCapabilities(userProfile: UserProfile): string[] {
    const capabilities: string[] = []
    
    // Extract from NAICS codes (enhanced mapping)
    if (userProfile.naics_codes) {
      const naics = userProfile.naics_codes.split(',').map(code => code.trim())
      naics.forEach(code => {
        if (code.startsWith('541511')) {
          capabilities.push(
            'software development', 'programming', 'it services', 'system administration',
            'cloud computing', 'aws', 'infrastructure', 'technical support', 'software',
            'systems', 'computer', 'technology', 'migration'
          )
        }
        if (code.startsWith('541512')) {
          capabilities.push(
            'computer systems design', 'it consulting', 'systems design',
            'technical consulting', 'system architecture', 'infrastructure design'
          )
        }
        if (code.startsWith('541330')) {
          capabilities.push('engineering', 'technical services', 'design services')
        }
        if (code.startsWith('236')) {
          capabilities.push('construction', 'building', 'contracting', 'renovation')
        }
        if (code.startsWith('541690')) {
          capabilities.push('cybersecurity', 'security', 'cyber', 'information security')
        }
        if (code.startsWith('541712')) {
          capabilities.push('research', 'development', 'r&d', 'innovation', 'analysis')
        }
      })
    }

    // Extract from company name with better matching
    if (userProfile.company_name) {
      const companyLower = userProfile.company_name.toLowerCase()
      if (companyLower.includes('tech')) capabilities.push('technology', 'technical', 'tech')
      if (companyLower.includes('solutions')) capabilities.push('solutions', 'consulting', 'services')
      if (companyLower.includes('consulting')) capabilities.push('consulting', 'advisory', 'services')
      if (companyLower.includes('construction')) capabilities.push('construction', 'building')
      if (companyLower.includes('systems')) capabilities.push('systems', 'technical', 'it')
      if (companyLower.includes('software')) capabilities.push('software', 'development', 'programming')
    }

    return [...new Set(capabilities)] // Remove duplicates
  }
}

// Export singleton instance
export const rfqMatchingService = new RfqMatchingService()