import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { checkProfileCompletion } from "@/lib/user"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        company_name: true,
        naics_codes: true,
        profile_completed: true,
        business_verified: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "USER_NOT_FOUND" },
        { status: 404 }
      )
    }

    // Calculate profile completion status
    const profileStatus = checkProfileCompletion(user as any)

    return NextResponse.json({
      success: true,
      profile_completed: profileStatus.isComplete,
      business_verified: user.business_verified,
      missing_fields: profileStatus.missingFields,
      completion_percentage: profileStatus.completionPercentage,
      required_fields: ["company_name", "naics_codes"],
    })
  } catch (error) {
    console.error("Profile status error:", error)
    return NextResponse.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}