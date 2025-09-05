import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { userProfileUpdateSchema } from "@/lib/validations/user"
import { checkProfileCompletion } from "@/lib/user"

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
        name: true,
        email: true,
        company_name: true,
        naics_codes: true,
        psc_codes: true,
        profile_completed: true,
        business_verified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "USER_NOT_FOUND" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = userProfileUpdateSchema.parse(body)

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        company_name: true,
        naics_codes: true,
        psc_codes: true,
        profile_completed: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found", code: "USER_NOT_FOUND" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name
    }
    
    if (validatedData.company_name !== undefined) {
      updateData.company_name = validatedData.company_name
    }
    
    if (validatedData.naics_codes !== undefined) {
      updateData.naics_codes = validatedData.naics_codes
    }
    
    if (validatedData.psc_codes !== undefined) {
      updateData.psc_codes = validatedData.psc_codes
    }

    // Calculate profile completion status
    const updatedUser = { ...existingUser, ...updateData }
    const profileStatus = checkProfileCompletion(updatedUser as any)
    updateData.profile_completed = profileStatus.isComplete

    // Update user
    const user = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        company_name: true,
        naics_codes: true,
        psc_codes: true,
        profile_completed: true,
        business_verified: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      user,
      profile_status: {
        profile_completed: profileStatus.isComplete,
        missing_fields: profileStatus.missingFields,
        completion_percentage: profileStatus.completionPercentage,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return NextResponse.json(
        {
          error: firstError.message,
          code: "VALIDATION_ERROR",
          field: firstError.path[0],
        },
        { status: 400 }
      )
    }

    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}