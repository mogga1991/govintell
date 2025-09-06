import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const paramsSchema = z.object({
  id: z.string()
})

// Save/bookmark an RFQ
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id: rfqId } = paramsSchema.parse(params)

    // Check if RFQ exists
    const rfq = await db.rfq.findUnique({
      where: { id: rfqId },
      select: { id: true, title: true }
    })

    if (!rfq) {
      return NextResponse.json(
        { error: "RFQ not found" },
        { status: 404 }
      )
    }

    // Check if already saved
    const existingSave = await db.savedRfq.findUnique({
      where: {
        userId_rfqId: {
          userId: session.user.id,
          rfqId: rfqId
        }
      }
    })

    if (existingSave) {
      return NextResponse.json(
        { success: true, message: "RFQ already saved", saved: true },
        { status: 200 }
      )
    }

    // Save the RFQ
    const savedRfq = await db.savedRfq.create({
      data: {
        userId: session.user.id,
        rfqId: rfqId,
        folder: null, // Default folder
        priority: "Medium" // Default priority
      }
    })

    return NextResponse.json({
      success: true,
      message: "RFQ saved successfully",
      saved: true,
      data: {
        id: savedRfq.id,
        folder: savedRfq.folder,
        priority: savedRfq.priority,
        createdAt: savedRfq.createdAt
      }
    })

  } catch (error) {
    console.error('Save RFQ error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid RFQ ID", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Remove RFQ from saved/bookmarks
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id: rfqId } = paramsSchema.parse(params)

    // Find and delete the saved RFQ
    const deletedSave = await db.savedRfq.deleteMany({
      where: {
        userId: session.user.id,
        rfqId: rfqId
      }
    })

    if (deletedSave.count === 0) {
      return NextResponse.json(
        { success: true, message: "RFQ was not saved", saved: false },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "RFQ removed from saved list",
      saved: false
    })

  } catch (error) {
    console.error('Unsave RFQ error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid RFQ ID", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'