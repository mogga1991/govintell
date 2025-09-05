import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

import { authOptions } from '@/lib/auth'

const db = new PrismaClient()

// GET /api/rfqs/[id] - Get RFQ details
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

    // Get RFQ with user-specific data
    const rfq = await db.rfq.findUnique({
      where: { id: rfqId },
      include: {
        savedBy: {
          where: { userId: userId },
          select: { userId: true }
        },
        statusTracking: {
          where: { userId: userId },
          select: { status: true, updatedAt: true }
        }
      }
    })

    if (!rfq) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 404 }
      )
    }

    // Transform the response to match expected format
    const transformedRfq = {
      ...rfq,
      isSaved: rfq.savedBy.length > 0,
      userStatus: rfq.statusTracking[0] || null,
      savedBy: undefined, // Remove from response
      statusTracking: undefined // Remove from response
    }

    return NextResponse.json({
      success: true,
      rfq: transformedRfq
    })

  } catch (error) {
    console.error('Error fetching RFQ details:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch RFQ details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}