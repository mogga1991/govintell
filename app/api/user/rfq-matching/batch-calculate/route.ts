import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

import { authOptions } from '@/lib/auth'
import { rfqMatchingService } from '@/lib/rfq-matching'

const db = new PrismaClient()

// POST /api/user/rfq-matching/batch-calculate
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { rfq_ids, force_recalculate = false } = body

    if (!Array.isArray(rfq_ids) || rfq_ids.length === 0) {
      return NextResponse.json(
        { error: 'rfq_ids array is required' },
        { status: 400 }
      )
    }

    if (rfq_ids.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 RFQs can be processed at once' },
        { status: 400 }
      )
    }

    // Get user profile once
    const userProfile = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get existing cached scores if not forcing recalculation
    const existingScores = force_recalculate ? [] : await db.rfqMatchScore.findMany({
      where: {
        userId: session.user.id,
        rfqId: { in: rfq_ids }
      }
    })

    const existingRfqIds = new Set(existingScores.map(score => score.rfqId))
    const rfqIdsToCalculate = rfq_ids.filter(id => !existingRfqIds.has(id))

    // Get RFQs that need calculation
    const rfqsToProcess = await db.rfq.findMany({
      where: { 
        id: { in: force_recalculate ? rfq_ids : rfqIdsToCalculate }
      }
    })

    const results: any[] = []
    const errors: any[] = []

    // Process in smaller batches to avoid overwhelming the system
    const batchSize = 10
    for (let i = 0; i < rfqsToProcess.length; i += batchSize) {
      const batch = rfqsToProcess.slice(i, i + batchSize)
      
      // Process batch in parallel
      const batchPromises = batch.map(async (rfq) => {
        try {
          // Calculate matching score
          const matchingResult = await rfqMatchingService.calculateMatchingScore(
            session.user.id,
            rfq,
            userProfile
          )

          // Cache the result
          const cachedScore = await db.rfqMatchScore.upsert({
            where: {
              userId_rfqId: {
                userId: session.user.id,
                rfqId: rfq.id
              }
            },
            update: {
              overall_score: matchingResult.overall_score,
              naics_score: matchingResult.factors.naics_match.score,
              psc_score: matchingResult.factors.capability_match.score,
              location_score: matchingResult.factors.location_match.score,
              value_score: matchingResult.factors.size_match.score,
              experience_score: matchingResult.factors.profile_completeness.score,
              matching_naics: matchingResult.factors.naics_match.matched_codes?.join(',') || null,
              matching_psc: matchingResult.factors.capability_match.matching_keywords?.join(',') || null,
              score_breakdown: JSON.stringify(matchingResult),
              updatedAt: new Date()
            },
            create: {
              userId: session.user.id,
              rfqId: rfq.id,
              overall_score: matchingResult.overall_score,
              naics_score: matchingResult.factors.naics_match.score,
              psc_score: matchingResult.factors.capability_match.score,
              location_score: matchingResult.factors.location_match.score,
              value_score: matchingResult.factors.size_match.score,
              experience_score: matchingResult.factors.profile_completeness.score,
              matching_naics: matchingResult.factors.naics_match.matched_codes?.join(',') || null,
              matching_psc: matchingResult.factors.capability_match.matching_keywords?.join(',') || null,
              score_breakdown: JSON.stringify(matchingResult)
            }
          })

          return {
            rfq_id: rfq.id,
            rfq_title: rfq.title,
            overall_score: matchingResult.overall_score,
            calculated: true,
            cached_at: cachedScore.updatedAt || cachedScore.createdAt
          }

        } catch (error) {
          console.error(`Error calculating match for RFQ ${rfq.id}:`, error)
          return {
            rfq_id: rfq.id,
            rfq_title: rfq.title,
            error: error instanceof Error ? error.message : 'Unknown error',
            calculated: false
          }
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.calculated) {
            results.push(result.value)
          } else {
            errors.push(result.value)
          }
        } else {
          errors.push({
            error: result.reason instanceof Error ? result.reason.message : 'Batch processing error',
            calculated: false
          })
        }
      })

      // Small delay between batches to prevent overwhelming the database
      if (i + batchSize < rfqsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Include existing cached scores in response
    const existingResults = existingScores.map(score => ({
      rfq_id: score.rfqId,
      overall_score: score.overall_score,
      calculated: false, // These were already calculated
      cached_at: score.updatedAt || score.createdAt
    }))

    const allResults = [...results, ...existingResults]

    return NextResponse.json({
      success: true,
      summary: {
        total_requested: rfq_ids.length,
        newly_calculated: results.length,
        already_cached: existingResults.length,
        errors: errors.length
      },
      results: allResults.sort((a, b) => b.overall_score - a.overall_score), // Sort by score descending
      errors: errors.length > 0 ? errors : undefined,
      processing_time: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in batch matching calculation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process batch matching calculation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/user/rfq-matching/batch-calculate - Get user's cached matching scores
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const minScore = searchParams.get('min_score') ? parseInt(searchParams.get('min_score')!) : 0
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const includeBreakdown = searchParams.get('include_breakdown') === 'true'

    // Get cached scores with RFQ details
    const matchingScores = await db.rfqMatchScore.findMany({
      where: {
        userId: session.user.id,
        overall_score: { gte: minScore }
      },
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            agency: true,
            location: true,
            deadline_date: true,
            contract_value_min: true,
            contract_value_max: true,
            set_aside_type: true,
            status: true
          }
        }
      },
      orderBy: { overall_score: 'desc' },
      take: limit
    })

    const results = matchingScores.map(score => ({
      rfq: score.rfq,
      matching_score: {
        overall_score: score.overall_score,
        naics_score: score.naics_score,
        psc_score: score.psc_score,
        location_score: score.location_score,
        value_score: score.value_score,
        experience_score: score.experience_score,
        matching_naics: score.matching_naics?.split(',') || [],
        matching_psc: score.matching_psc?.split(',') || [],
        detailed_breakdown: includeBreakdown && score.score_breakdown ? 
          JSON.parse(score.score_breakdown) : undefined,
        calculated_at: score.createdAt,
        updated_at: score.updatedAt
      }
    }))

    return NextResponse.json({
      success: true,
      total_matches: matchingScores.length,
      results,
      filters: {
        min_score: minScore,
        limit,
        include_breakdown: includeBreakdown
      }
    })

  } catch (error) {
    console.error('Error retrieving batch matching scores:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve matching scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}