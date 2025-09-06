import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

import { authOptions } from '@/lib/auth'
import { rfqMatchingService } from '@/lib/rfq-matching'

const db = new PrismaClient()

// POST /api/rfqs/[id]/calculate-match
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Mock user for development
    const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
    const userId = mockUser.id

    const resolvedParams = await params
    const rfqId = resolvedParams.id

    // Validate RFQ exists
    const rfq = await db.rfq.findUnique({
      where: { id: rfqId }
    })

    if (!rfq) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      )
    }

    // Get user profile
    const userProfile = await db.user.findUnique({
      where: { id: userId }
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Calculate matching score
    const matchingResult = await rfqMatchingService.calculateMatchingScore(
      session.user.id,
      rfq,
      userProfile
    )

    // Cache the result in database
    await db.rfqMatchScore.upsert({
      where: {
        userId_rfqId: {
          userId: session.user.id,
          rfqId: rfqId
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
        rfqId: rfqId,
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

    return NextResponse.json({
      success: true,
      matching_result: matchingResult,
      cached_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error calculating RFQ match:', error)
    return NextResponse.json(
      { 
        error: 'Failed to calculate matching score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/rfqs/[id]/calculate-match - Get cached matching score
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Mock user for development
    const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
    const userId = mockUser.id

    const resolvedParams = await params
    const rfqId = resolvedParams.id

    // Get cached matching score
    const cachedScore = await db.rfqMatchScore.findUnique({
      where: {
        userId_rfqId: {
          userId: userId,
          rfqId: rfqId
        }
      }
    })

    if (!cachedScore) {
      return NextResponse.json(
        { error: 'No cached matching score found. Use POST to calculate.' },
        { status: 404 }
      )
    }

    // Parse the detailed breakdown if available
    let detailedBreakdown = null
    if (cachedScore.score_breakdown) {
      try {
        detailedBreakdown = JSON.parse(cachedScore.score_breakdown)
      } catch (error) {
        console.warn('Failed to parse score breakdown:', error)
      }
    }

    return NextResponse.json({
      success: true,
      matching_score: {
        overall_score: cachedScore.overall_score,
        naics_score: cachedScore.naics_score,
        psc_score: cachedScore.psc_score,
        location_score: cachedScore.location_score,
        value_score: cachedScore.value_score,
        experience_score: cachedScore.experience_score,
        matching_naics: cachedScore.matching_naics?.split(',') || [],
        matching_psc: cachedScore.matching_psc?.split(',') || [],
        detailed_breakdown: detailedBreakdown,
        calculated_at: cachedScore.createdAt,
        updated_at: cachedScore.updatedAt
      }
    })

  } catch (error) {
    console.error('Error retrieving matching score:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve matching score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}