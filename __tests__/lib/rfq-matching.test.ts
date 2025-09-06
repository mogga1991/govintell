import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { RfqMatchingService } from '@/lib/rfq-matching'
import type { UserProfile } from '@/types/user-profile'
import type { RfqWithRelations } from '@/types/rfq'

const db = new PrismaClient()
const matchingService = new RfqMatchingService()

// Test user profiles
const testUsers = {
  itConsultant: {
    id: 'test-user-it',
    name: 'Tech Solutions LLC',
    email: 'test@techsolutions.com',
    company_name: 'Tech Solutions LLC',
    naics_codes: '541511,541512', // IT services
    psc_codes: 'D301,D302',
    location: 'Washington, DC',
    state: 'DC',
    city: 'Washington',
    business_type: 'Small Business',
    business_verified: true,
    profile_completed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  } as UserProfile,

  constructionCompany: {
    id: 'test-user-construction', 
    name: 'ABC Construction Inc',
    email: 'test@abcconstruction.com',
    company_name: 'ABC Construction Inc',
    naics_codes: '236220,238210', // Building construction
    psc_codes: 'Y1AA,Y1BB',
    location: 'Austin, TX',
    state: 'TX',
    city: 'Austin',
    business_type: 'Small Business',
    business_verified: true,
    profile_completed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  } as UserProfile,

  incompleteProfile: {
    id: 'test-user-incomplete',
    name: 'Startup LLC',
    email: 'test@startup.com',
    company_name: 'Startup LLC',
    naics_codes: '', // No NAICS codes
    psc_codes: null,
    location: null,
    state: null,
    city: null,
    business_type: null,
    business_verified: false,
    profile_completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  } as UserProfile
}

// Test RFQs
const testRfqs = {
  itProject: {
    id: 'test-rfq-it',
    title: 'Cloud Infrastructure Migration Services',
    description: 'Comprehensive cloud migration project requiring AWS expertise, system administration, and 24/7 support capabilities. Must have experience with federal systems.',
    agency: 'Department of Energy',
    naics_codes: '541511,541512',
    psc_codes: 'D301,D302',
    location: 'Washington, DC',
    state: 'DC', 
    city: 'Washington',
    contract_value_min: 2000000,
    contract_value_max: 3000000,
    contract_type: 'T&M',
    set_aside_type: 'Small Business',
    status: 'Open',
    deadline_date: new Date('2025-12-01'),
    posted_date: new Date('2025-09-01'),
    response_date: new Date('2025-11-25'),
    solicitation_number: 'DOE-TEST-IT-001',
    source_url: 'https://test.gov/it',
    source_system: 'SAM.gov',
    createdAt: new Date(),
    updatedAt: new Date()
  } as RfqWithRelations,

  constructionProject: {
    id: 'test-rfq-construction',
    title: 'Federal Building Renovation',
    description: 'Major renovation of federal building including structural work, HVAC updates, electrical systems, and sustainable design features.',
    agency: 'General Services Administration',
    naics_codes: '236220,238210',
    psc_codes: 'Y1AA,Y1BB', 
    location: 'Austin, TX',
    state: 'TX',
    city: 'Austin',
    contract_value_min: 5000000,
    contract_value_max: 8000000,
    contract_type: 'FFP',
    set_aside_type: 'Small Business',
    status: 'Open',
    deadline_date: new Date('2025-11-15'),
    posted_date: new Date('2025-08-15'),
    response_date: new Date('2025-11-10'),
    solicitation_number: 'GSA-TEST-CON-001',
    source_url: 'https://test.gov/construction',
    source_system: 'SAM.gov',
    createdAt: new Date(),
    updatedAt: new Date()
  } as RfqWithRelations,

  remoteProject: {
    id: 'test-rfq-remote',
    title: 'Cybersecurity Consulting Services',
    description: 'Remote cybersecurity assessment and implementation services for Department of Defense systems.',
    agency: 'Department of Defense',
    naics_codes: '541511,541690',
    psc_codes: 'D310,R425',
    location: 'Remote',
    state: null,
    city: null,
    contract_value_min: 500000,
    contract_value_max: 750000,
    contract_type: 'Cost Plus',
    set_aside_type: '8(a)',
    status: 'Open',
    deadline_date: new Date('2025-10-20'),
    posted_date: new Date('2025-09-01'),
    response_date: new Date('2025-10-15'),
    solicitation_number: 'DOD-TEST-CYBER-001',
    source_url: 'https://test.gov/cyber',
    source_system: 'SAM.gov',
    createdAt: new Date(),
    updatedAt: new Date()
  } as RfqWithRelations
}

describe('RFQ Matching Algorithm', () => {
  describe('NAICS Code Matching', () => {
    it('should give perfect score for exact NAICS matches', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.itProject,
        testUsers.itConsultant
      )

      expect(result.factors.naics_match.score).toBe(100)
      expect(result.factors.naics_match.explanation).toContain('exact NAICS')
      expect(result.factors.naics_match.matched_codes).toEqual(['541511', '541512'])
    })

    it('should give lower score for industry group matches', async () => {
      // IT consultant looking at construction project (different industry)
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.constructionProject,
        testUsers.itConsultant
      )

      expect(result.factors.naics_match.score).toBeLessThan(50)
      expect(result.factors.naics_match.explanation).toContain('No NAICS code alignment')
    })

    it('should handle missing NAICS codes gracefully', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.incompleteProfile.id,
        testRfqs.itProject,
        testUsers.incompleteProfile
      )

      expect(result.factors.naics_match.score).toBe(0)
      expect(result.factors.naics_match.explanation).toContain('Add NAICS codes')
    })
  })

  describe('Location Matching', () => {
    it('should give perfect score for same city matches', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.itProject,
        testUsers.itConsultant
      )

      expect(result.factors.location_match.score).toBe(100)
      expect(result.factors.location_match.explanation).toContain('same city')
      expect(result.factors.location_match.distance_miles).toBe(0)
    })

    it('should give high score for remote opportunities', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.remoteProject,
        testUsers.itConsultant
      )

      expect(result.factors.location_match.score).toBe(100)
      expect(result.factors.location_match.explanation).toContain('Remote')
    })

    it('should give lower score for different states', async () => {
      // DC-based company looking at TX project
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.constructionProject,
        testUsers.itConsultant
      )

      expect(result.factors.location_match.score).toBeLessThan(80)
      expect(result.factors.location_match.explanation).toContain('region')
    })

    it('should handle missing location data', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.incompleteProfile.id,
        testRfqs.itProject,
        testUsers.incompleteProfile
      )

      expect(result.factors.location_match.score).toBe(70)
      expect(result.factors.location_match.explanation).toContain('Add location')
    })
  })

  describe('Capability Matching', () => {
    it('should find relevant capability matches in IT project', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.itProject,
        testUsers.itConsultant
      )

      expect(result.factors.capability_match.score).toBeGreaterThanOrEqual(30)
      expect(result.factors.capability_match.matching_keywords).toBeDefined()
    })

    it('should provide lower scores for mismatched capabilities', async () => {
      // IT consultant looking at construction project
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.constructionProject,
        testUsers.itConsultant
      )

      expect(result.factors.capability_match.score).toBeLessThan(60)
    })

    it('should handle incomplete capability data', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.incompleteProfile.id,
        testRfqs.itProject,
        testUsers.incompleteProfile
      )

      expect(result.factors.capability_match.score).toBe(50)
      expect(result.factors.capability_match.explanation).toContain('Complete your profile')
    })
  })

  describe('Business Size/Set-aside Matching', () => {
    it('should give perfect score for matching set-aside types', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.itProject, // Small Business set-aside
        testUsers.itConsultant
      )

      expect(result.factors.size_match.score).toBe(100)
      expect(result.factors.size_match.explanation).toContain('qualifies for Small Business')
      expect(result.factors.size_match.category_match).toBe(true)
    })

    it('should give perfect score for unrestricted competitions', async () => {
      const unrestrictedRfq = {
        ...testRfqs.itProject,
        set_aside_type: null
      }

      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        unrestrictedRfq,
        testUsers.itConsultant
      )

      expect(result.factors.size_match.score).toBe(100)
      expect(result.factors.size_match.explanation).toContain('Open competition')
    })

    it('should give lower score for non-qualifying set-asides', async () => {
      // Small business looking at 8(a) set-aside
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.remoteProject, // 8(a) set-aside
        testUsers.itConsultant
      )

      expect(result.factors.size_match.score).toBeLessThan(100)
      expect(result.factors.size_match.category_match).toBe(false)
    })

    it('should handle unknown business types gracefully', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.incompleteProfile.id,
        testRfqs.itProject,
        testUsers.incompleteProfile
      )

      expect(result.factors.size_match.score).toBe(75)
      expect(result.factors.size_match.explanation).toContain('verify your business qualification')
    })
  })

  describe('Profile Completeness Bonus', () => {
    it('should give full bonus for complete profiles', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.itProject,
        testUsers.itConsultant
      )

      expect(result.factors.profile_completeness.score).toBe(100)
      expect(result.factors.profile_completeness.explanation).toContain('Complete profile')
      expect(result.factors.profile_completeness.completion_percentage).toBe(100)
    })

    it('should give lower bonus for incomplete profiles', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.incompleteProfile.id,
        testRfqs.itProject,
        testUsers.incompleteProfile
      )

      expect(result.factors.profile_completeness.score).toBeLessThan(100)
      expect(result.factors.profile_completeness.explanation).toContain('add more details')
    })
  })

  describe('Overall Scoring', () => {
    it('should calculate weighted overall score correctly', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.itProject,
        testUsers.itConsultant
      )

      // Strong match scenario should score well  
      expect(result.overall_score).toBeGreaterThan(75)
      expect(result.overall_score).toBeLessThanOrEqual(100)

      // Verify weighted calculation
      const expectedScore = Math.round(
        (result.factors.naics_match.score * 0.35) +
        (result.factors.location_match.score * 0.20) +
        (result.factors.capability_match.score * 0.25) +
        (result.factors.size_match.score * 0.15) +
        (result.factors.profile_completeness.score * 0.05)
      )

      expect(result.overall_score).toBe(Math.min(100, expectedScore))
    })

    it('should provide lower scores for poor matches', async () => {
      // IT consultant looking at construction project
      const result = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.constructionProject,
        testUsers.itConsultant
      )

      expect(result.overall_score).toBeLessThan(60)
    })

    it('should provide meaningful recommendations', async () => {
      const result = await matchingService.calculateMatchingScore(
        testUsers.incompleteProfile.id,
        testRfqs.itProject,
        testUsers.incompleteProfile
      )

      expect(result.recommendations).toBeDefined()
      expect(result.recommendations.length).toBeGreaterThan(0)
      expect(result.recommendations.some(rec => 
        rec.includes('NAICS codes') || rec.includes('profile')
      )).toBe(true)
    })

    it('should handle edge cases gracefully', async () => {
      // Test with minimal data
      const minimalRfq = {
        ...testRfqs.itProject,
        naics_codes: '',
        psc_codes: null,
        location: null,
        state: null,
        set_aside_type: null
      }

      const result = await matchingService.calculateMatchingScore(
        testUsers.incompleteProfile.id,
        minimalRfq,
        testUsers.incompleteProfile
      )

      expect(result.overall_score).toBeGreaterThanOrEqual(0)
      expect(result.overall_score).toBeLessThanOrEqual(100)
      expect(result.recommendations).toBeDefined()
    })
  })

  describe('Performance and Validation', () => {
    it('should complete matching calculation within reasonable time', async () => {
      const startTime = Date.now()
      
      await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.itProject,
        testUsers.itConsultant
      )

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should return consistent results for same inputs', async () => {
      const result1 = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.itProject,
        testUsers.itConsultant
      )

      const result2 = await matchingService.calculateMatchingScore(
        testUsers.itConsultant.id,
        testRfqs.itProject,
        testUsers.itConsultant
      )

      expect(result1.overall_score).toBe(result2.overall_score)
      expect(result1.factors.naics_match.score).toBe(result2.factors.naics_match.score)
    })

    it('should handle invalid user profiles gracefully', async () => {
      const invalidUser = {
        ...testUsers.itConsultant,
        naics_codes: null,
        company_name: null
      } as UserProfile

      const result = await matchingService.calculateMatchingScore(
        invalidUser.id,
        testRfqs.itProject,
        invalidUser
      )

      expect(result.overall_score).toBeGreaterThanOrEqual(0)
      expect(result.recommendations).toBeDefined()
    })
  })
})

// Helper function to create test data for integration tests
export function createTestMatchingData() {
  return {
    users: testUsers,
    rfqs: testRfqs
  }
}