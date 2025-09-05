import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

describe('RFQ Seeding Integration', () => {
  beforeAll(async () => {
    // Ensure we have some seeded data to test against
    const existingRfqCount = await db.rfq.count()
    if (existingRfqCount === 0) {
      console.log('No RFQs found - run "npm run seed-rfqs:clear" first')
    }
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  describe('Seeded RFQ Data', () => {
    it('should have RFQs in the database', async () => {
      const rfqCount = await db.rfq.count()
      expect(rfqCount).toBeGreaterThan(0)
    })

    it('should have RFQs with required fields populated', async () => {
      const rfqs = await db.rfq.findMany({ take: 5 })
      
      expect(rfqs.length).toBeGreaterThan(0)
      
      for (const rfq of rfqs) {
        expect(rfq.title).toBeTruthy()
        expect(rfq.agency).toBeTruthy()
        expect(rfq.solicitation_number).toBeTruthy()
        expect(rfq.naics_codes).toBeTruthy()
        expect(rfq.deadline_date).toBeInstanceOf(Date)
        expect(rfq.posted_date).toBeInstanceOf(Date)
        expect(rfq.status).toBeTruthy()
      }
    })

    it('should have diverse agencies represented', async () => {
      const agencies = await db.rfq.groupBy({
        by: ['agency'],
        _count: { agency: true }
      })
      
      expect(agencies.length).toBeGreaterThan(3)
      
      // Check for some expected agencies
      const agencyNames = agencies.map(a => a.agency)
      expect(agencyNames).toContain('Department of Commerce')
      expect(agencyNames).toContain('Department of Defense')
    })

    it('should have RFQs with varying contract values', async () => {
      const rfqs = await db.rfq.findMany({
        where: {
          contract_value_min: { not: null },
          contract_value_max: { not: null }
        }
      })
      
      expect(rfqs.length).toBeGreaterThan(0)
      
      // Check for diversity in contract values
      const values = rfqs.map(rfq => Number(rfq.contract_value_max))
      const maxValue = Math.max(...values)
      const minValue = Math.min(...values)
      
      expect(maxValue).toBeGreaterThan(minValue)
      expect(maxValue).toBeGreaterThan(10000000) // Should have some large contracts
      expect(minValue).toBeGreaterThan(100000) // Should have reasonable minimum values
    })

    it('should have proper NAICS and PSC codes format', async () => {
      const rfqs = await db.rfq.findMany({ take: 5 })
      
      for (const rfq of rfqs) {
        // NAICS codes should be comma-separated 6-digit codes
        const naicsCodes = rfq.naics_codes.split(',')
        expect(naicsCodes.length).toBeGreaterThan(0)
        
        for (const code of naicsCodes) {
          const trimmedCode = code.trim()
          expect(trimmedCode).toMatch(/^\d{6}$/)
        }
        
        // PSC codes should exist and be comma-separated
        if (rfq.psc_codes) {
          const pscCodes = rfq.psc_codes.split(',')
          expect(pscCodes.length).toBeGreaterThan(0)
          
          for (const code of pscCodes) {
            const trimmedCode = code.trim()
            expect(trimmedCode.length).toBeGreaterThan(0)
          }
        }
      }
    })
  })

  describe('Seeded Matching Scores', () => {
    it('should have sample matching scores', async () => {
      const matchingScores = await db.rfqMatchScore.count()
      expect(matchingScores).toBeGreaterThan(0)
    })

    it('should have realistic matching score values', async () => {
      const scores = await db.rfqMatchScore.findMany({ take: 5 })
      
      for (const score of scores) {
        expect(score.overall_score).toBeGreaterThanOrEqual(0)
        expect(score.overall_score).toBeLessThanOrEqual(100)
        expect(score.naics_score).toBeGreaterThanOrEqual(0)
        expect(score.naics_score).toBeLessThanOrEqual(100)
      }
    })

    it('should link matching scores to existing RFQs', async () => {
      const scores = await db.rfqMatchScore.findMany({ take: 3 })
      
      expect(scores.length).toBeGreaterThan(0)
      
      for (const score of scores) {
        // Verify the RFQ exists
        const rfq = await db.rfq.findUnique({
          where: { id: score.rfqId }
        })
        expect(rfq).toBeTruthy()
        expect(rfq?.title).toBeTruthy()
      }
    })
  })

  describe('Seeded User Tracking Data', () => {
    it('should have sample RFQ status tracking', async () => {
      const statusCount = await db.rfqStatus.count()
      expect(statusCount).toBeGreaterThan(0)
    })

    it('should have sample saved RFQs', async () => {
      const savedCount = await db.savedRfq.count()
      expect(savedCount).toBeGreaterThan(0)
    })

    it('should have valid status values', async () => {
      const statuses = await db.rfqStatus.findMany({ take: 5 })
      const validStatuses = ['watched', 'applied', 'submitted', 'won', 'lost']
      
      for (const status of statuses) {
        expect(validStatuses).toContain(status.status)
        expect(status.userId).toBeTruthy()
        expect(status.rfqId).toBeTruthy()
      }
    })

    it('should link tracking data to existing RFQs', async () => {
      const trackingData = await db.rfqStatus.findMany({ take: 3 })
      
      expect(trackingData.length).toBeGreaterThan(0)
      
      for (const tracking of trackingData) {
        // Verify the RFQ exists
        const rfq = await db.rfq.findUnique({
          where: { id: tracking.rfqId }
        })
        expect(rfq).toBeTruthy()
        expect(rfq?.title).toBeTruthy()
      }
    })
  })

  describe('Data Integrity', () => {
    it('should have no orphaned matching scores', async () => {
      // Check that all matching scores reference valid RFQs
      const scores = await db.rfqMatchScore.findMany()
      
      for (const score of scores) {
        const rfq = await db.rfq.findUnique({
          where: { id: score.rfqId }
        })
        expect(rfq).toBeTruthy()
      }
      
      expect(scores.length).toBeGreaterThan(0)
    })

    it('should have no orphaned status tracking', async () => {
      // Check that all status tracking references valid RFQs
      const statuses = await db.rfqStatus.findMany()
      
      for (const status of statuses) {
        const rfq = await db.rfq.findUnique({
          where: { id: status.rfqId }
        })
        expect(rfq).toBeTruthy()
      }
      
      expect(statuses.length).toBeGreaterThan(0)
    })

    it('should have unique solicitation numbers', async () => {
      const solicitationNumbers = await db.rfq.findMany({
        select: { solicitation_number: true }
      })
      
      const uniqueNumbers = new Set(solicitationNumbers.map(r => r.solicitation_number))
      expect(uniqueNumbers.size).toBe(solicitationNumbers.length)
    })

    it('should have realistic date ranges', async () => {
      const rfqs = await db.rfq.findMany({
        select: {
          posted_date: true,
          deadline_date: true,
          response_date: true
        }
      })
      
      for (const rfq of rfqs) {
        expect(rfq.deadline_date.getTime()).toBeGreaterThan(rfq.posted_date.getTime())
        
        if (rfq.response_date) {
          expect(rfq.deadline_date.getTime()).toBeGreaterThanOrEqual(rfq.response_date.getTime())
        }
      }
    })
  })
})

// Helper function to get seeding statistics
export async function getSeedingStats() {
  const stats = {
    rfqs: await db.rfq.count(),
    agencies: await db.rfq.groupBy({
      by: ['agency'],
      _count: { agency: true }
    }),
    matchingScores: await db.rfqMatchScore.count(),
    userTracking: await db.rfqStatus.count(),
    savedRfqs: await db.savedRfq.count(),
    contractValues: await db.rfq.aggregate({
      _min: { contract_value_min: true },
      _max: { contract_value_max: true },
      _avg: { contract_value_min: true }
    })
  }
  
  return stats
}